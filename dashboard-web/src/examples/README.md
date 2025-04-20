# Ejemplos de Event Sourcing en DysaEats

Este directorio contiene ejemplos prácticos de cómo utilizar la arquitectura de Event Sourcing en DysaEats.

## Ejemplos disponibles

### OrderEventSourcingExample.tsx

Este ejemplo muestra un caso de uso completo para la gestión de pedidos usando Event Sourcing:

- Creación de pedidos
- Agregar/eliminar ítems
- Cambiar el estado del pedido (enviar, aceptar, rechazar, completar, etc.)
- Visualización de la historia de eventos
- Manejo de errores
- Actualización en tiempo real

## Cómo utilizar los ejemplos

Para utilizar estos ejemplos en tu aplicación:

1. Importa el componente en tu página:

```tsx
import OrderEventSourcingExample from '../examples/OrderEventSourcingExample';

export default function YourPage() {
  return (
    <div>
      <h1>Página de prueba</h1>
      <OrderEventSourcingExample />
    </div>
  );
}
```

2. Asegúrate de tener Supabase configurado correctamente con las tablas de eventos y snapshots.

3. Ajusta los IDs de prueba (restaurante, usuario) en el ejemplo según tus necesidades.

## Estrategias de implementación

Estos ejemplos demuestran varias estrategias importantes para trabajar con Event Sourcing:

1. **Manejo de estado local vs. remoto**: Los ejemplos muestran cómo sincronizar el estado local con los eventos almacenados.

2. **Tiempo real con Supabase**: Implementación de suscripciones para actualizaciones en tiempo real.

3. **Patrones de UI para Event Sourcing**: Cómo estructurar componentes de UI para trabajar con agregados y comandos.

4. **Manejo de errores**: Estrategias para manejar errores en diferentes niveles (comando, agregado, UI).

5. **Visualización de eventos**: Cómo mostrar la historia de eventos para debugging y auditoría.

## Extendiendo los ejemplos

Puedes usar estos ejemplos como base para implementar Event Sourcing en otros dominios:

1. **Gestión de restaurantes**: Aplicar el mismo patrón para crear, actualizar y administrar restaurantes.

2. **Gestión de usuarios**: Implementar Event Sourcing para el registro, actualización y gestión de perfiles de usuario.

3. **Sistema de pagos**: Usar eventos para registrar el historial completo de transacciones de pago.

## Recursos

Para entender mejor cómo funcionan estos ejemplos, consulta:

- [EVENT_SOURCING.md](/EVENT_SOURCING.md) en la raíz del proyecto
- El código fuente en `/src/aggregates`, `/src/commands`, `/src/events` y `/src/projectors`