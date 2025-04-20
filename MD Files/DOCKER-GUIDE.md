# Guía Completa de Docker para DysaEats

Esta guía proporciona instrucciones detalladas para configurar, ejecutar y administrar el entorno Docker de DysaEats.

## Índice

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración Inicial](#configuración-inicial)
5. [Comandos Básicos](#comandos-básicos)
6. [Solución de Problemas](#solución-de-problemas)
7. [Desarrollo con Docker](#desarrollo-con-docker)
8. [Producción con Docker](#producción-con-docker)
9. [Personalización Avanzada](#personalización-avanzada)
10. [Referencia Rápida](#referencia-rápida)

## Introducción

DysaEats utiliza Docker para crear un entorno de desarrollo y producción consistente y aislado. El sistema está compuesto por varios servicios interconectados:

- **Backend**: API REST y GraphQL basada en NestJS
- **Frontend Web**: Aplicación Next.js para administración
- **Frontend Mobile**: Aplicación React Native para usuarios finales
- **Base de datos**: PostgreSQL para almacenamiento persistente
- **Redis**: Para caché, websockets y manejo de sesiones

## Requisitos Previos

Asegúrate de tener instalados:

- Docker (v20.10.0+)
- Docker Compose (v2.0.0+)
- Git
- Node.js (opcional, solo para desarrollo fuera de Docker)

## Estructura del Proyecto

```
DysaEats/
├── .env                 # Variables de entorno
├── docker-compose.yml   # Configuración de servicios
├── start-docker.sh      # Script para iniciar servicios
├── backend/             # API NestJS
│   ├── Dockerfile       # Configuración de imagen
│   └── ...
├── dashboard-web/       # Frontend Next.js
│   ├── Dockerfile       # Configuración de imagen
│   └── ...
└── dashboard-mobile/    # App React Native
    └── ...
```

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <URL-del-repositorio>
cd DysaEats
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=devlmer-dysaeats
DB_PASSWORD=5369DysaEats..
DB_DATABASE=dysaeats

# JWT (Autenticación)
JWT_SECRET=superSecretJwtKeyForDysaEats2025
JWT_EXPIRATION=1d

# URLs de servicio
DASHBOARD_WEB_URL=http://localhost:3001
DASHBOARD_MOBILE_URL=http://localhost:19000

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# URLs públicas
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 3. Iniciar los Servicios

Ejecuta el script de inicio:

```bash
./start-docker.sh
```

Este script realizará las siguientes acciones:
- Detener contenedores existentes (si los hay)
- Construir las imágenes Docker
- Iniciar todos los contenedores
- Restaurar configuraciones modificadas temporalmente

### 4. Verificar Instalación

Una vez iniciados los servicios, estarán disponibles en:

- **Backend API**: [http://localhost:3000/api](http://localhost:3000/api)
- **Dashboard Web**: [http://localhost:3001](http://localhost:3001)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 5. Iniciar la Aplicación Móvil

La aplicación móvil no se ejecuta dentro de Docker. Para iniciarla:

```bash
# Navegar al directorio de la aplicación móvil
cd dashboard-mobile

# Instalar dependencias (si es la primera vez)
npm install

# Iniciar la aplicación en modo desarrollo
npm run start

# Para iOS (requiere macOS)
npm run ios

# Para Android
npm run android
```

También puedes usar el script incluido:

```bash
cd dashboard-mobile
./run.sh
```

La aplicación móvil se conectará al backend que está ejecutándose en Docker a través de la URL configurada en su archivo de entorno.

## Comandos Básicos

### Ver el Estado de los Contenedores

```bash
docker compose ps
```

### Ver Logs de los Servicios

Para todos los servicios:
```bash
docker compose logs -f
```

Para un servicio específico:
```bash
docker compose logs -f backend
docker compose logs -f dashboard-web
docker compose logs -f postgres
docker compose logs -f redis
```

### Detener los Servicios

```bash
docker compose down
```

### Reiniciar un Servicio Específico

```bash
docker compose restart backend
docker compose restart dashboard-web
```

### Reconstruir un Servicio

```bash
docker compose build --no-cache backend
docker compose build --no-cache dashboard-web
```

## Solución de Problemas

### Problemas con el Frontend

Si experimentas problemas con el frontend (dashboard-web), prueba:

1. Verificar los logs:
```bash
docker compose logs -f dashboard-web
```

2. Reiniciar el contenedor:
```bash
docker compose restart dashboard-web
```

3. Reconstruir el contenedor:
```bash
docker compose down
./start-docker.sh
```

### Problemas con el Backend

Si experimentas problemas con el backend, prueba:

1. Verificar los logs:
```bash
docker compose logs -f backend
```

2. Verificar la conexión a la base de datos:
```bash
docker compose exec backend npm run typeorm -- query "SELECT 1"
```

3. Reiniciar el servicio:
```bash
docker compose restart backend
```

### Problemas con la Base de Datos

1. Verificar el estado:
```bash
docker compose exec postgres pg_isready -h postgres -p 5432
```

2. Verificar las credenciales:
```bash
docker compose exec postgres psql -U devlmer-dysaeats -d dysaeats -c "SELECT 'Conexión exitosa';"
```

## Flujo de Trabajo Completo

Para trabajar con DysaEats, debes gestionar tres componentes principales:

1. **Infraestructura y Backend**: Se ejecutan con Docker usando `./start-docker.sh`
2. **Dashboard Web**: Se ejecuta en Docker como parte de `./start-docker.sh`
3. **Aplicación Móvil**: Se ejecuta fuera de Docker usando sus propios scripts

### Flujo de Trabajo Recomendado

1. **Paso 1**: Inicia la infraestructura y servicios principales
   ```bash
   ./start-docker.sh
   ```
   Esto inicia PostgreSQL, Redis, Backend API y Dashboard Web

2. **Paso 2**: Abre el Dashboard Web en tu navegador
   ```
   http://localhost:3001
   ```

3. **Paso 3**: (Opcional) Inicia la aplicación móvil
   ```bash
   cd dashboard-mobile
   ./run.sh
   ```

4. **Paso 4**: Cuando termines, detén los servicios Docker
   ```bash
   docker compose down
   ```

Con este flujo, no necesitas ejecutar `run.sh` para el dashboard web, ya que está completamente gestionado por Docker.

## Desarrollo con Docker

### Editar Archivos en Vivo

Los volúmenes están configurados para permitir editar archivos localmente y ver los cambios reflejados automáticamente:

1. Edita archivos en:
   - `./backend/src/` para el backend
   - `./dashboard-web/src/` para el frontend web

2. Los cambios se reflejarán automáticamente gracias a los volúmenes montados y los modos de desarrollo.

### Ejecutar Scripts o Comandos

Para ejecutar comandos dentro de un contenedor:

```bash
# Backend
docker compose exec backend npm run <comando>

# Frontend
docker compose exec dashboard-web npm run <comando>

# Base de datos
docker compose exec postgres psql -U devlmer-dysaeats -d dysaeats
```

### Migración de Base de Datos

```bash
docker compose exec backend npm run migration:run
```

## Producción con Docker

Para implementar en producción, considera:

1. Actualizar las variables de entorno en `.env` para producción
2. Modificar `docker-compose.yml` para eliminar volúmenes de desarrollo
3. Usar un proxy inverso como Nginx para exponer los servicios

Ejemplo de configuración para producción:

```yaml
services:
  backend:
    restart: always
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
  
  dashboard-web:
    restart: always
    environment:
      - NODE_ENV=production
```

## Personalización Avanzada

### Cambiar Puertos

Edita `docker-compose.yml` para cambiar los puertos expuestos:

```yaml
services:
  backend:
    ports:
      - "8080:3000"  # Cambia 3000 por el puerto deseado
  
  dashboard-web:
    ports:
      - "8081:3000"  # Cambia 3001 por el puerto deseado
```

### Añadir Servicios

Para añadir nuevos servicios, edita `docker-compose.yml`:

```yaml
services:
  nuevo-servicio:
    image: imagen:tag
    container_name: dysaeats-nuevo-servicio
    restart: always
    ports:
      - "puerto:puerto"
    environment:
      - VARIABLE=valor
    volumes:
      - ./ruta-local:/ruta-en-contenedor
```

### Modificar Recursos

Para ajustar límites de recursos:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## Referencia Rápida

| Comando | Descripción |
|---------|-------------|
| `./start-docker.sh` | Iniciar todos los servicios |
| `docker compose down` | Detener todos los servicios |
| `docker compose ps` | Ver estado de los contenedores |
| `docker compose logs -f` | Ver logs de todos los servicios |
| `docker compose restart <servicio>` | Reiniciar un servicio específico |
| `docker compose exec <servicio> <comando>` | Ejecutar comando en un servicio |
| `docker compose build --no-cache` | Reconstruir imágenes sin caché |

---

## Información Adicional

### Estructura de Imágenes Docker

#### Backend (NestJS)

La imagen del backend utiliza un enfoque de múltiples etapas:
1. **Base**: Node.js 18 Alpine como base ligera
2. **Desarrollo**: Instala dependencias y configura el entorno
3. **Construcción**: Compila la aplicación
4. **Producción**: Copia solo los archivos necesarios para reducir tamaño

#### Frontend (Next.js)

La imagen del frontend utiliza un enfoque simplificado:
1. Usa Node.js 18 Alpine
2. Instala dependencias
3. Copia archivos de la aplicación
4. Ejecuta en modo desarrollo para evitar problemas de compilación

### Seguridad

- Los contenedores están configurados para usar usuarios no-root
- Las credenciales sensibles están en variables de entorno
- Las imágenes están optimizadas para reducir superficie de ataque

---

Creado por Claude para DysaEats | Fecha: 4/4/2025