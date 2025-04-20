# DysaEats Dashboard Web

Panel de administración web para la plataforma DysaEats, construido con Next.js, React y Tailwind CSS.

## Tecnologías principales

- **Next.js**: Framework de React para aplicaciones web
- **React**: Biblioteca para construir interfaces de usuario
- **Tailwind CSS**: Framework de utilidades CSS
- **Radix UI**: Componentes primitivos accesibles
- **TanStack React Table**: Tablas complejas y potentes
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas
- **Axios**: Cliente HTTP
- **Socket.io-client**: WebSockets para tiempo real

## Estructura del proyecto

```
dashboard-web/
├── public/
│   ├── locales/                 # Archivos de internacionalización
│   │   ├── es/                  # Español
│   │   └── en/                  # Inglés
│   └── assets/                  # Imágenes, fuentes, etc.
├── src/
│   ├── app/                     # Estructura App Router de Next.js
│   │   ├── (auth)/              # Grupo de rutas de autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/           # Grupo de rutas del panel principal
│   │   │   ├── orders/
│   │   │   ├── restaurants/
│   │   │   ├── deliveries/
│   │   │   ├── payments/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── page.tsx             # Página de inicio
│   │   └── layout.tsx           # Layout principal
│   ├── components/              # Componentes de UI
│   │   ├── common/              # Componentes comunes
│   │   ├── forms/               # Componentes de formularios
│   │   ├── layout/              # Componentes de layout
│   │   ├── orders/              # Componentes específicos de pedidos
│   │   ├── restaurants/         # Componentes específicos de restaurantes
│   │   └── analytics/           # Componentes de analíticas
│   ├── hooks/                   # Hooks personalizados
│   ├── lib/                     # Bibliotecas y utilidades
│   │   ├── api.ts               # Cliente API
│   │   ├── socket.ts            # Configuración de Socket.io
│   │   ├── validation.ts        # Funciones de validación (RUT, etc.)
│   │   └── utils.ts             # Utilidades generales
│   ├── store/                   # Estado global
│   └── types/                   # Definiciones de tipos
└── ...
```

## Requisitos previos

- Node.js 18.x o superior
- npm 8.x o superior

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <repositorio>
   cd dysaeats/dashboard-web
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:3000`.

## Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Compila la aplicación para producción
- `npm run start`: Inicia la aplicación compilada
- `npm run lint`: Ejecuta el linter

## Características principales

- **Autenticación**: Sistema de login/registro con JWT
- **Panel de control**: Vista general con KPIs y actividad reciente
- **Gestión de restaurantes**: CRUD de restaurantes y menús
- **Gestión de pedidos**: Seguimiento y administración de pedidos
- **Gestión de entregas**: Asignación y seguimiento de repartidores
- **Analíticas**: Gráficos y estadísticas de ventas, pedidos, etc.
- **Tiempo real**: Notificaciones y actualización en tiempo real
- **Internacionalización**: Soporte para múltiples idiomas (ES/EN)
- **Tema oscuro/claro**: Cambio de tema según preferencias del usuario

## Licencia

Este proyecto es propiedad de DYSA Solutions.