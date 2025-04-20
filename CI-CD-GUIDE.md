# Guía de CI/CD para DysaEats

Esta guía explica cómo está configurado el sistema de Integración Continua y Despliegue Continuo (CI/CD) para el proyecto DysaEats.

## Índice

1. [Resumen](#resumen)
2. [Flujo de trabajo](#flujo-de-trabajo)
3. [Configuración de GitHub Actions](#configuración-de-github-actions)
4. [Despliegue en entornos](#despliegue-en-entornos)
5. [Secretos necesarios](#secretos-necesarios)
6. [Personalización y extensión](#personalización-y-extensión)

## Resumen

El sistema CI/CD de DysaEats utiliza GitHub Actions para automatizar:

- **Linting y verificación de tipos**
- **Ejecución de pruebas**
- **Construcción de aplicaciones**
- **Construcción y publicación de imágenes Docker**
- **Despliegue automático en entornos de staging y producción**

## Flujo de trabajo

### Desarrollo

1. Los desarrolladores trabajan en ramas de feature (`feature/nombre-caracteristica`)
2. Cuando el feature está listo, se crea un Pull Request (PR) a la rama `develop`
3. GitHub Actions ejecuta lint, verificación de tipos y pruebas
4. Si pasan todas las verificaciones, el PR puede ser revisado y mezclado

### Integración

1. Cuando se mezclan cambios en `develop`, GitHub Actions:
   - Ejecuta todas las verificaciones (lint, tipos, pruebas)
   - Construye las aplicaciones (backend, frontend)
   - Construye y publica las imágenes Docker con etiqueta `develop`

### Despliegue en Staging

1. Cuando se mezcla `develop` a `main`, GitHub Actions:
   - Ejecuta todas las verificaciones
   - Construye las aplicaciones
   - Construye y publica las imágenes Docker con etiqueta `latest`
   - Despliega automáticamente en el entorno de staging

### Despliegue en Producción

1. Para desplegar en producción, se crea un tag de versión (ej: `v1.0.0`) en la rama `main`
2. GitHub Actions:
   - Construye y publica las imágenes Docker con la etiqueta de versión
   - Despliega automáticamente en el entorno de producción

## Configuración de GitHub Actions

### CI (.github/workflows/ci.yml)

Este workflow se ejecuta en cada push a las ramas `main` y `develop`, y en todos los Pull Requests a estas ramas:

- **lint**: Verifica el estilo y calidad del código
- **test-backend**: Ejecuta las pruebas del backend con una base de datos PostgreSQL temporal
- **build-backend**: Construye el backend y guarda el artefacto
- **build-dashboard-web**: Construye el frontend y guarda el artefacto

### CD (.github/workflows/cd.yml)

Este workflow se ejecuta cuando:
- Se hace push a `main` (despliegue en staging)
- Se crea un tag con formato `v*` (despliegue en producción)

Tareas:
- **build-and-push-docker**: Construye y publica las imágenes Docker
- **deploy-staging**: Despliega en staging si el evento fue un push a `main`
- **deploy-production**: Despliega en producción si el evento fue un tag de versión

## Despliegue en entornos

### Staging

El despliegue en staging se realiza automáticamente cuando se hace push a `main`:

1. Se conecta vía SSH al servidor de staging
2. Actualiza el repositorio con `git pull`
3. Actualiza las imágenes Docker
4. Reinicia los contenedores

### Producción

El despliegue en producción se realiza automáticamente cuando se crea un tag de versión:

1. Se conecta vía SSH al servidor de producción
2. Actualiza el repositorio con `git pull`
3. Establece la variable de entorno TAG con la versión del tag
4. Actualiza las imágenes Docker
5. Reinicia los contenedores

## Secretos necesarios

Para que el CI/CD funcione correctamente, necesitas configurar los siguientes secretos en GitHub:

### Para Docker Hub:
- `DOCKER_USERNAME`: Usuario de Docker Hub
- `DOCKER_PASSWORD`: Contraseña o token de Docker Hub

### Para despliegue en Staging:
- `SSH_PRIVATE_KEY`: Clave SSH privada para conectar al servidor
- `SSH_KNOWN_HOSTS`: Resultado de `ssh-keyscan` del servidor
- `SSH_USER`: Usuario SSH del servidor
- `SSH_HOST`: Dirección IP o dominio del servidor

### Para despliegue en Producción:
- `PROD_SSH_PRIVATE_KEY`: Clave SSH privada para el servidor de producción
- `PROD_SSH_KNOWN_HOSTS`: Resultado de `ssh-keyscan` del servidor de producción
- `PROD_SSH_USER`: Usuario SSH del servidor de producción
- `PROD_SSH_HOST`: Dirección IP o dominio del servidor de producción

## Personalización y extensión

### Agregar verificaciones

Puedes agregar más pasos de verificación en `ci.yml`, por ejemplo:

```yaml
security-scan:
  name: Security Scan
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Run security scan
      uses: anchore/scan-action@v3
```

### Modificar entornos de despliegue

Si necesitas más entornos (ej: QA, Demo), puedes agregar más jobs en `cd.yml`:

```yaml
deploy-qa:
  name: Deploy to QA
  runs-on: ubuntu-latest
  needs: build-and-push-docker
  if: github.ref == 'refs/heads/develop'
  # ... pasos de despliegue
```

### Notificaciones

Puedes agregar notificaciones (Slack, Discord, Email) al final de los workflows:

```yaml
notify:
  name: Notify team
  runs-on: ubuntu-latest
  needs: [deploy-staging]
  if: always()
  steps:
    - name: Send Slack notification
      uses: slackapi/slack-github-action@v1.23.0
      with:
        channel-id: 'C123ABC'
        slack-message: "Deployment to staging ${{ needs.deploy-staging.result == 'success' && 'succeeded' || 'failed' }}!"
      env:
        SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```