-- Jess Collection E-commerce Database Schema

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'clothing', 'shoes', 'jewellery', 'handbags'
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered'
  payment_method TEXT, -- 'stripe', 'paypal', 'bank_transfer'
  stripe_payment_intent_id TEXT,
  shipping_address TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews and ratings table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for cart
CREATE POLICY "Users can view their own cart" ON cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their cart" ON cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart" ON cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their cart" ON cart
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE)
  );

-- RLS Policies for order items
CREATE POLICY "Users can view items from their orders" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can create reviews for their purchases" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Products table - allow everyone to view, only admins to modify
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (TRUE);

CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE)
  );

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE)
  );

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM users WHERE is_admin = TRUE)
  );
