-- Enable realtime for all tables with public inserts
ALTER PUBLICATION supabase_realtime ADD TABLE orders, order_items, order_assignments, delivery_people, notifications;

-- Configure realtime permissions for each table
-- Orders table
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Order items table
ALTER TABLE order_items REPLICA IDENTITY FULL;

-- Order assignments table
ALTER TABLE order_assignments REPLICA IDENTITY FULL;

-- Delivery people table
ALTER TABLE delivery_people REPLICA IDENTITY FULL;

-- Notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Set up realtime broadcast security by enforcing RLS
-- These ensure that users only receive updates for records they're authorized to see

-- For orders - Restaurant admins can see their restaurant orders, users see their own orders
CREATE POLICY "Enable realtime for restaurant admins" ON orders
  FOR SELECT USING (
    auth.uid() IN (
      SELECT admin_id FROM restaurants WHERE id = orders.restaurant_id
    )
  );

CREATE POLICY "Enable realtime for users own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- For order items - Same rules as orders
CREATE POLICY "Enable realtime for restaurant admin order items" ON order_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT admin_id FROM restaurants WHERE id IN (
        SELECT restaurant_id FROM orders WHERE id = order_items.order_id
      )
    )
  );

CREATE POLICY "Enable realtime for user order items" ON order_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM orders WHERE id = order_items.order_id
    )
  );

-- For order assignments - Restaurant admins and assigned delivery people
CREATE POLICY "Enable realtime for restaurant admin assignments" ON order_assignments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT admin_id FROM restaurants WHERE id IN (
        SELECT restaurant_id FROM orders WHERE id = order_assignments.order_id
      )
    )
  );

CREATE POLICY "Enable realtime for delivery person assignments" ON order_assignments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM delivery_people WHERE id = order_assignments.delivery_person_id
    )
  );

-- For delivery people - Restaurant admins and customers with active orders
CREATE POLICY "Enable realtime for restaurant admin delivery locations" ON delivery_people
  FOR SELECT USING (
    auth.uid() IN (
      SELECT admin_id FROM restaurants
    )
  );

CREATE POLICY "Enable realtime for customers with active deliveries" ON delivery_people
  FOR SELECT USING (
    auth.uid() IN (
      SELECT o.user_id FROM orders o
      JOIN order_assignments oa ON o.id = oa.order_id
      WHERE oa.delivery_person_id = delivery_people.id
      AND o.status IN ('out_for_delivery')
    )
  );

-- For notifications - Users see only their own notifications
CREATE POLICY "Enable realtime for user notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
