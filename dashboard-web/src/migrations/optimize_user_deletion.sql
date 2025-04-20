-- Script para optimizar las relaciones con la tabla de usuarios
-- y facilitar la eliminación de usuarios

-- 1. Agregar eliminación en cascada para notificaciones de usuarios
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- 2. Agregar eliminación en cascada para reviews de usuarios
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey,
ADD CONSTRAINT reviews_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- 3. Configurar índices para mejorar rendimiento de consultas relacionadas con usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_rut ON users(rut) WHERE rut IS NOT NULL;

-- 4. Agrega un trigger para limpiar RUTs vacíos (opcionalmente)
CREATE OR REPLACE FUNCTION clean_empty_rut()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rut = '' THEN
        NEW.rut := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clean_empty_rut_trigger ON users;
CREATE TRIGGER clean_empty_rut_trigger
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION clean_empty_rut();

-- Mostrar mensaje de confirmación
SELECT 'Optimizaciones para eliminación de usuarios aplicadas con éxito' AS message;