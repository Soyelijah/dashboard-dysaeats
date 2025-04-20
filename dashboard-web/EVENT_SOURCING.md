# Documentación de Event Sourcing en DysaEats

## ¿Qué es Event Sourcing?

Event Sourcing es un patrón de arquitectura que consiste en almacenar todos los cambios en el estado de una aplicación como una secuencia de eventos. En lugar de almacenar solo el estado actual de los datos, se guarda la historia completa de todas las acciones que provocaron cambios en el sistema. Esto permite:

- **Auditoría completa**: Registro histórico de todos los cambios
- **Viaje en el tiempo**: Reconstrucción del estado en cualquier punto del pasado
- **Depuración mejorada**: Facilita entender cómo ocurrieron los problemas
- **Escalabilidad**: Sistemas basados en eventos escalan mejor horizontalmente
- **Rendimiento**: Los snapshots optimizan la carga de agregados grandes

## Implementación en DysaEats

### 1. Estructura de la Base de Datos

Utilizamos dos tablas principales en Supabase:

```sql
-- Tabla de eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_id UUID NOT NULL,
  type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB,
  version INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabla de snapshots para optimización
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aggregate_type VARCHAR(255) NOT NULL,
  aggregate_id UUID NOT NULL,
  state JSONB NOT NULL,
  version INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Las políticas RLS garantizan que solo los usuarios autorizados puedan acceder a los eventos y snapshots.

### 2. Componentes Principales

#### EventStore (`/src/services/supabase/eventStore.ts`)

El Event Store es el componente central que gestiona la persistencia y recuperación de eventos:

```typescript
export class EventStore {
  // Guardar un nuevo evento
  async saveEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    // Implementación...
  }
  
  // Obtener eventos para un agregado
  async getEvents(aggregateType: string, aggregateId: string, fromVersion: number = 0): Promise<Event[]> {
    // Implementación...
  }
  
  // Obtener el snapshot más reciente
  async getLatestSnapshot(aggregateType: string, aggregateId: string): Promise<Snapshot | null> {
    // Implementación...
  }
  
  // Guardar un snapshot
  async saveSnapshot(snapshot: Omit<Snapshot, 'id' | 'created_at'>): Promise<Snapshot> {
    // Implementación...
  }
  
  // Suscribirse a eventos
  on(eventType: string, handler: (event: Event) => void): void {
    // Implementación...
  }
}
```

#### Agregados (`/src/aggregates/orderAggregate.ts`)

Los agregados son entidades que encapsulan la lógica de negocio y mantienen la consistencia:

```typescript
export class OrderAggregate {
  // Cargar el agregado desde la historia de eventos
  async load(orderId: string): Promise<void> {
    // Cargar desde snapshot si está disponible
    // Aplicar eventos para reconstruir el estado
  }
  
  // Métodos de comando (cambian el estado)
  async createOrder(payload: {...}, metadata?: any): Promise<string> {
    // Validar datos
    // Aplicar evento
  }
  
  async addItem(item: Omit<OrderItem, 'id'>, metadata?: any): Promise<void> {
    // Validar datos
    // Aplicar evento
  }
  
  // Otros métodos de comando...
  
  // Métodos privados para aplicar eventos al estado
  private applyEvent(event: Event): void {
    // Aplicar el evento al estado interno
  }
}
```

#### Comandos (`/src/commands/orderCommands.ts`)

Los comandos son acciones que cambian el estado del sistema:

```typescript
export class OrderCommands {
  // Crear un nuevo pedido
  async createOrder(payload: {...}, metadata?: any): Promise<string> {
    // Validar payload
    // Crear agregado de pedido
    // Ejecutar comando
  }
  
  // Otros comandos...
}
```

#### Proyectores (`/src/projectors/orderProjector.ts`)

Los proyectores actualizan los modelos de lectura en respuesta a eventos:

```typescript
export class OrderProjector {
  private initialize(): void {
    // Suscribirse a todos los eventos de pedidos
    this.eventStore.on(OrderEventTypes.ORDER_CREATED, this.handleOrderCreated.bind(this));
    // Otras suscripciones...
  }
  
