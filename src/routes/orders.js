const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', async (req,res)=>{
  const { user_id, items, shipping_address, payment_info } = req.body;
  const client = await db.pool.connect();
  try{
    await client.query('BEGIN');
    let total = 0;
    for(const it of items){
      const p = await client.query('SELECT id,price,stock FROM products WHERE id=$1 FOR UPDATE', [it.product_id]);
      if(p.rows.length===0) throw new Error('Product not found: ' + it.product_id);
      const prod = p.rows[0];
      if(prod.stock < it.quantity) throw new Error('Out of stock for product ' + it.product_id);
      total += Number(prod.price) * it.quantity;
    }
    const orderRes = await client.query('INSERT INTO orders (user_id,total,shipping_address,payment_info) VALUES ($1,$2,$3,$4) RETURNING id,created_at',
      [user_id,total,shipping_address||null,payment_info||null]);
    const orderId = orderRes.rows[0].id;
    for(const it of items){
      const p = await client.query('SELECT price FROM products WHERE id=$1', [it.product_id]);
      const unit = p.rows[0].price;
      await client.query('INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES ($1,$2,$3,$4)', [orderId,it.product_id,it.quantity,unit]);
      await client.query('UPDATE products SET stock = stock - $1 WHERE id=$2', [it.quantity, it.product_id]);
    }
    await client.query('COMMIT');
    res.json({ ok: true, orderId, created_at: orderRes.rows[0].created_at });
  }catch(err){
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message });
  }finally{
    client.release();
  }
});

router.get('/user/:userId', async (req,res)=>{
  const userId = req.params.userId;
  try{
    const { rows } = await db.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY id DESC', [userId]);
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
