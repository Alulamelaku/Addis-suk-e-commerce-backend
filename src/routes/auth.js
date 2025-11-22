const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const activity = require("../middleware/activity");
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await db.query('INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role', [name,email,hash,role||'buyer']);
    const user = rows[0];
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query('SELECT id,name,email,password_hash,role FROM users WHERE email=$1', [email]);
    if(rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET);
    delete user.password_hash;
    res.json({ user, token });

console.log("test log act");


activity({
    user_id: user.id,
    action: "LOGIN",
    description: "User logged in succesfully",
    ip: req.ip,
    agent: req.headers["user-agent"],
  });
  

console.log("test log act final");
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
