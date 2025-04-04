# Explicación del Script Unificado de DysaEats

## Descripción General

Se ha creado un script unificado (`run.sh`) para simplificar la ejecución de todos los componentes del proyecto DysaEats. Este script está diseñado para funcionar con Node.js v22.14.0 y npm 11.2.0, evitando los problemas comunes que ocurren con versiones recientes de Node.js al ejecutar React Native.

## Ubicación

El script está disponible en dos ubicaciones:
- `/Users/devlmer/project-dysaeats/DysaEats/run.sh` (script global para todo el proyecto)
- `/Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile/run.sh` (script específico para la app móvil)

## Funcionalidades

### 1. Menú Interactivo

Ejecutando `./run.sh` sin argumentos, se muestra un menú interactivo con las siguientes opciones:

```
╔══════════════════════════════════════════╗
║               DysaEats                  ║
╚══════════════════════════════════════════╝

Selecciona una opción:

  1) Iniciar Metro Bundler para la app móvil
  2) Ejecutar app en Android
  3) Ejecutar app en iOS
  4) Iniciar servidor backend
  5) Iniciar dashboard web
  6) Iniciar todos los componentes (en terminales separadas)
  7) Mostrar ayuda
  0) Salir

Selección [0-7]:
```

### 2. Comandos directos disponibles

También puedes usar el script con argumentos para ejecutar directamente:

- `./run.sh metro` - Inicia Metro Bundler para la app móvil
- `./run.sh android` - Ejecuta la app en Android
- `./run.sh ios` - Ejecuta la app en iOS
- `./run.sh backend` - Inicia el servidor backend
- `./run.sh web` - Inicia el dashboard web
- `./run.sh all` - Inicia todos los componentes (en terminales separadas)
- `./run.sh help` - Muestra la ayuda

### 2. Características técnicas

- **Configuración automática de entorno**: Establece valores seguros para evitar problemas
- **Aumento de límite de archivos**: `ulimit -n 65536` para evitar errores de "too many open files"
- **Directorio temporal personalizado**: Configura TMPDIR=/tmp para evitar problemas de permisos
- **Ejecución directa**: Utiliza `node` directamente para evitar problemas con `npx`
- **Terminales separadas**: Al usar `./run.sh all`, abre cada componente en una terminal diferente

## Solución a problemas comunes

### Error "ENOENT: no such file or directory, uv_cwd"

Este error ocurre frecuentemente con versiones recientes de Node.js (v20+, v22+) al intentar ejecutar React Native con `npx`. El script soluciona este problema ejecutando el CLI de React Native directamente con `node`:

```bash
node ./node_modules/@react-native-community/cli/build/bin.js start
```

En lugar de:

```bash
npx react-native start
```

### Límite de archivos abiertos

React Native puede consumir muchos archivos abiertos simultáneamente, lo que puede causar errores en macOS. El script aumenta automáticamente este límite:

```bash
ulimit -n 65536
```

## Mantenimiento

En caso de que necesites actualizar las rutas o comandos en el futuro:

1. Edita el script `run.sh`
2. Modifica las variables al inicio del script para actualizar las rutas:
   ```bash
   BACKEND_DIR="/Users/devlmer/project-dysaeats/DysaEats/backend"
   WEB_DIR="/Users/devlmer/project-dysaeats/DysaEats/dashboard-web"
   MOBILE_DIR="/Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile"
   ```
3. Modifica las funciones correspondientes si necesitas cambiar los comandos

## Verificación de permisos

Para asegurarte de que el script tiene permisos de ejecución:

```bash
chmod +x /Users/devlmer/project-dysaeats/DysaEats/run.sh
chmod +x /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile/run.sh
```

## Instalación directa de la aplicación

Si encuentras problemas con el bundler de JavaScript o prefieres instalar la aplicación directamente en un dispositivo, puedes usar estos comandos:

### Compilar e instalar el APK en un solo paso:

```bash
cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile/android && ./gradlew assembleDebug && adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Si tienes múltiples dispositivos:

1. Listar dispositivos disponibles:
```bash
adb devices
```

2. Instalar en un dispositivo específico:
```bash
adb -s [ID_DEL_DISPOSITIVO] install -r app/build/outputs/apk/debug/app-debug.apk
```

Estos comandos son particularmente útiles cuando se presentan errores como "ENOENT: no such file or directory, uv_cwd" o "Property 'global' doesn't exist", ya que compilan directamente la aplicación sin depender del Metro Bundler.