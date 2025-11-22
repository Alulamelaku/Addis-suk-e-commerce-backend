-- schema for ecommerce starter
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT DEFAULT 'buyer',
  -- buyer, seller, admin
  Status TEXT DEFAULT 'active',
  secretCode TEXT DEFAULT 'suk',
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES sellers(id) ON DELETE
  SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE
  SET NULL,
    total NUMERIC(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address JSONB,
    payment_info JSONB,
    created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL
);
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE
  SET NULL
);
INSERT INTO products (seller_id, title, description, price, stock, sku)
VALUES (
    2,
    'Samsung Phone',
    'Samsung Ultra 24',
    1100,
    30,
    'V.good'
  ),
  (
    3,
    'iPhone 15',
    'Apple iPhone 15 Pro',
    1500,
    25,
    'New'
  ),
  (
    2,
    'Xiaomi Redmi',
    'Redmi Note 13',
    500,
    50,
    'Good'
  ),
  (
    4,
    'OnePlus 12',
    'OnePlus 12T',
    1200,
    20,
    'Excellent'
  );