import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'restaurant_pos_system',
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const runQuery = async (query, params = []) => {
  const connection = await pool.getConnection();
  const [results] = await connection.execute(query, params);
  connection.release();
  return results;
};

// Login API
app.post('/api/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const result = await runQuery(
      'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?',
      [username, password, role]
    );
    if (result.length > 0) {
      res.json({ success: true, user: result[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Menu API
app.get('/api/menu', async (_, res) => {
  try {
    const items = await runQuery('SELECT * FROM menu_items');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  const { name, category, price, is_available } = req.body;
  try {
    await runQuery(
      'INSERT INTO menu_items (name, category, price, is_available) VALUES (?, ?, ?, ?)',
      [name, category, price, is_available]
    );
    res.json({ message: 'Menu item added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customers API
app.get('/api/customers', async (_, res) => {
  try {
    const customers = await runQuery('SELECT * FROM customers');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders API
app.post('/api/orders', async (req, res) => {
  const { customer, orderType, total, createdBy, cart } = req.body;
  try {
    const [existing] = await runQuery(
      'SELECT customer_id FROM customers WHERE name = ? AND phone = ?',
      [customer.name, customer.phone]
    );

    let customerId = existing?.customer_id;
    if (!customerId) {
      const result = await runQuery(
        'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
        [customer.name, customer.phone, customer.address]
      );
      customerId = result.insertId;
    }

    const orderRes = await runQuery(
      'INSERT INTO orders (customer_id, order_type, total_price, order_date_time, created_by_user) VALUES (?, ?, ?, NOW(), ?)',
      [customerId, orderType, total, createdBy]
    );
    const orderId = orderRes.insertId;

    for (const item of cart) {
      await runQuery(
        'INSERT INTO order_items (order_id, item_id, quantity) VALUES (?, ?, ?)',
        [orderId, item.item_id, item.quantity]
      );
    }

    res.json({ message: 'Order placed successfully', orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments API
app.post('/api/payment', async (req, res) => {
  const { customer, card } = req.body;

  try {
    const [existing] = await runQuery(
      'SELECT customer_id FROM customers WHERE name = ? AND phone = ?',
      [customer.name, customer.phone]
    );

    const customerId = existing?.customer_id;
    if (!customerId) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    const last4 = card.card_number?.slice(-4) || '';
    await runQuery(
      `INSERT INTO payment (customer_id, card_id, card_holder_name, card_last4, card_expiry)
       VALUES (?, ?, ?, ?, ?)`,
      [customerId, card.card_id || '', card.card_holder_name || '', last4, card.card_expiry || '']
    );

    res.json({ message: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders List API
app.get('/api/orders', async (_, res) => {
  try {
    const orders = await runQuery(`
      SELECT o.*, c.name AS customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      ORDER BY o.order_date_time DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
