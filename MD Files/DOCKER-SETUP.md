# Configuración del Entorno Docker para DysaEats

Este documento proporciona instrucciones detalladas para configurar y ejecutar DysaEats utilizando Docker y Docker Compose.

## Requisitos Previos

Asegúrate de tener instalado:

- Docker (20.10.x o superior)
- Docker Compose (2.x o superior)
- Git

## Estructura de Archivos

El proyecto utiliza los siguientes archivos para la configuración de Docker:

- `docker-compose.yml`: Configuración de los servicios
- `backend/Dockerfile`: Imagen Docker para el backend (NestJS)
- `dashboard-web/Dockerfile`: Imagen Docker para el dashboard web (Next.js)
- `.env`: Variables de entorno (copiar desde `.env.example`)
- `start-docker.sh`: Script para iniciar los contenedores

## Pasos para la Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/dysaeats.git
cd dysaeats
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` según tu entorno. Las variables más importantes son:

- `DB_USERNAME`: Usuario de PostgreSQL
- `DB_PASSWORD`: Contraseña de PostgreSQL
- `DB_DATABASE`: Nombre de la base de datos
- `JWT_SECRET`: Clave secreta para firmar tokens JWT

### 3. Iniciar los Contenedores

Hay dos formas de iniciar los contenedores:

#### Opción 1: Usando el script

```bash
./start-docker.sh
```

#### Opción 2: Manualmente con Docker Compose

```bash
docker-compose up -d
```

### 4. Verificar el Estado de los Contenedores

```bash
docker-compose ps
```

Deberías ver los siguientes servicios ejecutándose:
- `dysaeats-postgres`
- `dysaeats-redis`
- `dysaeats-backend`
- `dysaeats-dashboard-web`

### 5. Acceder a los Servicios

Una vez que los contenedores estén en ejecución, puedes acceder a:

- **Backend API**: http://localhost:3000/api
- **Dashboard Web**: http://localhost:3001
- **Base de datos PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Comandos Útiles

### Ver Logs

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs backend
```

### Detener Contenedores

```bash
docker-compose down
```

### Detener y Eliminar Volúmenes (Datos)

```bash
docker-compose down -v
```

⚠️ **Advertencia**: Esto eliminará todos los datos almacenados en PostgreSQL y Redis.

### Reconstruir Imágenes

```bash
docker-compose build
```

### Reiniciar un Servicio Específico

```bash
docker-compose restart backend
```

## Solución de Problemas

### Problema: No se puede conectar a la base de datos

Verifica que:
1. Los contenedores estén en ejecución (`docker-compose ps`)
2. Las variables de entorno estén configuradas correctamente
3. No haya otro servicio utilizando el puerto 5432

### Problema: Cambios en el código no se reflejan

Para el modo de desarrollo:
1. Los volúmenes están configurados para reflejar cambios en el código sin reconstruir las imágenes
2. Para el backend, puede ser necesario reiniciar el servicio: `docker-compose restart backend`

### Problema: Error al construir las imágenes

Verifica que:
1. Los Dockerfiles estén correctamente configurados
2. Tengas permisos de escritura en los directorios del proyecto
3. Las dependencias listadas en package.json sean compatibles

## Notas para Producción

Para un entorno de producción:

1. Cambia `NODE_ENV=production` en el archivo `.env`
2. Considera usar un servidor web como Nginx como proxy reverso
3. Configura HTTPS con certificados SSL
4. Usa secretos seguros y diferentes a los de desarrollo
5. Configura copias de seguridad automáticas para los volúmenes de datos

## Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Mejores prácticas para Docker en producción](https://docs.docker.com/develop/dev-best-practices/)