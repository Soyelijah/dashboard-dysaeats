# Documentación de Event Sourcing para DysaEats

Este documento proporciona una visión general completa de la implementación de Event Sourcing en DysaEats2, describiendo cada componente, cómo funcionan juntos y cómo utilizarlos.

## Tabla de Contenidos

1. [Introducción a Event Sourcing](#introducción-a-event-sourcing)
2. [Visión General de la Arquitectura](#visión-general-de-la-arquitectura)
3. [Dominios Principales](#dominios-principales)
   - [Dominio de Pedidos](#dominio-de-pedidos)
   - [Dominio de Usuarios](#dominio-de-usuarios)
   - [Dominio de Restaurantes](#dominio-de-restaurantes)
   - [Dominio de Entregas](#dominio-de-entregas)
   - [Dominio de Pagos](#dominio-de-pagos)
4. [Detalles de Implementación](#detalles-de-implementación)
   - [Eventos](#eventos)
   - [Agregados](#agregados)
   - [Comandos](#comandos)
   - [Proyectores](#proyectores)
   - [Almacén de Eventos](#almacén-de-eventos)
5. [Configuración de Base de Datos](#configuración-de-base-de-datos)
6. [Integración con Frontend](#integración-con-frontend)
7. [Integración con Backend](#integración-con-backend)
8. [Pruebas de Event Sourcing](#pruebas-de-event-sourcing)
9. [Mejores Prácticas](#mejores-prácticas)

## Introducción a Event Sourcing

Event Sourcing es un patrón donde los cambios en el estado de la aplicación se almacenan como una secuencia de eventos. En lugar de actualizar directamente una base de datos con el estado actual, registramos una serie de eventos que representan lo que ha ocurrido. Esto proporciona:

- Pista de auditoría completa e historial
- Capacidad para reconstruir el estado en cualquier punto en el tiempo
- Ajuste natural para el diseño dirigido por el dominio
- Soporte para procesos de negocio complejos

DysaEats2 implementa Event Sourcing para hacer seguimiento de operaciones comerciales importantes como procesamiento de pedidos, gestión de usuarios, operaciones de restaurantes, entregas y pagos.

## Visión General de la Arquitectura

La arquitectura de Event Sourcing en DysaEats2 consta de estos componentes clave:

1. **Eventos**: Registros inmutables de algo que ha ocurrido (PedidoCreado, PagoCaptado, etc.)
2. **Agregados**: Entidades de dominio que mantienen límites de consistencia (Pedido, Usuario, Restaurante, etc.)
3. **Comandos**: Operaciones que expresan la intención de cambiar el estado (CrearPedido, AsignarEntrega, etc.)
4. **Proyectores**: Componentes que construyen modelos de lectura a partir del flujo de eventos
5. **Almacén de Eventos**: Almacenamiento en base de datos para todos los eventos
6. **Instantáneas**: Mecanismo de optimización para reconstruir el estado del agregado más rápido

El flujo de una operación típica sigue estos pasos:

1. Se emite un comando (CrearPedido)
2. El manejador del comando carga el agregado relevante
3. El agregado valida el comando contra su estado actual
4. Si es válido, el manejador del comando crea y guarda eventos
5. Los eventos se aplican al agregado
6. Los proyectores procesan los eventos para actualizar los modelos de lectura

## Dominios Principales

### Dominio de Pedidos

El dominio de Pedidos gestiona el ciclo de vida de los pedidos de los clientes.

**Eventos Clave:**
- OrderCreatedEvent
- OrderStatusChangedEvent
- OrderItemAddedEvent
- OrderItemRemovedEvent
- OrderCancelledEvent
- OrderCompletedEvent

**Comandos:**
- createOrder
- addOrderItem
- removeOrderItem
- updateOrderStatus
- cancelOrder
- completeOrder

### Dominio de Usuarios

El dominio de Usuarios maneja el registro de usuarios, actualizaciones de perfil y gestión de usuarios.

**Eventos Clave:**
- UserCreatedEvent
- UserProfileUpdatedEvent
- UserRoleChangedEvent
- UserDeactivatedEvent
- UserReactivatedEvent

**Comandos:**
- createUser
- updateUserProfile
- changeUserRole
- deactivateUser
- reactivateUser

### Dominio de Restaurantes

El dominio de Restaurantes gestiona la información de restaurantes y la gestión de menús.

**Eventos Clave:**
- RestaurantCreatedEvent
- RestaurantUpdatedEvent
- MenuCategoryAddedEvent
- MenuCategoryUpdatedEvent
- MenuCategoryRemovedEvent
- MenuItemAddedEvent
- MenuItemUpdatedEvent
- MenuItemRemovedEvent

**Comandos:**
- createRestaurant
- updateRestaurant
- addMenuCategory
- updateMenuCategory
- removeMenuCategory
- addMenuItem
- updateMenuItem
- removeMenuItem

### Dominio de Entregas

El dominio de Entregas hace seguimiento del estado de las entregas y actualizaciones de ubicación.

**Eventos Clave:**
- DeliveryCreatedEvent
- DeliveryAssignedEvent
- DeliveryStatusChangedEvent
- DeliveryLocationUpdatedEvent
- DeliveryCompletedEvent
- DeliveryCancelledEvent

**Comandos:**
- createDelivery
- assignDelivery
- updateDeliveryStatus
- updateDeliveryLocation
- completeDelivery
- cancelDelivery

### Dominio de Pagos

El dominio de Pagos gestiona el procesamiento de pagos y flujos de trabajo de reembolso.

**Eventos Clave:**
- PaymentCreatedEvent
- PaymentAuthorizedEvent
- PaymentCapturedEvent
- PaymentRefundedEvent
- PaymentFailedEvent
- PaymentVoidedEvent

**Comandos:**
- createPayment
- authorizePayment
- capturePayment
- refundPayment
- failPayment
- voidPayment

## Detalles de Implementación

### Eventos

Los eventos son registros inmutables de cambios de estado. Cada evento:

- Tiene un tipo único (p. ej., 'OrderCreatedEvent')
- Contiene datos relevantes para el cambio
- Incluye metadatos (marca de tiempo, versión, etc.)
- Se almacena permanentemente en el almacén de eventos

Ejemplo de creación de un evento:

```typescript
// Crear un OrderCreatedEvent
const event = createOrderCreatedEvent(
  orderId,
  0, // Versión inicial
  {
    id: orderId,
    userId,
    restaurantId,
    status: 'pending',
    items: []
  }
);
```

### Agregados

Los agregados encapsulan la lógica de negocio y mantienen la consistencia. Ellos:

- Tienen un ID único
- Aplican eventos para actualizar el estado interno
- Hacen cumplir reglas de negocio y validaciones
- Proporcionan acceso al estado actual

Ejemplo de un agregado:

```typescript
// Cargar un agregado de Pedido
const orderAggregate = new OrderAggregate();

// Aplicar eventos pasados para reconstruir el estado
events.forEach(event => {
  orderAggregate.applyEvent(event);
});

// Obtener el estado actual
const currentState = orderAggregate.getState();
```

### Comandos

Los comandos expresan la intención de cambiar el estado. Cada comando:

- Tiene un nombre descriptivo (p. ej., 'createOrder')
- Acepta los parámetros necesarios
- Valida la entrada
- Crea y aplica eventos
- Devuelve el estado actualizado

Ejemplo de un comando:

```typescript
// Ejecutar un comando para crear un pedido
const newOrder = await createOrder(
  eventStore,
  userId,
  restaurantId,
  items
);
```

### Proyectores

Los proyectores construyen modelos de lectura a partir de eventos. Ellos:

- Procesan eventos cronológicamente
- Actualizan tablas de base de datos para consultas
- Transforman datos de eventos en formatos utilizables
- Mantienen la consistencia con el almacén de eventos

Ejemplo de un proyector:

```typescript
// Proyectar eventos de pedidos en la base de datos
await projectOrders(eventStore, supabase);
```

### Almacén de Eventos

El almacén de eventos es la base de datos que almacena todos los eventos. Proporciona:

- Almacenamiento de solo anexar para eventos
- Capacidad para recuperar eventos para un agregado
- Flujos de eventos filtrados por varios criterios
- Control de concurrencia optimista

## Configuración de Base de Datos

DysaEats2 utiliza PostgreSQL (a través de Supabase) tanto para el almacenamiento de eventos como para los modelos de lectura. Las tablas del almacén de eventos son:

1. **events**: Almacena todos los eventos
   - aggregate_id: Identificador único para el agregado
   - aggregate_type: Tipo de agregado (pedido, usuario, etc.)
   - version: Número de versión secuencial
   - type: Nombre del tipo de evento
   - data: Datos del evento en JSON
   - metadata: Metadatos en JSON
   - created_at: Marca de tiempo

2. **snapshots**: Almacena instantáneas del estado de los agregados
   - aggregate_id: Identificador único para el agregado
   - aggregate_type: Tipo de agregado
   - version: Versión del último evento aplicado
   - state: Estado serializado del agregado en JSON
   - created_at: Marca de tiempo

Para configurar estas tablas, el script `create_event_sourcing_tables.sql` debe ejecutarse en tu base de datos Supabase.

## Integración con Frontend

El frontend accede a los datos basados en eventos a través de:

1. **Consultas Directas**: Utilizando los modelos de lectura construidos por los proyectores
2. **Comandos**: Emitiendo comandos para cambiar el estado
3. **Suscripciones en Tiempo Real**: Suscribiéndose a cambios vía Supabase realtime

Ejemplo de integración con frontend:

```typescript
// Hook para acceder a pedidos basados en eventos
function useEventSourcedOrders(userId) {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Cargar pedidos desde el modelo de lectura
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .then(({ data }) => setOrders(data));
      
    // Suscribirse a cambios
    const subscription = supabase
      .from(`orders:user_id=eq.${userId}`)
      .on('*', payload => {
        // Actualizar pedidos cuando ocurren cambios
      })
      .subscribe();
      
    return () => supabase.removeSubscription(subscription);
  }, [userId]);
  
  // Función para crear un nuevo pedido
  const createNewOrder = async (restaurantId, items) => {
    const response = await fetch('/api/commands/create-order', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        restaurantId,
        items
      })
    });
    
    const result = await response.json();
    return result.order;
  };
  
  return { orders, createNewOrder };
}
```

## Integración con Backend

El backend maneja comandos, los valida y almacena eventos:

```typescript
// Endpoint de API para manejar el comando createOrder
export async function POST(request) {
  const { userId, restaurantId, items } = await request.json();
  
  try {
    // Ejecutar comando
    const order = await createOrder(
      eventStore,
      userId,
      restaurantId,
      items
    );
    
    // Proyectar eventos para actualizar modelos de lectura
    await projectOrders(eventStore, supabase);
    
    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
```

## Pruebas de Event Sourcing

Las pruebas de sistemas basados en eventos siguen estos patrones:

1. **Given-When-Then**: 
   - Dada una serie de eventos pasados
   - Cuando se ejecuta un comando
   - Entonces se espera que se creen nuevos eventos

2. **Pruebas de Comandos**:
   - Probar el comportamiento del manejador de comandos
   - Verificar que se produzcan los eventos correctos
   - Comprobar las actualizaciones del estado del agregado

3. **Pruebas de Proyectores**:
   - Verificar que los modelos de lectura se construyan correctamente
   - Probar el manejo de secuencias de eventos
   - Comprobar el manejo de errores y casos límite

Ejemplo de prueba:

```typescript
test('debería crear un pedido y añadir ítems', async () => {
  // Dado que no hay eventos previos
  
  // Cuando se crea un nuevo pedido
  const order = await createOrder(
    mockEventStore,
    'user-123',
    'restaurant-456',
    []
  );
  
  // Entonces se espera que se haya almacenado un OrderCreatedEvent
  expect(mockEventStore.saveEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      aggregate_type: 'order',
      type: 'OrderCreatedEvent'
    })
  );
  
  // Y cuando se añade un ítem
  await addOrderItem(
    mockEventStore,
    order.id,
    { id: 'item-1', name: 'Hamburguesa', price: 1000, quantity: 1 }
  );
  
  // Entonces se espera que se haya almacenado un OrderItemAddedEvent
  expect(mockEventStore.saveEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      aggregate_type: 'order',
      type: 'OrderItemAddedEvent'
    })
  );
});
```

## Mejores Prácticas

1. **Mantener los Eventos Simples**: Los eventos deben contener solo lo que cambió, no datos derivados
2. **Versionar Eventos**: Tener una estrategia de migración para cuando cambien los esquemas de eventos
3. **Proyectores Idempotentes**: Los proyectores deben poder ejecutarse múltiples veces sin efectos secundarios
4. **Instantáneas para Rendimiento**: Usar instantáneas para agregados grandes con muchos eventos
5. **Validación de Comandos**: Validar comandos antes de crear eventos
6. **Enriquecimiento de Eventos**: Considerar enriquecer eventos con contexto para facilitar las consultas
7. **Consistencia Eventual**: Diseñar interfaces de usuario teniendo en cuenta la consistencia eventual
8. **Probar Secuencias de Eventos**: Probar diferentes secuencias de eventos para asegurar un comportamiento correcto
9. **Monitorear el Almacén de Eventos**: Configurar monitoreo para el almacén de eventos para seguir el crecimiento y rendimiento
10. **Documentar Eventos**: Mantener un catálogo de todos los eventos y su propósito