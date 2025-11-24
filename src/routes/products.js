const express = require('express');
const db = require('../db');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         seller_id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         sku:
 *           type: string
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Returns the latest 100 products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', async (req,res)=>{
  try{
    const { rows } = await db.query('SELECT * FROM products ORDER BY id DESC LIMIT 100');
    res.json(rows);
  }catch(err){ 
    console.error(err); 
    res.status(500).json({ error: 'Server error' }); 
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', async (req,res)=>{
  const id = req.params.id;
  try{
    const { rows } = await db.query('SELECT * FROM products WHERE id=$1', [id]);
    if(rows.length===0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  }catch(err){ 
    console.error(err); 
    res.status(500).json({ error: 'Server error' }); 
  }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seller_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               sku:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post('/', async (req,res)=>{
  const { seller_id, title, description, price, stock, sku } = req.body;
  try{
    const { rows } = await db.query(
      'INSERT INTO products (seller_id,title,description,price,stock,sku) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [seller_id,title,description,price,stock||0,sku]
    );
    res.json(rows[0]);
  }catch(err){ 
    console.error(err); 
    res.status(500).json({ error: 'Server error' }); 
  }
});

module.exports = router;
