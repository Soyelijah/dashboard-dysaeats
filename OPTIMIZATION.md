# Optimización de Rendimiento en DysaEats

Se han implementado diversas estrategias para mejorar el rendimiento de la aplicación. Este documento detalla las optimizaciones aplicadas tanto en el frontend como en el backend.

## Optimización del Frontend Web

El frontend web de DysaEats, construido con Next.js, implementa las siguientes optimizaciones:

### 1. Componentes Optimizados para Renderizado

```tsx
// Uso de React.memo para componentes que no necesitan re-renderizarse frecuentemente
const OrderCard = React.memo(({ order }) => {
  // Componente que solo se re-renderiza cuando cambian las propiedades del pedido
  return (
    <div className="order-card">
      <h3>Pedido #{order.id}</h3>
      <p>Estado: {order.status}</p>
      <p>Total: ${order.total.toFixed(2)}</p>
    </div>
  );
});

// Uso de useMemo para cálculos costosos
const OrderSummary = ({ orders }) => {
  // Cálculo de totales solo cuando cambia la lista de pedidos
  const { totalAmount, totalOrders, averageAmount } = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + order.total, 0);
    return {
      totalAmount: total,
      totalOrders: orders.length,
      averageAmount: orders.length ? total / orders.length : 0
    };
  }, [orders]);

  return (
    <div className="summary">
      <p>Total de pedidos: {totalOrders}</p>
      <p>Monto total: ${totalAmount.toFixed(2)}</p>
      <p>Promedio por pedido: ${averageAmount.toFixed(2)}</p>
    </div>
  );
};
```

### 2. Carga Diferida y Código Dividido

```tsx
// Implementación de lazy loading para componentes pesados
import dynamic from 'next/dynamic';

// El mapa solo se carga cuando es necesario
const DeliveryMap = dynamic(() => import('../components/orders/DeliveryMap'), {
  loading: () => <p>Cargando mapa...</p>,
  ssr: false // Desactivamos SSR para componentes que dependen de window
});

// Dividir código por rutas usando la estructura de carpetas de Next.js
// app/orders/page.tsx - se carga solo cuando el usuario visita /orders
// app/dashboard/page.tsx - se carga solo cuando el usuario visita /dashboard
```

### 3. Optimización de Imágenes

```tsx
// Uso del componente Image de Next.js para optimización automática
import Image from 'next/image';

const RestaurantCard = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <Image
        src={restaurant.logoUrl}
        alt={restaurant.name}
        width={200}
        height={150}
        placeholder="blur" // Muestra un placeholder mientras carga
        blurDataURL="data:image/jpeg;base64,..." // Versión reducida de la imagen
        priority={restaurant.featured} // Prioriza carga de imágenes destacadas
      />
      <h3>{restaurant.name}</h3>
    </div>
  );
};
```

### 4. Optimización de CSS

```css
/* Uso de purgeCSS para eliminar estilos no utilizados */
/* En tailwind.config.js */
module.exports = {
  purge: ['./src/**/*.{js,ts,jsx,tsx}'],
  // resto de la configuración
};

/* Carga diferida de CSS no crítico */
/* En _document.tsx */
<link
  rel="preload"
  href="/fonts/inter.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

### 5. Estrategias de Caché

```tsx
// Implementación de SWR para datos con caché y revalidación
import useSWR from 'swr';

