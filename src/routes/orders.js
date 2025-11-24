const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order processing and retrieval APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItemInput:
 *       type: object
 *       properties:
 *         product_id:
 *           type: integer
 *         quantity:
 *           type: integer
 *     OrderInput:
 *       type: object
 *       properties:
 *         user_id:
 *           type: integer
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemInput'
 *         shipping_address:
 *           type: string
 *         payment_info:
 *           type: string
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         total:
 *           type: number
 *         shipping_address:
 *           type: string
 *         payment_info:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderInput'
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 orderId:
 *                   type: integer
 *                 created_at:
 *                   type: string
 *       400:
 *         description: Bad Request / Out of stock / Product not found
 */
router.post('/', async (req,res)=>{
  const { user_id, items, shipping_address, payment_info } = req.body;
  const client = await db.pool.connect();
  try{
    await client.query('BEGIN');
    
    let total = 0;

    // Validate items & lock products
    for (const it of items) {
      const p = await client.query(
        'SELECT id,price,stock FROM products WHERE id=$1 FOR UPDATE',
        [it.product_id]
      );

      if (p.rows.length === 0)
        throw new Error('Product not found: ' + it.product_id);

      const prod = p.rows[0];

      if (prod.stock < it.quantity)
        throw new Error('Out of stock for product ' + it.product_id);

      total += Number(prod.price) * it.quantity;
    }

    // Create order
    const orderRes = await client.query(
      'INSERT INTO orders (user_id,total,shipping_address,payment_info) VALUES ($1,$2,$3,$4) RETURNING id,created_at',
      [user_id, total, shipping_address || null, payment_info || null]
    );

    const orderId = orderRes.rows[0].id;

    // Insert order items & reduce stock
    for (const it of items) {
      const p = await client.query(
        'SELECT price FROM products WHERE id=$1',
        [it.product_id]
      );

      const unit = p.rows[0].price;

      await client.query(
        'INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES ($1,$2,$3,$4)',
        [orderId, it.product_id, it.quantity, unit]
      );

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id=$2',
        [it.quantity, it.product_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      ok: true,
      orderId,
      created_at: orderRes.rows[0].created_at
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     summary: Get all orders for a specific user
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', async (req,res)=>{
  const userId = req.params.userId;
  try{
    const { rows } = await db.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY id DESC',
      [userId]
    );
    res.json(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
