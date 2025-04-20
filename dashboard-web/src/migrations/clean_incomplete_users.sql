CREATE OR REPLACE FUNCTION clean_incomplete_users()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users au
  WHERE au.id IN (
    SELECT u.id
    FROM public.users u
    WHERE u.first_name IS NULL OR u.last_name IS NULL OR u.rut IS NULL
  );
  
  DELETE FROM public.users
  WHERE first_name IS NULL OR last_name IS NULL OR rut IS NULL;
  
  RAISE NOTICE 'Incomplete users cleaned up successfully';
END;
$$ LANGUAGE plpgsql;

-- Para ejecutar manualmente:
-- SELECT clean_incomplete_users();

