-- Script para corregir usuarios con roles incorrectos
UPDATE public.users 
SET role = 'restaurant_admin' 
WHERE role = 'admin' 
AND email \!= 'admin@dysaeats.com';

-- Establecer explícitamente NULL en contraseñas
UPDATE public.users
SET password = NULL
WHERE password = '';

-- Para usuarios administradores reales
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@dysaeats.com';

