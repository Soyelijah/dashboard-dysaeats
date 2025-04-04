# Manual Completo DysaEats

Este manual contiene toda la información necesaria para configurar, ejecutar y solucionar problemas del proyecto DysaEats.

## Índice
- [Requisitos del Sistema](#requisitos-del-sistema)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Script Unificado](#script-unificado)
- [Instalación Manual](#instalación-manual)
- [Guía Paso a Paso](#guía-paso-a-paso)
- [URLs Importantes](#urls-importantes)
- [Solución de Problemas](#solución-de-problemas)
- [Configuraciones Técnicas](#configuraciones-técnicas)

## Requisitos del Sistema

- **Node.js**: v22.14.0 (versión recomendada para la app móvil, v18+ para el resto)
- **npm**: v11.2.0
- **Git**
- **PostgreSQL**: v14.x o superior
- **Redis**: v6.x o superior
- **Para desarrollo iOS**:
  - Xcode (solo para macOS)
  - CocoaPods
- **Para desarrollo Android**:
  - Android Studio
  - Java JDK 11+
  - SDK Android configurado

## Estructura del Proyecto

```
DysaEats/
├── backend/               # Servidor GraphQL NestJS con Apollo
│   └── src/
│       ├── config/        # Configuraciones de la aplicación
│       ├── shared/        # Utilidades y componentes compartidos
│       ├── modules/       # Módulos de la aplicación
│       └── websockets/    # Implementación de WebSockets
├── dashboard-web/         # Panel de administración web (Next.js)
├── dashboard-mobile/      # Aplicación móvil (React Native)
│   └── src/
│       ├── assets/        # Recursos estáticos (imágenes, etc.)
│       ├── components/    # Componentes reutilizables
│       ├── contexts/      # Contextos de React
│       ├── hooks/         # Hooks personalizados
│       ├── lib/           # Utilidades y configuraciones
│       ├── navigation/    # Configuración de navegación
│       ├── screens/       # Pantallas de la aplicación
│       ├── services/      # Servicios para API, etc.
│       ├── store/         # Configuración de Redux
│       ├── translations/  # Archivos de traducción
│       ├── types/         # Definiciones de TypeScript
│       └── utils/         # Funciones utilitarias
└── run.sh                 # Script unificado para ejecutar el proyecto
```

## Script Unificado

Se ha creado un script unificado (`run.sh`) para simplificar la ejecución de todos los componentes del proyecto DysaEats. Este script está diseñado para funcionar con Node.js v22.14.0 y npm 11.2.0, evitando los problemas comunes que ocurren con versiones recientes de Node.js al ejecutar React Native.

### Ubicación del script

El script está disponible en dos ubicaciones:
- `/Users/devlmer/project-dysaeats/DysaEats/run.sh` (script global para todo el proyecto)
- `/Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile/run.sh` (script específico para la app móvil)

### Uso Básico

1. Hacer el script ejecutable:
   ```bash
   chmod +x run.sh
   ```

2. Ejecutar el script para ver el menú de opciones:
   ```bash
   ./run.sh
   ```

3. Opciones disponibles directamente:
   ```bash
   # Iniciar Metro Bundler para la app móvil
   ./run.sh metro
   
   # Ejecutar app en Android
   ./run.sh android
   
   # Ejecutar app en iOS
   ./run.sh ios
   
   # Iniciar servidor backend
   ./run.sh backend
   
   # Iniciar dashboard web
   ./run.sh web
   
   # Iniciar todos los componentes (en terminales separadas)
   ./run.sh all
   
   # Mostrar ayuda
   ./run.sh help
   ```

Para más detalles sobre el script unificado, consulta [SCRIPT_EXPLICADO.md](./SCRIPT_EXPLICADO.md).

## Instalación Manual

Si prefieres no usar el script unificado, puedes seguir estos pasos para instalar y ejecutar cada componente manualmente.

### Configuración del Backend

1. Instalar dependencias:
   ```bash
   cd backend
   npm install
   ```

2. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```

3. Ejecutar migraciones de la base de datos:
   ```bash
   npm run migration:run
   ```

4. Iniciar el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```

### Dashboard Web

1. Instalar dependencias:
   ```bash
   cd dashboard-web
   npm install
   ```

2. Iniciar la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

### App Móvil

1. Instalar dependencias:
   ```bash
   cd dashboard-mobile
   npm install
   ```

2. Iniciar la aplicación (usando el método que evita errores con Node.js v22+):
   ```bash
   cd dashboard-mobile
   node ./node_modules/@react-native-community/cli/build/bin.js start
   ```

## Guía Paso a Paso

### Para ver el Dashboard Web:

1. Abre una nueva terminal
2. Navega al directorio del dashboard web:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-web
   ```
3. Inicia el servidor de desarrollo de Next.js:
   ```bash
   npm run dev
   ```
4. Espera a que complete el inicio (verás mensajes de compilación)
5. Abre tu navegador y ve a: `http://localhost:3000`
6. Deberías ver la interfaz de tu dashboard web. Si inicia en una página en blanco, navega a `http://localhost:3000/dashboard`

### Para ver la App Mobile:

**Nota importante:** La app móvil puede requerir configuración adicional para su primera ejecución correcta.

#### Opción 1: Usar el script unificado (recomendado)

1. Abre una nueva terminal
2. Navega al directorio de la app mobile:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   ./run.sh metro
   ```
4. En otra terminal, ejecuta la aplicación en Android:
   ```bash
   ./run.sh android
   ```

#### Opción 2: Compilar e instalar directamente el APK

Esta opción es útil cuando hay problemas con el bundler de JavaScript o necesitas instalar la app directamente en un dispositivo.

1. Compila e instala la aplicación en un solo paso:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile/android && ./gradlew assembleDebug && adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

2. Si tienes múltiples dispositivos conectados, primero lista los dispositivos:
   ```bash
   adb devices
   ```
   
   Luego instala en el dispositivo específico:
   ```bash
   adb -s [ID_DEL_DISPOSITIVO] install -r app/build/outputs/apk/debug/app-debug.apk
   ```

#### Opción 3: Ejecución manual (avanzado)

1. Aumenta el límite de archivos abiertos para esta sesión:
   ```bash
   ulimit -n 65536
   ```
2. Inicia Metro Bundler manualmente:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile
   node ./node_modules/@react-native-community/cli/build/bin.js start
   ```
3. En otra terminal, ejecuta la aplicación:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile
   node ./node_modules/@react-native-community/cli/build/bin.js run-android
   ```

### Para verificar el backend:

1. Si necesitas iniciar el backend (normalmente ya está corriendo):
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/backend
   npm run start:dev
   ```
2. Verifica que esté funcionando visitando: `http://localhost:3001/api/auth`

### Para iniciar el proyecto completo:

Para tener el sistema completo funcionando, simplemente ejecuta:
```bash
./run.sh all
```

O manualmente, inicia los siguientes componentes en terminales separadas:

1. **Backend API (Terminal 1)**:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/backend
   npm run start:dev
   ```
   El backend estará disponible en el puerto 3001.

2. **Dashboard Web (Terminal 2)**:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-web
   npm run dev
   ```
   El dashboard web estará disponible en http://localhost:3000/dashboard.

3. **Metro Bundler para App Mobile (Terminal 3)**:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile
   ulimit -n 65536
   node ./node_modules/@react-native-community/cli/build/bin.js start
   ```

4. **App Mobile en dispositivo/emulador (Terminal 4)**:
   Una vez que tengas un emulador o dispositivo conectado:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile
   node ./node_modules/@react-native-community/cli/build/bin.js run-android
   ```

## URLs Importantes

- Backend API: `http://localhost:3001/api`
- Dashboard Web: `http://localhost:3000/dashboard`
- API Autenticación: `http://localhost:3001/api/auth`
- API Restaurantes: `http://localhost:3001/api/restaurants`
- API Pedidos: `http://localhost:3001/api/orders`
- API Notificaciones: `http://localhost:3001/api/notifications`

## Solución de Problemas

### Error "ENOENT: no such file or directory, uv_cwd"

Este error ocurre frecuentemente con versiones recientes de Node.js (v20+, v22+) al intentar ejecutar React Native con `npx`.

#### Solución 1: Usar el script unificado (RECOMENDADO)

El script unificado que hemos creado (`run.sh`) es la forma más simple de solucionar estos problemas:

```bash
# Ejecuta desde el directorio principal
./run.sh metro
```

#### Solución 2: Usar node directamente para iniciar Metro

```bash
node ./node_modules/@react-native-community/cli/build/bin.js start
```

#### Solución 3: Reinstalar Node.js completamente

1. Desinstalar Node.js completamente:
   ```bash
   # Primero elimina N si lo estás usando
   npm uninstall -g n
   
   # Elimina versiones de Node.js instaladas con N
   rm -rf ~/.n
   
   # Elimina todos los paquetes globales
   rm -rf ~/.npm
   
   # Si estás usando Homebrew, desinstala Node.js
   brew uninstall node
   ```

2. Instalar Node.js usando el instalador oficial:
   - Visita [nodejs.org](https://nodejs.org/en/download) y descarga el instalador LTS (18.x)
   - Ejecuta el instalador y sigue las instrucciones

3. Reinstalar dependencias y ejecutar:
   ```bash
   cd dashboard-mobile
   rm -rf node_modules
   npm install
   node ./node_modules/@react-native-community/cli/build/bin.js start
   ```

#### Solución 4: Usar Yarn en lugar de NPX

Si el problema persiste con npx, puedes usar yarn como alternativa:

1. Instalar Yarn globalmente:
   ```bash
   npm install -g yarn
   ```

2. Instalar las dependencias con Yarn e iniciar:
   ```bash
   cd dashboard-mobile
   yarn
   yarn start
   ```

### Error "too many open files"

React Native puede consumir muchos archivos abiertos simultáneamente, lo que puede causar errores en macOS. Para solucionarlo:

```bash
ulimit -n 65536
```

### Problemas de compatibilidad con versiones de dependencias

Si encuentras errores de compilación relacionados con versiones de dependencias, utiliza estas versiones compatibles con React Native 0.73.6:

```bash
# Primero, desinstala las versiones incompatibles
npm uninstall react-native-screens react-native-gesture-handler react-native-safe-area-context react-native-reanimated

# Luego, instala versiones compatibles
npm install react-native-screens@3.29.0 react-native-gesture-handler@2.15.0 react-native-safe-area-context@4.9.0 react-native-reanimated@3.6.2 --save

# También, asegúrate de tener estas dependencias
npm install redux-persist @react-native-async-storage/async-storage babel-plugin-module-resolver --save

# Si encuentras errores relacionados con el formulario de login o validación:
npm install zod @hookform/resolvers react-hook-form --save

# Limpia el proyecto antes de intentar ejecutarlo nuevamente
cd android && ./gradlew clean
```

### Otros problemas comunes

- **Dirección ya en uso**: El puerto ya está siendo utilizado por otra aplicación. Detén esa aplicación o cambia el puerto.
- **Errores de compilación**: Verifica la consola para ver detalles específicos.
- **Frontend no conecta con backend**: Verifica la configuración de la URL de la API en `.env.local`.
- **Problemas de compilación en Android**: Limpia el proyecto con `cd android && ./gradlew clean`.

## Configuraciones Técnicas

### Configuración de la API en la app móvil

- La aplicación móvil está configurada para conectarse al backend en el puerto 3001.
- Las variables de entorno en el archivo `.env` están configuradas para apuntar a:
  ```
  API_URL=http://localhost:3001/api
  SOCKET_URL=http://localhost:3001
  ```

### Alias de importación en la app móvil

La aplicación utiliza alias de importación para mejorar la legibilidad del código:

1. En tsconfig.json:
```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. En babel.config.js:
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src'
        }
      }
    ]
  ]
};
```

Esto permite importar módulos usando `@/` como alias para la carpeta src:
```typescript
// En lugar de
import { Component } from '../../components/Component';

// Puedes usar
import { Component } from '@/components/Component';
```

### Gestión de versiones de Node.js para el proyecto

Para mantener consistencia entre todos los desarrolladores, es recomendable implementar alguna de estas soluciones:

1. Crear un archivo `.nvmrc` en la raíz del proyecto:
   ```bash
   # Crea el archivo con la versión recomendada
   echo "22.14.0" > .nvmrc
   
   # Al entrar al directorio, simplemente ejecuta:
   nvm use
   ```

2. Documentar la versión en package.json:
   ```json
   "engines": {
     "node": "22.14.0",
     "npm": "11.2.0"
   }
   ```

Estas configuraciones asegurarán que todos los desarrolladores usen la misma versión de Node.js, evitando problemas de compatibilidad.