# DysaEats Backend

Backend para la plataforma DysaEats, construido con NestJS, TypeORM, GraphQL y WebSockets.

## Tecnologías principales

- **NestJS**: Framework para construir aplicaciones escalables en Node.js
- **TypeORM**: ORM para TypeScript y JavaScript
- **GraphQL**: API GraphQL con Apollo Server 4
- **WebSockets**: Comunicación en tiempo real
- **PostgreSQL**: Base de datos relacional
- **Redis**: Caché y pub/sub para WebSockets

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/                  # Configuraciones de la aplicación
│   ├── database/                # Configuración de base de datos
│   │   ├── entities/            # Entidades de TypeORM
│   │   ├── migrations/          # Migraciones de base de datos
│   │   └── seeds/               # Datos semilla para desarrollo
│   ├── shared/                  # Módulos compartidos
│   │   ├── constants/           # Constantes globales
│   │   ├── decorators/          # Decoradores personalizados
│   │   ├── dto/                 # DTOs compartidos
│   │   ├── filters/             # Filtros de excepción
│   │   ├── guards/              # Guards de autenticación/autorización
│   │   ├── interfaces/          # Interfaces compartidas
│   │   ├── pipes/               # Pipes de validación
│   │   └── utils/               # Utilidades
│   ├── modules/                 # Módulos de la aplicación
│   │   ├── auth/                # Autenticación
│   │   ├── restaurants/         # Gestión de restaurantes
│   │   ├── orders/              # Gestión de pedidos
│   │   ├── payments/            # Gestión de pagos
│   │   ├── deliveries/          # Gestión de entregas
│   │   ├── notifications/       # Sistema de notificaciones
│   │   └── analytics/           # Analíticas y reportes
│   ├── websockets/              # Configuración de WebSockets
│   ├── app.module.ts            # Módulo principal
│   └── main.ts                  # Punto de entrada
└── test/                        # Tests
```

## Requisitos previos

- Node.js (v18.x o superior)
- npm (v8.x o superior) o yarn
- PostgreSQL (v14.x o superior)
- Redis (v6.x o superior)

## Configuración

1. Clonar el repositorio:
   ```bash
   git clone <repositorio>
   cd dysaeats/backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Editar el archivo `.env` con los valores correctos para tu entorno.

4. Ejecutar migraciones:
   ```bash
   npm run migration:run
   ```

5. (Opcional) Ejecutar seeds para datos de prueba:
   ```bash
   npm run seed
   ```

## Desarrollo

Para iniciar el servidor en modo desarrollo:

```bash
npm run start:dev
```

El servidor se iniciará en `http://localhost:3000` (o el puerto especificado en .env).

- API REST: `http://localhost:3000/api`
- GraphQL Playground: `http://localhost:3000/graphql`

## Scripts disponibles

- `npm run build`: Compila la aplicación
- `npm run start`: Inicia la aplicación compilada
- `npm run start:dev`: Inicia la aplicación en modo desarrollo (con hot reload)
- `npm run start:debug`: Inicia la aplicación en modo debug
- `npm run start:prod`: Inicia la aplicación en modo producción
- `npm run lint`: Ejecuta el linter
- `npm run test`: Ejecuta tests unitarios
- `npm run test:e2e`: Ejecuta tests end-to-end
- `npm run migration:generate -- -n MigrationName`: Genera una nueva migración
- `npm run migration:run`: Ejecuta las migraciones pendientes
- `npm run migration:revert`: Revierte la última migración
- `npm run seed`: Ejecuta los seeds para datos de prueba

## Convenciones de código

El proyecto utiliza ESLint y Prettier para mantener un estilo de código consistente:

```bash
npm run lint
npm run format
```

## Deployment

Para preparar la aplicación para producción:

1. Compilar la aplicación:
   ```bash
   npm run build
   ```

2. Configurar variables de entorno para producción.

3. Ejecutar migraciones:
   ```bash
   NODE_ENV=production npm run migration:run
   ```

4. Iniciar la aplicación:
   ```bash
   npm run start:prod
   ```

## Docker

También puedes usar Docker para ejecutar la aplicación:

```bash
docker-compose up -d
```

## Documentación

La documentación de la API está disponible en el GraphQL Playground (`/graphql`).

## Licencia

Este proyecto es propiedad de DYSA Solutions.