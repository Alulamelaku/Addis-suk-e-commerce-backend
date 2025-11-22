const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (req,res)=>{
  try{
    const { rows } = await db.query('SELECT * FROM products ORDER BY id DESC LIMIT 100');
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.get('/:id', async (req,res)=>{
  const id = req.params.id;
  try{
    const { rows } = await db.query('SELECT * FROM products WHERE id=$1', [id]);
    if(rows.length===0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

router.post('/', async (req,res)=>{
  const { seller_id, title, description, price, stock, sku } = req.body;
  try{
    const { rows } = await db.query('INSERT INTO products (seller_id,title,description,price,stock,sku) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [seller_id,title,description,price,stock||0,sku]);
    res.json(rows[0]);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
