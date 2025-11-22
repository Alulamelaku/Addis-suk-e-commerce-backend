const express = require('express');
const db = require('../db');
const router = express.Router();
const authenticateToken = require('../middleware/auth')();

router.post('/', authenticateToken, async (req, res) => {
    const {name, user_id } = req.body;
   console.log("Hello");
  try{
    const { rows } = await db.query('INSERT INTO sellers (user_id,name) VALUES ($1,$2) RETURNING *', [user_id,name]);
    res.json(rows[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/', async (req,res)=>{
  try{
    const { rows } = await db.query('SELECT * FROM sellers ORDER BY id DESC LIMIT 100');
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
