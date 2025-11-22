const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await db.query('SELECT id,name,email,role,created_at FROM users WHERE id=$1', [id]);
    if(rows.length===0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
