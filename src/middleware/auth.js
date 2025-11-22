const jwt = require('jsonwebtoken');
require('dotenv').config();


const JWT_SECRET = process.env.JWT_SECRET || 'secret';
function auth(required=true){


const token = jwt.sign(
  {"user_id": 1, "name": "Melaku b"},
JWT_SECRET
);

  return (req,res,next)=>{
      const authHeader = req.headers.authorization;
      console.log(authHeader);
      const body = req.body;
      console.log(body);
   
    if (!authHeader) {
if (!required) return next(); 
return res.status(401).json({ error: 'No token provided' });
}


const parts = authHeader.split(' ');
if (parts.length !== 2) return res.status(401).json({ error: 'Invalid token format' });

const token = parts[1];
console.log("token:  " + token);



try {
const payload = jwt.verify(token, JWT_SECRET);
console.log(payload);
req.user = payload; 
next();
} catch (err) {
console.error('JWT verification error:', err.message);
console.log(err.message);
return res.status(401).json({ error: 'Invalid or expired token' });
}
};
}


module.exports = auth;