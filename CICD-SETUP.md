# Configuración Inicial de CI/CD para DysaEats

Este documento detalla los pasos necesarios para comenzar a utilizar el sistema de Integración Continua y Despliegue Continuo (CI/CD) configurado con GitHub Actions para el proyecto DysaEats.

## Índice

1. [Requisitos previos](#requisitos-previos)
2. [Configuración de secretos en GitHub](#configuración-de-secretos-en-github)
3. [Configuración de entornos de despliegue](#configuración-de-entornos-de-despliegue)
4. [Verificación de la configuración](#verificación-de-la-configuración)
5. [Estrategia de ramas y tags](#estrategia-de-ramas-y-tags)
6. [Solución de problemas comunes](#solución-de-problemas-comunes)

## Requisitos previos

Antes de comenzar, asegúrate de tener:

1. **Acceso administrativo** al repositorio GitHub
2. **Cuenta en Docker Hub** para almacenar imágenes Docker
3. **Servidor para entorno de staging** (puede ser un VPS como DigitalOcean, AWS EC2, etc.)
4. **Servidor para entorno de producción** (preferiblemente separado del de staging)
5. **Acceso SSH** a ambos servidores

## Configuración de secretos en GitHub

Para que los flujos de trabajo de CI/CD funcionen correctamente, debes configurar los siguientes secretos en tu repositorio de GitHub:

1. Ve a tu repositorio en GitHub
2. Navega a **Settings > Secrets and variables > Actions**
3. Haz clic en **New repository secret**
4. Agrega los siguientes secretos:

### Para Docker Hub:

| Nombre secreto | Descripción | Ejemplo |
|---|---|---|
| `DOCKER_USERNAME` | Nombre de usuario de Docker Hub | `soyelijah` |
| `DOCKER_PASSWORD` | Token de acceso personal de Docker Hub (no uses tu contraseña) | `dckr_pat_aBcDeFgHiJkLmNoPqRsTuVwX` |

Para crear un token de acceso personal en Docker Hub:
1. Inicia sesión en [Docker Hub](https://hub.docker.com)
2. Ve a **Account Settings > Security**
3. Haz clic en **New Access Token**
4. Asigna un nombre descriptivo y selecciona los permisos necesarios

### Para despliegue en Staging:

| Nombre secreto | Descripción | Ejemplo |
|---|---|---|
| `SSH_PRIVATE_KEY` | Clave SSH privada para conectar al servidor de staging | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SSH_KNOWN_HOSTS` | Resultado de `ssh-keyscan` del servidor de staging | `server.example.com ssh-rsa AAAAB3Nza...` |
| `SSH_USER` | Usuario SSH del servidor de staging | `ubuntu` |
| `SSH_HOST` | Dirección IP o dominio del servidor de staging | `staging.dysaeats.com` |

### Para despliegue en Producción:

| Nombre secreto | Descripción | Ejemplo |
|---|---|---|
| `PROD_SSH_PRIVATE_KEY` | Clave SSH privada para conectar al servidor de producción | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PROD_SSH_KNOWN_HOSTS` | Resultado de `ssh-keyscan` del servidor de producción | `server.example.com ssh-rsa AAAAB3Nza...` |
| `PROD_SSH_USER` | Usuario SSH del servidor de producción | `ubuntu` |
| `PROD_SSH_HOST` | Dirección IP o dominio del servidor de producción | `dysaeats.com` |

### Generar valores para los secretos:

#### Para `SSH_PRIVATE_KEY` y `PROD_SSH_PRIVATE_KEY`:
```bash
# Generar un nuevo par de claves (opcional si ya tienes una)
ssh-keygen -t ed25519 -C "dysaeats-deploy-key"

# Mostrar la clave privada para copiarla
cat ~/.ssh/id_ed25519
```

#### Para `SSH_KNOWN_HOSTS` y `PROD_SSH_KNOWN_HOSTS`:
```bash
# Reemplaza example.com con tu dominio o IP
ssh-keyscan -H example.com
```

## Configuración de entornos de despliegue

### 1. Servidor de Staging

En tu servidor de staging, configura el entorno de Docker:

```bash
# Instalar Docker si no está instalado
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorio para el proyecto
mkdir -p ~/dysaeats-staging
cd ~/dysaeats-staging

# Clonar repositorio
git clone https://github.com/Soyelijah/dashboard-dysaeats.git .

# Configurar archivo .env con valores para staging
cp .env.example .env
nano .env  # Editar con los valores correctos
```

### 2. Servidor de Producción

Sigue los mismos pasos que en el servidor de staging, pero con consideraciones adicionales para producción:

```bash
# Crear directorio para el proyecto
mkdir -p ~/dysaeats-production
cd ~/dysaeats-production

# Clonar repositorio
git clone https://github.com/Soyelijah/dashboard-dysaeats.git .

# Crear y editar archivo .env con valores para producción
cp .env.example .env
nano .env  # Editar con los valores correctos para producción

# Configurar Nginx para SSL
mkdir -p ./nginx/ssl
```

#### Configuración de SSL con Let's Encrypt:

```bash
# Instalar Certbot
sudo apt update
sudo apt install -y certbot

# Obtener certificado
sudo certbot certonly --standalone -d dysaeats.com -d www.dysaeats.com

# Copiar certificados al directorio de Nginx
sudo cp /etc/letsencrypt/live/dysaeats.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/dysaeats.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/*.pem
```

## Verificación de la configuración

Para verificar que la configuración de CI/CD está funcionando correctamente:

1. **Crear una rama de feature**:
   ```bash
   git checkout -b feature/test-cicd
   # Realizar algún cambio pequeño
   git add .
   git commit -m "test: verificar configuración de CI/CD"
   git push origin feature/test-cicd
   ```

2. **Crear un Pull Request** a la rama `develop` en GitHub

3. **Verificar que las acciones de CI se ejecutan** en la pestaña "Actions" de GitHub

## Estrategia de ramas y tags

Para aprovechar al máximo el sistema de CI/CD:

### Ramas principales:
- `main`: Representa el código en producción
- `develop`: Rama de integración para desarrollo

### Flujo de trabajo:
1. Crear ramas de feature desde `develop`: `feature/nombre-caracteristica`
2. Crear Pull Request a `develop` cuando el feature esté listo
3. Después de probar en staging, hacer merge de `develop` a `main`
4. Para despliegue en producción, crear un tag en la rama `main`:
   ```bash
   git checkout main
   git pull
   git tag -a v1.0.0 -m "Versión 1.0.0"
   git push origin v1.0.0
   ```

## Solución de problemas comunes

### Las acciones de CI/CD no se ejecutan:
- Verifica que los archivos de workflow estén en la rama correcta (`.github/workflows/`)
- Asegúrate de que los eventos definidos en los workflows coincidan con tus acciones (push, pull request, etc.)

### Errores de Docker:
- Verifica que los secretos `DOCKER_USERNAME` y `DOCKER_PASSWORD` sean correctos
- Asegúrate de que tu usuario de Docker Hub tenga permisos para subir imágenes

### Errores de despliegue:
- Verifica que los secretos SSH estén configurados correctamente
- Asegúrate de que la clave SSH tenga los permisos adecuados en el servidor
- Verifica que el directorio del proyecto exista en el servidor
- Comprueba los logs en GitHub Actions para ver mensajes de error específicos

### Pasos para depuración:
1. Revisa los logs en la pestaña "Actions" de GitHub
2. Comprueba manualmente la conexión SSH a los servidores
3. Intenta ejecutar los comandos Docker manualmente en el servidor
4. Verifica los permisos de archivos y directorios

---

## Próximos pasos

Una vez configurado el CI/CD, considera implementar:

1. **Monitorización**: Añadir herramientas como Prometheus y Grafana
2. **Notificaciones**: Configurar alertas en Slack/Discord/Email para despliegues y errores
3. **Pruebas automáticas adicionales**: Añadir pruebas e2e, de integración, etc.
4. **Escaneo de seguridad**: Integrar herramientas como Snyk o Trivy para escanear vulnerabilidades

Con esta configuración inicial, tu proyecto DysaEats estará listo para implementar prácticas modernas de DevOps y entregas continuas.