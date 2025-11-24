/**
 * @swagger
 * tags:
 *   name: Sellers
 *   description: Seller management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Seller:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */

const express = require('express');
const db = require('../db');
const router = express.Router();
const authenticateToken = require('../middleware/auth')();

/**
 * @swagger
 * /sellers:
 *   post:
 *     summary: Create a new seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - user_id
 *             properties:
 *               name:
 *                 type: string
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Seller created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, async (req, res) => {
    const { name, user_id } = req.body;
    console.log("Hello");

    try {
        const { rows } = await db.query(
            'INSERT INTO sellers (user_id, name) VALUES ($1, $2) RETURNING *',
            [user_id, name]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /sellers:
 *   get:
 *     summary: Get all sellers
 *     tags: [Sellers]
 *     responses:
 *       200:
 *         description: List of sellers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seller'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM sellers ORDER BY id DESC LIMIT 100'
        );
        res.json(rows);
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: 'Server error' }); 
    }
});

module.exports = router;
