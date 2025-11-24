const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const sellersRouter = require('./routes/sellers');
const authRouter = require('./routes/auth');

const { swaggerUi, swaggerSpec } = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/sellers', sellersRouter);

app.get('/', (req, res) => res.json({ ok: true, message: 'E-commerce API' }));

module.exports = app;
