-- Script para corregir roles incorrectos

-- Asegurar que los registros web tengan rol restaurant_admin
UPDATE public.users 
SET role = 'restaurant_admin' 
WHERE role \!= 'admin'
AND email \!= 'admin@dysaeats.com'
AND (first_name IS NOT NULL AND last_name IS NOT NULL AND rut IS NOT NULL);

-- Para usuario administrador real, asegurar rol admin
UPDATE public.users
SET role = 'admin',
    image_approved = true
WHERE email = 'admin@dysaeats.com';

-- Generar mensaje de log
DO $$
BEGIN
  RAISE NOTICE 'Roles de usuario corregidos correctamente';
END $$;

