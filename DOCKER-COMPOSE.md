# Explicación del archivo docker-compose.yml para DysaEats

Este archivo `docker-compose.yml` define la configuración para ejecutar la aplicación DysaEats en contenedores Docker. A continuación se explica cada sección:

## Versión de Docker Compose
```yaml
version: '3.8'
```
Especifica la versión de la sintaxis de Docker Compose a utilizar (3.8 es una versión moderna con todas las características necesarias).

## Servicios

### 1. PostgreSQL
```yaml
postgres:
  image: postgres:14-alpine
  container_name: dysaeats-postgres
  restart: always
  ports:
    - 5432:5432
  volumes:
    - postgres_data:/var/lib/postgresql/data
  environment:
    POSTGRES_USER: ${DB_USERNAME}
    POSTGRES_PASSWORD: ${DB_PASSWORD}
    POSTGRES_DB: ${DB_DATABASE}
    PG_DATA: /var/lib/postgresql/data
```

- **Propósito**: Base de datos principal para almacenar todos los datos de la aplicación
- **Imagen**: Usa PostgreSQL 14 en su versión Alpine (más ligera)
- **Puertos**: Expone el puerto 5432 (estándar de PostgreSQL)
- **Volúmenes**: Almacena los datos en un volumen persistente `postgres_data`
- **Variables de entorno**: Usa variables desde el archivo `.env` para configurar usuario, contraseña y nombre de la base de datos

### 2. Redis
```yaml
redis:
  image: redis:6-alpine
  container_name: dysaeats-redis
  restart: always
  ports:
    - 6379:6379
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
```

- **Propósito**: Almacenamiento en caché y gestión de sesiones
- **Imagen**: Redis 6 en versión Alpine
- **Puertos**: Expone el puerto 6379 (estándar de Redis)
- **Volúmenes**: Almacena datos en `redis_data` para persistencia
- **Comando**: Activa el modo AOF (Append Only File) para mayor durabilidad de datos

### 3. Backend
```yaml
backend:
  build:
    context: ./backend
    target: ${NODE_ENV:-development}
  container_name: dysaeats-backend
  restart: always
  ports:
    - 3000:3000
  depends_on:
    - postgres
    - redis
  environment:
    - NODE_ENV=${NODE_ENV:-development}
    - DB_HOST=postgres
    - DB_PORT=5432
    - DB_USERNAME=${DB_USERNAME}
    - DB_PASSWORD=${DB_PASSWORD}
    - DB_DATABASE=${DB_DATABASE}
    - REDIS_HOST=redis
    - REDIS_PORT=6379
    - JWT_SECRET=${JWT_SECRET}
    - JWT_EXPIRATION=${JWT_EXPIRATION}
  volumes:
    - ./backend:/app
    - /app/node_modules
```

- **Propósito**: Servidor de la API (NestJS)
- **Build**: Compila la imagen usando el Dockerfile en ./backend
- **Target**: Usa diferentes etapas según el entorno (development/production)
- **Puertos**: Expone el puerto 3000 para la API
- **Dependencias**: Espera a que PostgreSQL y Redis estén disponibles
- **Variables de entorno**: 
  - Configuración de entorno (development por defecto)
  - Conexión a la base de datos
  - Conexión a Redis
  - Secretos para JWT (autenticación)
- **Volúmenes**: 
  - Monta el código en `/app` para desarrollo en vivo
  - Excluye node_modules para usar los del contenedor

### 4. Dashboard Web
```yaml
dashboard-web:
  build:
    context: ./dashboard-web
    dockerfile: Dockerfile
  container_name: dysaeats-dashboard-web
  restart: always
  ports:
    - 3001:3000
  depends_on:
    - backend
  environment:
    - NODE_ENV=${NODE_ENV:-development}
    - NEXT_PUBLIC_API_URL=http://localhost:3000/api
    - NEXT_PUBLIC_WS_URL=ws://localhost:3000
  volumes:
    - ./dashboard-web:/app
    - /app/node_modules
    - /app/.next
```

- **Propósito**: Aplicación web de administración (Next.js)
- **Build**: Usa el Dockerfile en ./dashboard-web
- **Puertos**: Expone el puerto 3001 (mapeado al 3000 interno)
- **Dependencias**: Requiere que el backend esté disponible
- **Variables de entorno**:
  - Configuración del entorno
  - URL de la API para llamadas desde el cliente
  - URL de WebSocket para comunicación en tiempo real
- **Volúmenes**:
  - Monta el código en `/app` para desarrollo en vivo
  - Excluye node_modules y carpeta .next para usar los del contenedor

## Volúmenes Persistentes
```yaml
volumes:
  postgres_data:
  redis_data:
```

Define dos volúmenes persistentes que mantienen los datos incluso si los contenedores se destruyen:
- `postgres_data`: Almacena la base de datos PostgreSQL
- `redis_data`: Almacena los datos de caché de Redis

## Beneficios de esta configuración

1. **Desarrollo local simplificado**: Con un solo comando (`docker-compose up`) se levanta todo el entorno.
2. **Consistencia entre entornos**: Garantiza que el entorno de desarrollo sea idéntico al de producción.
3. **Aislamiento**: Cada servicio funciona en su propio contenedor con sus dependencias.
4. **Hot-reloading**: Los volúmenes permiten ver cambios en tiempo real durante el desarrollo.
5. **Variables de entorno**: Usa un archivo `.env` central para configurar todos los servicios.
6. **Escalabilidad**: Esta estructura facilita agregar nuevos servicios (como microservicios adicionales).

Esta configuración es ideal para el desarrollo y prueba de la aplicación de microservicios DysaEats, y puede adaptarse fácilmente para producción ajustando algunos parámetros y optimizaciones.