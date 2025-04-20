-- Este script elimina la restricción de unicidad en el campo RUT
-- para permitir RUTs duplicados o nulos

-- 1. Identificar el nombre exacto de la restricción
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE contype = 'u' 
AND conrelid = 'users'::regclass 
AND conname LIKE '%rut%';

-- 2. Eliminar la restricción (ajustar el nombre si es necesario)
ALTER TABLE users DROP CONSTRAINT IF EXISTS unique_rut;

-- 3. Mensaje de confirmación
SELECT 'La restricción de unicidad de RUT ha sido eliminada' as mensaje;