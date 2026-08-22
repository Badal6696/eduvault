-- EduVault Cloudflare D1 Database Schema
-- Run: wrangler d1 execute eduvault-db --file=schema.sql

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  img TEXT,
  pdf TEXT,
  kicker TEXT DEFAULT 'Product',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  img TEXT,
  pdf TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  razorpay_payment_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  items TEXT,
  total INTEGER,
  status TEXT DEFAULT 'completed',
  access_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact table (single row)
CREATE TABLE IF NOT EXISTS contact (
  id INTEGER PRIMARY KEY DEFAULT 1,
  heading TEXT DEFAULT 'Get in Touch',
  description TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Footer table (single row)
CREATE TABLE IF NOT EXISTS footer (
  id INTEGER PRIMARY KEY DEFAULT 1,
  col1_title TEXT DEFAULT 'EduVault',
  col1_desc TEXT DEFAULT 'Premium digital products & courses.',
  email TEXT,
  phone TEXT,
  copyright TEXT DEFAULT '© 2026 EduVault. All rights reserved.',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Credentials table (single row)
CREATE TABLE IF NOT EXISTS credentials (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT DEFAULT 'admin',
  password TEXT DEFAULT 'admin123',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Social media links table
CREATE TABLE IF NOT EXISTS social (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hero banner table (single row)
CREATE TABLE IF NOT EXISTS hero_banner (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title TEXT DEFAULT 'Transform Your Learning Journey',
  description TEXT DEFAULT 'Discover premium courses and digital products designed to accelerate your success.',
  btn1_text TEXT DEFAULT 'Explore Courses',
  btn1_link TEXT DEFAULT '#dynamic-courses',
  btn2_text TEXT DEFAULT 'Contact Us',
  btn2_link TEXT DEFAULT '#contact-page-section',
  image TEXT DEFAULT 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Features table
CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  icon TEXT DEFAULT '✓',
  title TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Features title table (single row)
CREATE TABLE IF NOT EXISTS features_title (
  id INTEGER PRIMARY KEY DEFAULT 1,
  title TEXT DEFAULT 'Why Choose EduVault?',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  contact TEXT NOT NULL,
  state TEXT,
  city TEXT,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
INSERT OR IGNORE INTO contact (id, heading, description, email, phone, address)
VALUES (1, 'Get in Touch', 'We''d love to hear from you.', 'info@eduvault.com', '+91 98765 43210', 'Mumbai, India');

INSERT OR IGNORE INTO footer (id, col1_title, col1_desc, email, phone, copyright)
VALUES (1, 'EduVault', 'Premium digital products & courses.', 'info@eduvault.com', '+91 98765 43210', '© 2026 EduVault. All rights reserved.');

INSERT OR IGNORE INTO credentials (id, username, password)
VALUES (1, 'admin', 'admin123');

INSERT OR IGNORE INTO hero_banner (id, title, description, btn1_text, btn1_link, btn2_text, btn2_link, image)
VALUES (1, 'Transform Your Learning Journey', 'Discover premium courses and digital products designed to accelerate your success.', 'Explore Courses', '#dynamic-courses', 'Contact Us', '#contact-page-section', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop');

INSERT OR IGNORE INTO features_title (id, title)
VALUES (1, 'Why Choose EduVault?');

-- Insert default products
INSERT OR IGNORE INTO products (id, title, description, price, img, kicker) VALUES
('p1', 'Online Courses', 'Structured video lessons, quizzes and certificates.', 999, 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png', 'Best Seller'),
('p2', 'E-books & PDFs', 'Instant download guides and reference PDFs.', 299, 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png', 'Digital Books'),
('p3', 'Templates', 'Plug-and-play design and document templates.', 499, 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png', 'Ready to Use'),
('p4', 'Software & Tools', 'Scripts, SaaS tools and productivity software.', 1499, 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png', 'Lifetime Access'),
('p5', 'Memberships', 'Premium content, live sessions and community.', 1999, 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png', 'Community');