function ActiveOrders() {
  const { data, error } = useSWR('/api/orders/active', fetcher, {
    refreshInterval: 5000, // Refresca cada 5 segundos
    revalidateOnFocus: true, // Revalida cuando el usuario vuelve a la pestaña
    dedupingInterval: 2000 // Evita peticiones duplicadas
  });

  if (error) return <div>Error al cargar pedidos</div>;
  if (!data) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Pedidos Activos ({data.length})</h2>
      {data.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

### 6. Prefetching de Páginas

```tsx
// Prefetch de páginas comunes para navegación instantánea
import Link from 'next/link';

function Navigation() {
  return (
    <nav>
      <Link href="/dashboard" prefetch>Dashboard</Link>
      <Link href="/orders" prefetch>Pedidos</Link>
      <Link href="/restaurants" prefetch={false}>Restaurantes</Link> {/* No hacer prefetch de páginas menos visitadas */}
    </nav>
  );
}
```

### 7. Optimización de Fuentes

```tsx
// Uso de fuentes variables y display swap
// En globals.css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-var.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
```

## Optimización del Backend

El backend de DysaEats, construido con NestJS, implementa las siguientes optimizaciones:

### 1. Compresión de Respuestas y Seguridad

```typescript
// backend/src/main.ts
import * as compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import * as cacheControl from 'express-cache-controller';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aplicar compresión para reducir tamaño de respuestas
  app.use(compression());
  
  // Configurar límites para evitar ataques DoS
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // limitar cada IP a 100 solicitudes por ventana
    }),
  );
  
  // Configurar Helmet para mejorar seguridad
  app.use(helmet());
  
  // Cache HTTP para respuestas estáticas
  app.use(
    cacheControl({
      maxAge: 86400, // 1 día
    }),
  );
  
  // Resto de la configuración
  // ...
}
```

### 2. Caché de Consultas Frecuentes

```typescript
// Implementación de caché en memoria para consultas frecuentes
import { CacheModule, CacheInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 60, // tiempo de vida en segundos
      }),
    }),
    // otros módulos
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
```

### 3. Optimización de Consultas a Base de Datos

```typescript
// Uso de carga diferida (lazy loading) para relaciones
@Entity()
export class Order {
  @ManyToOne(() => User, { lazy: true })
  user: Promise<User>;
  
  // Carga selectiva de campos necesarios
  async getOrderSummary() {
    return {
      id: this.id,
      total: this.total,
      status: this.status,
      // otros campos esenciales...
    };
  }
}

// En el repositorio
@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
  async findActiveOrders(): Promise<Order[]> {
    return this.createQueryBuilder('order')
      .where('order.status IN (:...statuses)', { 
        statuses: ['pending', 'processing', 'delivering'] 
      })
      .select(['order.id', 'order.status', 'order.total'])
      .getMany();
  }
}
```

### 4. Procesamiento en Segundo Plano

```typescript
// Implementación de cola para procesar tareas pesadas
import { BullModule } from '@nestjs/bull';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    // otros módulos
  ],
})
export class AppModule {}

@Processor('notifications')
export class NotificationProcessor {
  @Process('send-push')
  async handleSendPush(job: Job<any>) {
    const { userId, message } = job.data;
    // Lógica para enviar notificaciones push
    // Esta operación puede ser costosa pero se ejecuta en segundo plano
  }
}
```

### 5. Optimización de WebSockets

```typescript
// Configuración optimizada para WebSockets
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  // Función para enviar actualizaciones solo a los clientes interesados
  sendOrderUpdate(orderId: string, update: any) {
    this.server.to(`order_${orderId}`).emit('orderUpdate', update);
  }
}
```

## Implementación de CI/CD con GitHub Actions

Para mantener un proceso de desarrollo y despliegue óptimo, se ha implementado CI/CD:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint

  test-backend:
    name: Test Backend
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      - name: Run tests
        working-directory: ./backend
        run: npm test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: postgres
          DB_PASSWORD: postgres
          DB_DATABASE: test_db
          JWT_SECRET: test_secret
          NODE_ENV: test

  build-backend:
    name: Build Backend
    runs-on: ubuntu-latest
    needs: [lint, test-backend]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      - name: Build
        working-directory: ./backend
        run: npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: backend-build
          path: backend/dist

  build-dashboard-web:
    name: Build Dashboard Web
    runs-on: ubuntu-latest
    needs: [lint]
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: dashboard-web/package-lock.json
      - name: Install dependencies
        working-directory: ./dashboard-web
        run: npm ci
      - name: Build
        working-directory: ./dashboard-web
        run: npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v3
        with:
          name: dashboard-web-build
          path: dashboard-web/.next

  # Más jobs para dashboard-mobile, etc.
```

## Beneficios de las Optimizaciones

1. **Mejor experiencia de usuario**: Tiempos de carga más rápidos y aplicación más fluida
2. **Menor consumo de recursos**: Reducción de tráfico de red y uso de CPU/memoria
3. **Mayor estabilidad**: Mejor manejo de cargas altas y situaciones de estrés
4. **Reducción de costos**: Menor consumo de ancho de banda y recursos en servidores
5. **Mejor SEO**: Las optimizaciones de rendimiento mejoran el ranking en buscadores

## Monitoreo de Rendimiento

Para asegurar que estas optimizaciones siguen funcionando correctamente, se han implementado:

1. **Métricas de rendimiento**: Tiempo de respuesta, uso de CPU/memoria
2. **Alertas**: Notificaciones cuando métricas superan umbrales
3. **Logs detallados**: Información para identificar cuellos de botella
4. **Análisis de frontend**: Lighthouse, Web Vitals, etc.

Estas optimizaciones de rendimiento son un proceso continuo que se irá mejorando con el tiempo según las necesidades específicas de la aplicación.