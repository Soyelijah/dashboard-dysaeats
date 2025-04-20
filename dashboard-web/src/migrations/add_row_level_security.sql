-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Admin can see and manage all users
CREATE POLICY "Admins can do everything with users" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Users can see and edit their own data
CREATE POLICY "Users can see their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for restaurants table
-- Admins can manage all restaurants
CREATE POLICY "Admins can do everything with restaurants" ON restaurants
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Restaurant admins can manage their own restaurants
CREATE POLICY "Restaurant admins can manage their own restaurants" ON restaurants
  FOR ALL USING (auth.uid() = admin_id);

-- All authenticated users can view active restaurants
CREATE POLICY "All users can view active restaurants" ON restaurants
  FOR SELECT USING (is_active = true);

-- Create policies for menu_categories table
-- Admins can manage all menu categories
CREATE POLICY "Admins can do everything with menu categories" ON menu_categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Restaurant admins can manage categories for their restaurants
CREATE POLICY "Restaurant admins can manage their own menu categories" ON menu_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_categories.restaurant_id
      AND restaurants.admin_id = auth.uid()
    )
  );

-- All authenticated users can view menu categories
CREATE POLICY "All users can view menu categories" ON menu_categories
  FOR SELECT USING (true);

-- Create policies for menu_items table
-- Admins can manage all menu items
CREATE POLICY "Admins can do everything with menu items" ON menu_items
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Restaurant admins can manage items for their restaurants
CREATE POLICY "Restaurant admins can manage their own menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.admin_id = auth.uid()
    )
  );

-- All authenticated users can view menu items
CREATE POLICY "All users can view menu items" ON menu_items
  FOR SELECT USING (true);

-- Create policies for orders table
-- Admins can manage all orders
CREATE POLICY "Admins can do everything with orders" ON orders
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Restaurant admins can view and update orders for their restaurants
CREATE POLICY "Restaurant admins can view and update orders for their restaurants" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.admin_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant admins can update orders for their restaurants" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.admin_id = auth.uid()
    )
  );

-- Customers can view their own orders and create new ones
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Customers can create new orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Delivery people can view orders assigned to them
CREATE POLICY "Delivery people can view assigned orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM order_assignments
      JOIN delivery_people ON order_assignments.delivery_person_id = delivery_people.id
      WHERE order_assignments.order_id = orders.id
      AND delivery_people.user_id = auth.uid()
    )
  );

-- Create policies for notifications table
-- Users can only see their own notifications
CREATE POLICY "Users can see their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can create notifications for any user
CREATE POLICY "Admins can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for payments table
-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Restaurant admins can view payments for their restaurants
CREATE POLICY "Restaurant admins can view payments for their restaurants" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN restaurants ON orders.restaurant_id = restaurants.id
      WHERE orders.id = payments.order_id
      AND restaurants.admin_id = auth.uid()
    )
  );

-- Users can view their own payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Function to verify if a user is a restaurant admin
CREATE OR REPLACE FUNCTION is_restaurant_admin(restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = restaurant_id
    AND admin_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify if a user is a delivery person
CREATE OR REPLACE FUNCTION is_delivery_person()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM delivery_people
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;