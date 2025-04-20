-- Este script modifica la restricción de unicidad en el campo RUT
-- para permitir valores NULL y garantizar que los RUTs duplicados se detecten
-- independientemente del formato (con o sin puntos y guiones)

-- 1. Primero eliminamos la restricción existente
ALTER TABLE users DROP CONSTRAINT IF EXISTS unique_rut;

-- 2. Crear una función para normalizar RUTs (eliminar puntos y guiones)
CREATE OR REPLACE FUNCTION normalize_rut(rut TEXT) 
RETURNS TEXT AS $$
BEGIN
  -- Si es NULL, retornar NULL
  IF rut IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Eliminar puntos y guiones
  RETURN regexp_replace(regexp_replace(rut, '\.', '', 'g'), '-', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Crear un índice parcial único en la versión normalizada del RUT
-- Esto permite valores NULL y detecta duplicados independientemente del formato
CREATE UNIQUE INDEX unique_normalized_rut ON users (normalize_rut(rut))
WHERE rut IS NOT NULL;

-- 4. Mensaje de confirmación
SELECT 'La restricción de unicidad de RUT ha sido modificada para ser más flexible' as mensaje;