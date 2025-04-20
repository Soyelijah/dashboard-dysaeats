# Implementación de CI/CD con GitHub Actions en DysaEats

Este documento detalla la configuración de Integración Continua (CI) y Entrega Continua (CD) implementada para el proyecto DysaEats utilizando GitHub Actions.

## Archivo de Configuración: `.github/workflows/ci.yml`

```yaml
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
```

## Análisis del Flujo de CI/CD

### Triggers (Desencadenantes)

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

El flujo de CI/CD se activa en dos situaciones:
1. Cuando se realiza un push directo a las ramas `main` o `develop`
2. Cuando se abre o actualiza un Pull Request que apunta a `main` o `develop`

### Jobs (Trabajos)

#### 1. Lint

```yaml
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
```

Este job verifica la calidad del código:
- Ejecuta linters para asegurar que el código sigue las reglas establecidas
- Detecta problemas de estilo y posibles errores
- Asegura consistencia en el código base

#### 2. Test Backend

```yaml
test-backend:
  name: Test Backend
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:14
      # configuración de la base de datos...
  steps:
    # pasos para ejecutar las pruebas...
```

- Configura un contenedor PostgreSQL temporal para las pruebas
- Instala dependencias del backend
- Ejecuta las pruebas unitarias y de integración
- Usa variables de entorno específicas para pruebas

#### 3. Build Backend

```yaml
build-backend:
  name: Build Backend
  runs-on: ubuntu-latest
  needs: [lint, test-backend]
  if: github.event_name == 'push'
  # pasos para construir el backend...
```

- Solo se ejecuta si los jobs de lint y test-backend son exitosos
- Solo se ejecuta en eventos de push (no en PR)
- Compila el código TypeScript a JavaScript
- Guarda el resultado como un artefacto para posible despliegue

#### 4. Build Dashboard Web

```yaml
build-dashboard-web:
  name: Build Dashboard Web
  runs-on: ubuntu-latest
  needs: [lint]
  if: github.event_name == 'push'
  # pasos para construir el frontend...
```

- Depende de que el linting sea exitoso
- Compila la aplicación Next.js
- Guarda el resultado como un artefacto para posible despliegue

## Beneficios de esta Implementación

### 1. Calidad del Código
- **Consistencia**: Asegura que todo el código siga las mismas reglas de estilo
- **Detección temprana**: Encuentra problemas antes de que lleguen a producción
- **Feedback rápido**: Los desarrolladores obtienen retroalimentación inmediata sobre sus cambios

### 2. Pruebas Automatizadas
- **Cobertura completa**: Ejecuta todas las pruebas en cada cambio
- **Entorno aislado**: Pruebas en un entorno limpio y reproducible
- **Confianza**: Mayor seguridad al integrar cambios

### 3. Compilación y Artefactos
- **Verificación de compilación**: Garantiza que el código puede ser construido correctamente
- **Artefactos listos**: Genera builds listos para despliegue
- **Historial de builds**: Mantiene un registro de todas las versiones construidas

### 4. Eficiencia del Flujo de Trabajo
- **Automatización**: Reduce tareas manuales y repetitivas
- **Paralelismo**: Ejecuta tareas simultáneamente cuando es posible
- **Dependencias claras**: Define qué pasos dependen de otros

## Extensiones Futuras

Este flujo de CI/CD puede extenderse con:

1. **Despliegue automático**: Configurar jobs adicionales para desplegar automáticamente a entornos de desarrollo, staging o producción.

2. **Pruebas e2e**: Agregar pruebas end-to-end con Cypress o Playwright.

3. **Análisis de seguridad**: Integrar herramientas como Snyk o OWASP Dependency Check.

4. **Análisis de rendimiento**: Incorporar pruebas de rendimiento y benchmarks.

5. **Notificaciones**: Configurar notificaciones en Slack, Discord o correo electrónico.

## Cómo Usar Este Flujo

1. Los desarrolladores trabajan en ramas de feature.
2. Al crear un Pull Request, el flujo de CI verifica que todo esté correcto.
3. Los revisores pueden ver los resultados de CI para tomar decisiones informadas.
4. Al aprobar y fusionar el PR, se ejecuta el flujo completo incluido el build.
5. Los artefactos generados están disponibles para su implementación.

Este sistema asegura que el código que llega a las ramas principales siempre sea de alta calidad y esté listo para su despliegue.