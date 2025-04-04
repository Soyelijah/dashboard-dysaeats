# DysaEats

Plataforma de entrega de comida y gestión de restaurantes.

## Documentación

Este proyecto cuenta con los siguientes documentos:

- [MANUAL_COMPLETO.md](./MD%20Files/MANUAL_COMPLETO.md) - Guía completa de instalación, configuración y solución de problemas
- [SCRIPT_EXPLICADO.md](./MD%20Files/SCRIPT_EXPLICADO.md) - Explicación detallada del script unificado
- [Actualización de APP](./MD%20Files/Actualizacion_de_app_APK.md) - Guía para actualizar la aplicación
- [Configuración ADB Wireless](./MD%20Files/Guía%20Detallada:%20Configuración%20de%20ADB%20Wireless.md) - Desarrollo sin cable USB

## Arquitectura

DysaEats se basa en una arquitectura de microservicios para proporcionar escalabilidad, resiliencia y facilidad de desarrollo en equipos distribuidos.

### Componentes principales

- **API Gateway**: Punto de entrada único para todas las peticiones de clientes. Gestiona la autenticación, enruta peticiones y transforma datos.
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
DysaEats/
├── backend/                              # Backend en NestJS (compartido por todas las aplicaciones)
│   ├── src/
│   │   ├── gateway/                      # API Gateway
│   │   ├── microservices/                # Implementaciones de microservicios
│   │   │   ├── auth/
│   │   │   ├── restaurants/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── deliveries/
│   │   │   ├── notifications/
│   │   │   └── analytics/
│   │   ├── config/                       # Configuraciones generales
│   │   ├── shared/                       # Módulos compartidos
│   │   ├── modules/                      # Módulos de la aplicación
│   │   ├── websockets/                   # Configuración de WebSockets
│   │   ├── app.module.ts                 # Módulo principal (monolítico)
│   │   └── main.ts                       # Punto de entrada principal
│   ├── test/                             # Tests e2e
│   └── docker-compose.yml                # Configuración de Docker Compose
│
├── dashboard-web/                        # Aplicación web del dashboard (Next.js)
│   ├── public/                           # Archivos estáticos
│   │   ├── locales/                      # Archivos de internacionalización
│   ├── src/
│   │   ├── app/                          # Estructura App Router de Next.js
│   │   │   ├── [lang]/                   # Rutas con internacionalización
│   │   ├── components/                   # Componentes de UI
│   │   ├── dictionaries/                 # Archivos de traducción (ES/EN)
│   │   ├── lib/                          # Bibliotecas y utilidades
│   │   └── theme/                        # Configuración de temas y estilos
│
└── dashboard-mobile/                     # Aplicación móvil del dashboard (React Native)
    ├── src/
    │   ├── assets/                       # Recursos estáticos
    │   ├── components/                   # Componentes de UI
    │   ├── navigation/                   # Navegación
    │   ├── screens/                      # Pantallas de la aplicación
    │   ├── services/                     # Servicios API
    │   ├── store/                        # Estado global (Redux)
    │   ├── i18n/                         # Internacionalización
    │   └── theme/                        # Configuración de temas y estilos
```

## Inicio Rápido

Para iniciar cualquier componente del proyecto, use el script unificado:

```bash
# Hacer el script ejecutable (solo necesario la primera vez)
chmod +x run.sh

# Iniciar el menú interactivo
./run.sh

# O ejecutar directamente cualquier componente
./run.sh metro    # Inicia Metro Bundler para la app móvil
./run.sh android  # Ejecuta app en Android
./run.sh ios      # Ejecuta app en iOS
./run.sh backend  # Inicia servidor backend
./run.sh web      # Inicia dashboard web
./run.sh all      # Inicia todos los componentes
```

## Requisitos

- Node.js v22.14.0
- npm v11.2.0
- Git
- PostgreSQL v14+
- Redis v6+
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS, solo en macOS)

## Características Principales

### Internacionalización

El sistema soporta múltiples idiomas (español e inglés) mediante un sistema de diccionarios:

```typescript
// dashboard-web/src/lib/dictionary.ts
import 'server-only';

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
- **Móvil**: Implementa React Native Paper con la misma paleta de colores

### Arquitectura de Microservicios

- API Gateway para gestión centralizada
- Comunicación entre servicios con TCP/RPC
- Escalado independiente de componentes
- Alta disponibilidad y resiliencia

### Otras características

- GraphQL API con Apollo Server 4
- WebSockets para notificaciones en tiempo real
- Autenticación JWT
- Gestión de permisos basada en roles
- Integración con pasarelas de pago (MercadoPago)
- Sistema de seguimiento de pedidos en tiempo real
- Dashboard para administradores y restaurantes
- Aplicación móvil para delivery y clientes

## Licencia

Propiedad de DYSA Solutions.