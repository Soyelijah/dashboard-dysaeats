# DysaEats2

Plataforma de entrega de comida y gestión de restaurantes.

## Documentación

- [ADMIN_PANEL_STATUS.md](./ADMIN_PANEL_STATUS.md) - Estado actual del panel de administración
- [EVENT_SOURCING.md](./dashboard-web/EVENT_SOURCING.md) - Documentación sobre Event Sourcing
- [EXTENDING_EVENT_SOURCING.md](./dashboard-web/EXTENDING_EVENT_SOURCING.md) - Guía para extender Event Sourcing

## Configuración del entorno local

### Base de datos
1. **Instalar PostgreSQL:**
   ```bash
   # En macOS
   brew install postgresql@14
   brew services start postgresql@14
   
   # Crear base de datos
   createdb -h localhost -U [tu-usuario] dysaeats
   ```

2. **Configurar variables de entorno:**
   - Copia el archivo `.env.example` a `.env`
   - Actualiza los valores de conexión a la base de datos

### Instalación de dependencias
```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del dashboard web
cd ../dashboard-web
npm install
```

### Scripts disponibles

#### Desarrollo
Para iniciar tanto el backend como el frontend:
```bash
./run-dev.sh
```

Este script:
- Verifica que PostgreSQL esté en ejecución
- Verifica que la base de datos existe
- Inicia el backend (NestJS) y frontend (Next.js) en terminales separadas

## Arquitectura

DysaEats2 se basa en una arquitectura de microservicios para proporcionar escalabilidad, resiliencia y facilidad de desarrollo en equipos distribuidos.

### Componentes principales

- **API Gateway**: Punto de entrada único para todas las peticiones de clientes. Gestiona la autenticación, enrutamiento y transformación.
- **Servicio de Autenticación**: Gestiona usuarios, sesiones y permisos.
- **Servicio de Restaurantes**: Administra catálogos de restaurantes y menús.
- **Servicio de Pedidos**: Procesa la creación y seguimiento de pedidos.
- **Servicio de Pagos**: Integra con proveedores de pago y gestiona transacciones.
- **Servicio de Entregas**: Coordina la asignación y seguimiento de repartidores.
- **Servicio de Notificaciones**: Envía notificaciones a usuarios a través de diferentes canales.
- **Servicio de Análisis**: Recopila y analiza datos para generar insights.

### Beneficios de la arquitectura

- **Escalado independiente**: Cada servicio puede escalar según sus necesidades específicas.
- **Aislamiento de responsabilidades**: Los fallos en un servicio no afectan a otros.
- **Desarrollo en paralelo**: Equipos independientes pueden trabajar en diferentes servicios.
- **Tecnologías específicas**: Cada servicio puede utilizar la tecnología más adecuada para su función.
- **Despliegue continuo**: Los servicios pueden ser actualizados de forma independiente.

## Estructura del Proyecto

```
DysaEats2/
├── backend/                              # Backend en NestJS
│   ├── src/
│   │   ├── config/                       # Configuraciones
│   │   ├── shared/                       # Módulos compartidos
│   │   ├── modules/                      # Módulos de aplicación
│   │   │   ├── admin-dashboard/
│   │   │   ├── auth/
│   │   │   ├── restaurants/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── deliveries/
│   │   │   ├── notifications/
│   │   │   └── analytics/
│   │   ├── gateway/                      # API Gateway
│   │   ├── websockets/                   # WebSockets para tiempo real
│   │   └── microservices/                # Microservicios
│
├── dashboard-web/                        # Aplicación web del dashboard (Next.js)
│   ├── public/                           # Archivos estáticos
│   ├── src/
│   │   ├── app/                          # Estructura App Router de Next.js
│   │   ├── components/                   # Componentes React
│   │   │   ├── admin/                    # Componentes del panel de administración
│   │   │   ├── analytics/                # Componentes de analytics
│   │   │   ├── common/                   # Componentes comunes
│   │   │   ├── event-sourcing/           # Componentes de Event Sourcing
│   │   │   └── ui/                       # Componentes de UI básicos
│   │   ├── services/                     # Servicios y clientes API
│   │   ├── hooks/                        # Hooks personalizados
│   │   └── lib/                          # Utilidades y configuraciones
│
└── dashboard-mobile/                     # Aplicación móvil (React Native)
    ├── android/                          # Configuración específica de Android
    ├── ios/                              # Configuración específica de iOS
    └── src/                              # Código fuente (pendiente de implementar)
```

## Event Sourcing

DysaEats2 implementa un sistema de Event Sourcing que proporciona:

- **Auditoría completa**: Registro inmutable de todos los cambios del sistema.
- **Reproducibilidad**: Capacidad de reconstruir el estado del sistema en cualquier punto del tiempo.
- **Resiliencia**: Los eventos pueden ser reproducidos para recuperar datos después de fallos.
- **Escalabilidad**: La separación de escritura y lectura permite escalar cada aspecto independientemente.

Para más detalles, consulta [EVENT_SOURCING.md](./dashboard-web/EVENT_SOURCING.md).

## Estado del Panel de Administración

El panel de administración incluye:

- ✅ Gestión de usuarios
- ✅ Gestión de restaurantes
- ✅ Gestión de categorías
- ✅ Visualización de pedidos
- ✅ Estadísticas básicas
- 🚧 Gestión de ítems de menú (en progreso)
- 🚧 Gestión de repartidores (en progreso)
- 🚧 Gestión de pagos (pendiente)

Para ver el estado detallado, consulta [ADMIN_PANEL_STATUS.md](./ADMIN_PANEL_STATUS.md).

## Puertos utilizados
- **Backend API**: http://localhost:3001
- **Frontend Web**: http://localhost:3000

## Requisitos

- Node.js v22.14.0+
- npm v11.2.0+
- Git
- PostgreSQL v14+
- Android Studio (para desarrollo de la app móvil en Android)
- Xcode (para desarrollo de la app móvil en iOS, solo en macOS)

## Características Principales

### Internacionalización

El sistema soporta múltiples idiomas (español e inglés) mediante un sistema de diccionarios:

```typescript
// dashboard-web/src/lib/dictionary.ts
const dictionaries = {
  en: () => import('../dictionaries/en.json').then(module => module.default),
  es: () => import('../dictionaries/es.json').then(module => module.default)
};

export const getDictionary = async (locale: string) => {
  return dictionaries[locale as keyof typeof dictionaries]?.() ?? dictionaries.es();
};
```

### Temas y diseño adaptable

El sistema implementa un tema coherente tanto en la aplicación web como móvil:

- **Web**: Utiliza Tailwind CSS con una paleta de colores personalizada
- **Móvil**: Implementa React Native con la misma paleta de colores

### Otras características

- WebSockets para notificaciones en tiempo real
- Autenticación JWT con control de acceso basado en roles
- Integración con pasarelas de pago (MercadoPago)
- Sistema de seguimiento de pedidos en tiempo real
- Aplicación web y móvil con interfaces consistentes

## Licencia

Propiedad de DYSA Solutions.