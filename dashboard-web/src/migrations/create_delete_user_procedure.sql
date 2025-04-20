-- Procedimiento almacenado para eliminación eficiente de usuarios
-- Esta función elimina el usuario y todas sus relaciones en una sola transacción

CREATE OR REPLACE FUNCTION delete_user_complete(user_id UUID)
RETURNS void AS $$
BEGIN
    -- Eliminar notificaciones
    DELETE FROM notifications WHERE user_id = $1;
    
    -- Eliminar reviews
    DELETE FROM reviews WHERE user_id = $1;
    
    -- Eliminar asignaciones de pedidos si es repartidor
    DELETE FROM order_assignments
    WHERE delivery_person_id IN (
        SELECT id FROM delivery_people WHERE user_id = $1
    );
    
    -- Eliminar registro de repartidor
    DELETE FROM delivery_people WHERE user_id = $1;
    
    -- Desasociar restaurantes (en lugar de borrarlos)
    UPDATE restaurants SET admin_id = NULL WHERE admin_id = $1;
    
    -- Eliminar el usuario
    DELETE FROM users WHERE id = $1;
    
    -- Notificar éxito
    RAISE NOTICE 'Usuario % eliminado con todas sus relaciones', $1;
END;
$$ LANGUAGE plpgsql;