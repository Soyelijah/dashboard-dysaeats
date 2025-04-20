-- Function to get all tables from the public schema
CREATE OR REPLACE FUNCTION get_all_tables()
RETURNS TABLE (
  tablename text
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.tablename::text
  FROM pg_catalog.pg_tables t
  WHERE t.schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- Drop the existing function first
DROP FUNCTION IF EXISTS get_table_columns(text);

-- Function to get column information for a specific table
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text,
  description text
) SECURITY DEFINER
AS $$
DECLARE
  schema_to_check text;
BEGIN
  -- Default schema is public
  schema_to_check := 'public';
  
  -- Check for special cases - auth.users
  IF table_name = 'users' THEN
    -- First try public schema
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
      schema_to_check := 'public';
    -- If not in public, try the auth schema
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN
      schema_to_check := 'auth';
    END IF;
  END IF;
  
  -- Return the query with potentially modified schema
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text,
    pg_catalog.col_description(
      format('%I.%I', c.table_schema, c.table_name)::regclass::oid, 
      c.ordinal_position
    )::text AS description
  FROM 
    information_schema.columns c
  WHERE 
    c.table_schema = schema_to_check
    AND c.table_name = table_name
  ORDER BY 
    c.ordinal_position;
    
  -- If no rows returned from original schema and we didn't already check auth for users
  IF NOT FOUND AND table_name = 'users' AND schema_to_check = 'public' THEN
    RETURN QUERY
    SELECT 
      c.column_name::text,
      c.data_type::text,
      c.is_nullable::text,
      c.column_default::text,
      pg_catalog.col_description(
        format('%I.%I', c.table_schema, c.table_name)::regclass::oid, 
        c.ordinal_position
      )::text AS description
    FROM 
      information_schema.columns c
    WHERE 
      c.table_schema = 'auth'
      AND c.table_name = table_name
    ORDER BY 
      c.ordinal_position;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to execute SQL and return the result as a JSON array
DROP FUNCTION IF EXISTS execute_sql_with_result(text);

CREATE OR REPLACE FUNCTION execute_sql_with_result(query text)
RETURNS SETOF json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query;
END;
$$;

-- Enable relevant RLS policies for public read access
GRANT EXECUTE ON FUNCTION get_all_tables() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_table_columns(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION execute_sql_with_result(text) TO anon, authenticated;