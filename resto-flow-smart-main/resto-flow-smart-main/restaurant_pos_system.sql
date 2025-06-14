-- Create the database
CREATE DATABASE IF NOT EXISTS restaurant_pos_system;
USE restaurant_pos_system;

-- Users table (Admin/Staff)
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin', 'staff') NOT NULL
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('starter', 'main', 'dessert', 'drinks') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  order_type ENUM('dine-in', 'take-out', 'delivery') NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  order_date_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by_user VARCHAR(50) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (created_by_user) REFERENCES users(username)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);
-- Payments table
CREATE TABLE payment (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  card_id VARCHAR(100),
  card_holder_name VARCHAR(100),
  card_last4 VARCHAR(4),
  card_expiry VARCHAR(10),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
-- Optional: Insert demo users (you can change password logic later)
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'),
('staff', 'staff123', 'staff');
