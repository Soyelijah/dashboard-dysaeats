# Panel de Administración DysaEats

Este módulo proporciona un panel de administración completo para la plataforma DysaEats utilizando AdminJS.

## Características

- Gestión de usuarios
- Gestión de restaurantes
- Gestión de menús (categorías e ítems)
- Gestión de pedidos
- Gestión de pagos
- Estadísticas y dashboard

## Acceso

El panel de administración está disponible en la siguiente URL:

```
http://localhost:3001/admin
```

## Credenciales

Las credenciales por defecto son:

- **Email**: admin@dysaeats.com
- **Contraseña**: AdminSuper123!

Estas credenciales se pueden modificar en el archivo `.env` actualizando las variables:

```
ADMIN_EMAIL=your_email@example.com
ADMIN_PASSWORD=your_secure_password
```

## Seguridad

El panel de administración está protegido por:

1. Autenticación de credenciales
2. Protección de sesión
3. Permisos basados en roles (solo SUPER_ADMIN y ADMIN pueden acceder)

## Estructura del Módulo

- **admin-dashboard.module.ts**: Configuración principal de AdminJS
- **admin-dashboard.controller.ts**: Controlador para la API del dashboard
- **components/**: Componentes personalizados para la interfaz
  - **dashboard.jsx**: Página principal del dashboard
  - **image-show.jsx**: Componente para mostrar imágenes

## Personalización

Para personalizar el panel, puedes:

1. Modificar los componentes en la carpeta `components/`
2. Ajustar los recursos y propiedades en `admin-dashboard.module.ts`
3. Agregar nuevos controladores para funcionalidades específicas