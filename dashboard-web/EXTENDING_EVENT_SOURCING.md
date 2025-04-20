# Extendiendo Event Sourcing a Todos los Dominios en DysaEats

Este documento detalla cómo extender la arquitectura de Event Sourcing implementada para pedidos a todos los dominios principales de la aplicación DysaEats.

## Índice

1. [Dominios Principales](#dominios-principales)
2. [Pasos Comunes para Cada Dominio](#pasos-comunes-para-cada-dominio)
3. [Implementación Detallada por Dominio](#implementación-detallada-por-dominio)
4. [Integración entre Dominios](#integración-entre-dominios)
5. [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)
6. [Migración de Datos Existentes](#migración-de-datos-existentes)

## Dominios Principales

La aplicación DysaEats tiene los siguientes dominios principales:

1. **Usuarios (Users)**: Gestión de cuentas, perfiles, roles y permisos
2. **Restaurantes (Restaurants)**: Información de restaurantes, horarios, ubicaciones
3. **Menús (Menus)**: Categorías, platos, precios, disponibilidad
4. **Pedidos (Orders)**: Creación, seguimiento y gestión de pedidos - *Ya implementado*
5. **Entregas (Deliveries)**: Asignación y seguimiento de repartidores
6. **Pagos (Payments)**: Transacciones, reembolsos, métodos de pago
7. **Notificaciones (Notifications)**: Alertas a usuarios, restaurantes y repartidores
8. **Analíticas (Analytics)**: Estadísticas y reportes de operaciones

## Pasos Comunes para Cada Dominio

Para cada dominio, seguiremos estos pasos para implementar Event Sourcing:

1. **Definir Eventos**: Identificar y modelar todos los eventos posibles del dominio
2. **Implementar Agregado**: Crear la clase agregada que encapsula la lógica de negocio
3. **Crear Comandos**: Implementar los manejadores de comandos para el dominio
4. **Desarrollar Proyector**: Crear el proyector que actualiza los modelos de lectura
5. **Implementar Hook de React**: Desarrollar el hook para usar en componentes UI
6. **Actualizar Migración SQL**: Asegurar que las tablas necesarias existan en la base de datos
7. **Pruebas**: Verificar el funcionamiento completo del dominio con Event Sourcing

## Implementación Detallada por Dominio

### 1. Dominio de Usuarios (Users)

#### 1.1 Eventos de Usuario (`userEvents.ts`)

```typescript
export enum UserEventTypes {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_PROFILE_UPDATED = 'USER_PROFILE_UPDATED',
  USER_PASSWORD_CHANGED = 'USER_PASSWORD_CHANGED',
  USER_EMAIL_VERIFIED = 'USER_EMAIL_VERIFIED',
  USER_ROLE_ASSIGNED = 'USER_ROLE_ASSIGNED',
  USER_ACCOUNT_DEACTIVATED = 'USER_ACCOUNT_DEACTIVATED',
  USER_ACCOUNT_REACTIVATED = 'USER_ACCOUNT_REACTIVATED',
  USER_PREFERENCES_UPDATED = 'USER_PREFERENCES_UPDATED',
  USER_LOGIN_PERFORMED = 'USER_LOGIN_PERFORMED',
  USER_LOGIN_FAILED = 'USER_LOGIN_FAILED'
}

// Interfaces para cada tipo de evento...
export interface UserRegisteredEvent {
  userId: string;
  email: string;
  name: string;
  createdAt: string;
  // Otros campos...
}

// Resto de interfaces de eventos...
```

#### 1.2 Agregado de Usuario (`userAggregate.ts`)

```typescript
export class UserAggregate {
  private state: UserState;
  private eventStore: EventStore;
  private isLoaded: boolean = false;

  constructor(eventStore: EventStore) {
    this.eventStore = eventStore;
    this.state = this.getInitialState();
  }

  // Métodos para cargar el estado
  async load(userId: string): Promise<void> {
    // Implementación similar a OrderAggregate.load()
  }

  // Métodos de comandos
  async registerUser(payload: {...}, metadata?: any): Promise<string> {
    // Validación y creación de evento USER_REGISTERED
  }

  async updateProfile(payload: {...}, metadata?: any): Promise<void> {
    // Validación y creación de evento USER_PROFILE_UPDATED
  }

  // Más métodos de comandos...

  // Métodos para aplicar eventos al estado
  private applyEvent(event: Event): void {
    // Aplicar el evento adecuado según su tipo
  }

  // Métodos específicos para aplicar cada tipo de evento
  private applyUserRegistered(event: UserRegisteredEvent): void {
    // Actualizar estado con datos del evento
  }

  // Más métodos para aplicar eventos...
}
```

#### 1.3 Comandos de Usuario (`userCommands.ts`)

```typescript
export class UserCommands {
  private eventStore: EventStore;

  constructor(eventStore: EventStore) {
    this.eventStore = eventStore;
  }

  // Métodos de comando
  async registerUser(payload: {...}, metadata?: any): Promise<string> {
    // Validación, creación del agregado y ejecución del comando
  }

  async updateProfile(userId: string, payload: {...}, metadata?: any): Promise<void> {
    // Validación, carga del agregado y ejecución del comando
  }

  // Más métodos de comando...
}
```

#### 1.4 Proyector de Usuario (`userProjector.ts`)

```typescript
export class UserProjector {
  private supabase: SupabaseClient;
  private eventStore: EventStore;

  constructor(supabase: SupabaseClient, eventStore: EventStore) {
    this.supabase = supabase;
    this.eventStore = eventStore;
    this.initialize();
  }

  private initialize(): void {
    // Suscribirse a todos los eventos de usuario
    this.eventStore.on(UserEventTypes.USER_REGISTERED, this.handleUserRegistered.bind(this));
    // Más suscripciones...
  }

  // Manejadores para cada tipo de evento
  private async handleUserRegistered(event: Event): Promise<void> {
    // Actualizar tabla de usuarios y enviar notificaciones
  }

  // Más manejadores...
}
```

#### 1.5 Hook de React (`useEventSourcedUsers.ts`)

```typescript
export function useEventSourcedUsers(options: UseEventSourcedUsersOptions = {}) {
  const [users, setUsers] = useState<UserState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Resto de la implementación similar a useEventSourcedOrders
  
  // Métodos de comando
  const registerUser = useCallback(async (payload: {...}): Promise<string> => {
    // Implementación...
  }, []);
  
  // Más métodos de comando...
  
  // Devolver estado y métodos
  return {
    users,
    isLoading,
    error,
    registerUser,
    // Más métodos...
  };
}
```

### 2. Dominio de Restaurantes (Restaurants)

#### 2.1 Eventos de Restaurante (`restaurantEvents.ts`)

```typescript
export enum RestaurantEventTypes {
  RESTAURANT_CREATED = 'RESTAURANT_CREATED',
  RESTAURANT_UPDATED = 'RESTAURANT_UPDATED',
  RESTAURANT_ACTIVATED = 'RESTAURANT_ACTIVATED',
  RESTAURANT_DEACTIVATED = 'RESTAURANT_DEACTIVATED',
  RESTAURANT_LOCATION_UPDATED = 'RESTAURANT_LOCATION_UPDATED',
  RESTAURANT_HOURS_UPDATED = 'RESTAURANT_HOURS_UPDATED',
  RESTAURANT_CATEGORY_ASSIGNED = 'RESTAURANT_CATEGORY_ASSIGNED',
  RESTAURANT_RATING_CHANGED = 'RESTAURANT_RATING_CHANGED',
  RESTAURANT_FEATURED_STATUS_CHANGED = 'RESTAURANT_FEATURED_STATUS_CHANGED'
}

// Interfaces para cada tipo de evento...
```

#### 2.2 Agregado de Restaurante (`restaurantAggregate.ts`)

```typescript
export class RestaurantAggregate {
  // Implementación similar a UserAggregate...
}
```

#### 2.3 Comandos de Restaurante (`restaurantCommands.ts`)

```typescript
export class RestaurantCommands {
  // Implementación similar a UserCommands...
}
```

#### 2.4 Proyector de Restaurante (`restaurantProjector.ts`)

```typescript
export class RestaurantProjector {
  // Implementación similar a UserProjector...
}
```

#### 2.5 Hook de React (`useEventSourcedRestaurants.ts`)

```typescript
export function useEventSourcedRestaurants(options: UseEventSourcedRestaurantsOptions = {}) {
  // Implementación similar a useEventSourcedUsers...
}
```

### 3. Dominio de Menús (Menus)

#### 3.1 Eventos de Menú (`menuEvents.ts`)

```typescript
export enum MenuEventTypes {
  MENU_CREATED = 'MENU_CREATED',
  MENU_UPDATED = 'MENU_UPDATED',
  MENU_DELETED = 'MENU_DELETED',
  MENU_ITEM_ADDED = 'MENU_ITEM_ADDED',
  MENU_ITEM_UPDATED = 'MENU_ITEM_UPDATED',
  MENU_ITEM_REMOVED = 'MENU_ITEM_REMOVED',
  MENU_CATEGORY_ADDED = 'MENU_CATEGORY_ADDED',
  MENU_CATEGORY_UPDATED = 'MENU_CATEGORY_UPDATED',
  MENU_CATEGORY_REMOVED = 'MENU_CATEGORY_REMOVED',
  MENU_ITEM_AVAILABILITY_CHANGED = 'MENU_ITEM_AVAILABILITY_CHANGED',
  MENU_ITEM_PRICE_CHANGED = 'MENU_ITEM_PRICE_CHANGED'
}

// Interfaces para cada tipo de evento...
```

#### 3.2 Agregado de Menú (`menuAggregate.ts`)

```typescript
export class MenuAggregate {
  // Implementación...
}
```

#### 3.3 Comandos de Menú (`menuCommands.ts`)

```typescript
export class MenuCommands {
  // Implementación...
}
```

#### 3.4 Proyector de Menú (`menuProjector.ts`)

```typescript
export class MenuProjector {
  // Implementación...
}
```

#### 3.5 Hook de React (`useEventSourcedMenus.ts`)

```typescript
export function useEventSourcedMenus(options: UseEventSourcedMenusOptions = {}) {
  // Implementación...
}
```

### 4. Dominio de Entregas (Deliveries)

#### 4.1 Eventos de Entrega (`deliveryEvents.ts`)

```typescript
export enum DeliveryEventTypes {
  DELIVERY_REQUESTED = 'DELIVERY_REQUESTED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  DRIVER_LOCATION_UPDATED = 'DRIVER_LOCATION_UPDATED',
  DELIVERY_PICKED_UP = 'DELIVERY_PICKED_UP',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  DELIVERY_FAILED = 'DELIVERY_FAILED',
  DELIVERY_CANCELLED = 'DELIVERY_CANCELLED',
  DELIVERY_DELAYED = 'DELIVERY_DELAYED',
  ESTIMATED_ARRIVAL_UPDATED = 'ESTIMATED_ARRIVAL_UPDATED'
}

// Interfaces para cada tipo de evento...
```

#### 4.2 Implementar el resto de las clases siguiendo el mismo patrón

### 5. Dominio de Pagos (Payments)

#### 5.1 Eventos de Pago (`paymentEvents.ts`)

```typescript
export enum PaymentEventTypes {
  PAYMENT_REQUESTED = 'PAYMENT_REQUESTED',
  PAYMENT_AUTHORIZED = 'PAYMENT_AUTHORIZED',
  PAYMENT_CAPTURED = 'PAYMENT_CAPTURED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED',
  PAYMENT_DISPUTED = 'PAYMENT_DISPUTED',
  PAYMENT_METHOD_ADDED = 'PAYMENT_METHOD_ADDED',
  PAYMENT_METHOD_REMOVED = 'PAYMENT_METHOD_REMOVED',
  PAYMENT_METHOD_UPDATED = 'PAYMENT_METHOD_UPDATED'
}

// Interfaces para cada tipo de evento...
```

#### 5.2 Implementar el resto de las clases siguiendo el mismo patrón

### 6. Dominio de Notificaciones (Notifications)

#### 6.1 Eventos de Notificación (`notificationEvents.ts`)

```typescript
export enum NotificationEventTypes {
  NOTIFICATION_CREATED = 'NOTIFICATION_CREATED',
  NOTIFICATION_DELIVERED = 'NOTIFICATION_DELIVERED',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  NOTIFICATION_DELETED = 'NOTIFICATION_DELETED',
  NOTIFICATION_PREFERENCES_UPDATED = 'NOTIFICATION_PREFERENCES_UPDATED'
}

// Interfaces para cada tipo de evento...
```

#### 6.2 Implementar el resto de las clases siguiendo el mismo patrón

### 7. Dominio de Analíticas (Analytics)

Las analíticas son un caso especial para Event Sourcing, ya que pueden consumir eventos de todos los demás dominios. En lugar de crear eventos específicos de analíticas, podríamos implementar un proyector especial:

```typescript
export class AnalyticsProjector {
  constructor(eventStore: EventStore, supabase: SupabaseClient) {
    // Suscribirse a eventos relevantes de todos los dominios
    // Ejemplos:
    eventStore.on(OrderEventTypes.ORDER_CREATED, this.handleOrderCreated.bind(this));
    eventStore.on(OrderEventTypes.ORDER_COMPLETED, this.handleOrderCompleted.bind(this));
    eventStore.on(PaymentEventTypes.PAYMENT_CAPTURED, this.handlePaymentCaptured.bind(this));
    eventStore.on(DeliveryEventTypes.DELIVERY_COMPLETED, this.handleDeliveryCompleted.bind(this));
    // etc.
  }
  
  // Métodos para actualizar modelos analíticos
}
```

## Integración entre Dominios

Los dominios no son completamente independientes. Existen relaciones naturales entre ellos:

1. **Flujo Orden-Pago-Entrega**: 
   - Cuando se crea un pedido, puede disparar un evento que inicie un pago
   - Cuando se completa un pago, puede iniciar una entrega

2. **Implementación con Event Sourcing**:
   ```typescript
   // En OrderProjector
   private async handleOrderSubmitted(event: Event): Promise<void> {
     // Actualizar modelo de lectura
     
     // Iniciar proceso de pago
     const paymentCommands = new PaymentCommands(this.eventStore);
     await paymentCommands.requestPayment({
       orderId: event.payload.orderId,
       amount: event.payload.totalAmount,
       // Más datos...
     });
   }
   
   // En PaymentProjector
   private async handlePaymentCaptured(event: Event): Promise<void> {
     // Actualizar modelo de lectura
     
     // Si el pedido es de tipo DELIVERY, iniciar entrega
     const { data: order } = await this.supabase
       .from('orders')
       .select('order_type')
       .eq('id', event.payload.orderId)
       .single();
       
     if (order && order.order_type === 'DELIVERY') {
       const deliveryCommands = new DeliveryCommands(this.eventStore);
       await deliveryCommands.requestDelivery({
         orderId: event.payload.orderId,
         // Más datos...
       });
     }
   }
   ```

## Consideraciones de Rendimiento

1. **Estrategia de Snapshots**: Para agregados con muchos eventos
   ```typescript
   // En eventStore.ts
   const SNAPSHOT_FREQUENCY = {
     'Order': 20,      // Cada 20 eventos
     'Restaurant': 10, // Cada 10 eventos
     'User': 50,       // Cada 50 eventos
     // Configurar según la frecuencia de cambios en cada dominio
   };
   ```

2. **Índices Específicos**: Crear índices en la tabla de eventos para consultas frecuentes
   ```sql
   -- En add_event_sourcing.sql
   CREATE INDEX IF NOT EXISTS idx_events_type_created_at ON events(type, created_at);
   CREATE INDEX IF NOT EXISTS idx_events_user_related ON events(payload->>'userId');
   CREATE INDEX IF NOT EXISTS idx_events_restaurant_related ON events(payload->>'restaurantId');
   ```

3. **Proyecciones Materializadas**: Para consultas de analíticas frecuentes
   ```sql
   -- Ejemplo de vista materializada para estadísticas de pedidos
   CREATE MATERIALIZED VIEW IF NOT EXISTS order_stats_by_restaurant AS
   SELECT 
     payload->>'restaurantId' as restaurant_id,
     COUNT(*) as total_orders,
     AVG(CAST(payload->>'totalAmount' AS DECIMAL)) as avg_order_value
   FROM events
   WHERE type = 'ORDER_COMPLETED'
   GROUP BY payload->>'restaurantId';
   
   -- Refrescar periódicamente
   REFRESH MATERIALIZED VIEW order_stats_by_restaurant;
   ```

## Migración de Datos Existentes

Para sistemas en producción, es necesario migrar datos existentes al modelo de Event Sourcing:

1. **Script de conversión de modelos a eventos**:
   ```typescript
   async function migrateUsersToEventSourcing() {
     const { data: users } = await supabase.from('users').select('*');
     
     for (const user of users) {
       // Crear evento USER_REGISTERED por cada usuario existente
       await eventStore.saveEvent({
         aggregate_type: 'User',
         aggregate_id: user.id,
         type: UserEventTypes.USER_REGISTERED,
         payload: {
           userId: user.id,
           email: user.email,
           name: user.name,
           createdAt: user.created_at,
           // Otros campos...
         },
         metadata: { migratedFromLegacyData: true },
         version: 1
       });
       
       // Crear otros eventos según los datos históricos
       // Por ejemplo, si el usuario cambió su perfil, crear USER_PROFILE_UPDATED
     }
   }
   ```

2. **Ejecutar la migración gradualmente**:
   - Migrar dominio por dominio
   - Ejecutar en horarios de baja carga
   - Verificar consistencia de datos después de cada migración

3. **Período de transición**:
   - Mantener el modelo antiguo funcionando mientras se completa la migración
   - Implementar sincronización bidireccional hasta que la migración esté completa