  private async handleOrderCreated(event: Event): Promise<void> {
    // Actualizar tabla de pedidos
    // Crear notificaciones
  }
  
  // Otros manejadores de eventos...
}
```

#### Hooks de React (`/src/hooks/useEventSourcedOrders.ts`)

Los hooks proporcionan una interfaz para que los componentes React interactúen con el sistema de Event Sourcing:

```typescript
export function useEventSourcedOrders(options: UseEventSourcedOrdersOptions = {}) {
  // Estado
  const [orders, setOrders] = useState<OrderState[]>([]);
  
  // Cargar pedidos
  const loadOrders = useCallback(async () => {
    // Implementación...
  }, []);
  
  // Métodos de comando
  const createOrder = useCallback(async (payload: {...}): Promise<string> => {
    // Implementación...
  }, []);
  
  // Otros métodos...
  
  return {
    orders,
    isLoading,
    error,
    createOrder,
    // Otros métodos...
  };
}
```

### 3. Flujo de Trabajo

#### Creación de un Pedido

1. Un componente React llama a `createOrder` del hook `useEventSourcedOrders`
2. El hook invoca el comando `createOrder` de `OrderCommands`
3. `OrderCommands` valida los datos y crea un agregado `OrderAggregate`
4. `OrderAggregate` crea un evento `ORDER_CREATED` y lo guarda en el `EventStore`
5. `EventStore` emite el evento a todos los suscriptores
6. `OrderProjector` recibe el evento y actualiza la tabla `orders` en Supabase
7. El hook refresca los datos y actualiza el estado de React
8. La UI se actualiza para mostrar el nuevo pedido

### 4. Ejemplo de Uso

```typescript
import { useEventSourcedOrders } from '../hooks/useEventSourcedOrders';

function OrderManagement() {
  const {
    orders,
    isLoading,
    createOrder,
    addItemToOrder,
    submitOrder
  } = useEventSourcedOrders({
    restaurantId: '123',
    subscribeToUpdates: true
  });

  const handleCreateOrder = async () => {
    try {
      const orderId = await createOrder({
        restaurantId: '123',
        userId: 'user-456',
        orderType: 'PICKUP'
      });
      console.log('Pedido creado:', orderId);
    } catch (err) {
      console.error('Error al crear pedido:', err);
    }
  };

  return (
    <div>
      <h1>Gestión de Pedidos</h1>
      <button onClick={handleCreateOrder}>Crear Pedido</button>
      
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              Pedido #{order.id.substring(0, 8)} - {order.status}
              <ul>
                {order.items.map(item => (
                  <li key={item.id}>
                    {item.quantity}x {item.name} - ${item.price}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Ver el ejemplo completo en `src/examples/OrderEventSourcingExample.tsx`.

## Ventajas de Event Sourcing en DysaEats

1. **Historial completo**: Podemos ver todos los cambios que han ocurrido en un pedido
2. **Depuración**: Facilita encontrar errores al poder reconstruir la secuencia exacta de eventos
3. **Analítica avanzada**: Podemos analizar patrones en los eventos (por ejemplo, cuánto tiempo tarda un pedido en ser aceptado)
4. **Integraciones**: Facilita la integración con otros sistemas que pueden suscribirse a eventos
5. **Consistencia**: Los agregados aseguran que todas las reglas de negocio se cumplan

## Consideraciones para el Futuro

1. **Optimización de rendimiento**: Implementar una estrategia de creación de snapshots más sofisticada
2. **Versiones de eventos**: Manejar migraciones de esquemas de eventos 
3. **Event Sourcing para otros dominios**: Extender el patrón a restaurantes, usuarios, etc.
4. **Herramientas de visualización de eventos**: Crear interfaces para explorar la historia de eventos
5. **Proyecciones personalizadas**: Implementar proyecciones especializadas para casos de uso específicos

## Recursos

- [Documentación oficial de Supabase](https://supabase.io/docs)
- [Event Sourcing by Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Journey by Microsoft](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/jj554200(v=pandp.10))