-- Add missing DELETE policy for events table
CREATE POLICY "Enable delete for authenticated users" ON events
  FOR DELETE USING (auth.role() = 'authenticated');

-- Drop and recreate the existing policies to ensure consistency
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON events;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON events;

-- Recreate policies with consistent naming and structure
CREATE POLICY "Enable read access for authenticated users" ON events
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Enable insert for authenticated users" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add a procedure to help with event deletion
CREATE OR REPLACE FUNCTION delete_event(event_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  DELETE FROM events WHERE id = event_id;
  GET DIAGNOSTICS result = ROW_COUNT;
  RETURN result > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;