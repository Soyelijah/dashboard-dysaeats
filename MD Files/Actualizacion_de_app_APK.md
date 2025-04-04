# Actualización de la Aplicación DysaEats

Este documento describe las diferentes estrategias para actualizar la aplicación DysaEats tanto durante el desarrollo como en producción.

## Opciones para actualizar la aplicación

### 1. Actualización durante el desarrollo (con cable o emulador)

Durante el desarrollo, necesitas tener el dispositivo conectado (físico o emulador) para actualizar la aplicación:

#### Para dispositivos físicos:
- **Conexión por cable USB**: Es la forma más directa y confiable
- **Conexión por WiFi** (sin cable): React Native permite desarrollo inalámbrico desde React Native 0.68+

Para activar el modo inalámbrico (sin cable USB):

```bash
# 1. Primero conecta el dispositivo por USB una vez
# 2. Activa el modo inalámbrico (desde CLI)
adb wireless

# O con un puerto específico (más antiguo)
adb tcpip 5555
adb connect <IP-DEL-DISPOSITIVO>:5555
```

Una vez configurado, puedes desconectar el cable y seguir enviando actualizaciones por WiFi.

### 2. Distribución de actualizaciones de producción

Para actualizaciones de producción (app ya instalada en dispositivos de usuarios), tienes estas opciones:

#### Opción A: Tiendas de aplicaciones (método convencional)
- **Google Play Store**: Subir la nueva versión APK/AAB al Play Store
- **App Store** (para iOS): Subir a través del App Store Connect
- Los usuarios reciben notificaciones de actualización automáticamente

#### Opción B: Actualización OTA (Over-The-Air) con CodePush/AppCenter

Esta es la opción recomendada para actualizaciones automáticas sin necesidad de tiendas:

1. **Microsoft App Center (antes CodePush)**: Permite enviar actualizaciones de JS/Assets sin publicar nuevas versiones en las tiendas de aplicaciones

Para integrarlo en tu proyecto:

```bash
# Instalar App Center CLI
npm install -g appcenter-cli

# Instalar SDK en el proyecto
npm install appcenter appcenter-analytics appcenter-crashes react-native-code-push --save

# Iniciar sesión (primera vez)
appcenter login

# Crear una app en AppCenter
appcenter apps create -p React-Native -o Android -p Android -d DysaEatsAndroid

# Desplegar una actualización
appcenter codepush release-react -a tu-usuario/DysaEatsAndroid -d Production
```

Ventajas de esta opción:
- Las actualizaciones JS se aplican automáticamente sin intervención del usuario 
- No requiere nueva instalación de APK
- No necesita aprobación de la tienda
- Puedes controlar el porcentaje de despliegue y revertir si hay problemas

**Limitaciones**: Solo puedes actualizar código JavaScript y recursos, no el código nativo/Java.

#### Opción C: Servidor de actualización personalizado

También puedes implementar tu propio sistema de actualizaciones:

1. Crear un endpoint en tu backend `/api/app-updates` que devuelva:
   - Versión más reciente
   - URL de descarga
   - Notas del cambio

2. Hacer que tu app verifique periódicamente este endpoint

3. Cuando hay una nueva versión, muestra una notificación al usuario para descargar e instalar el APK

Para este enfoque, necesitarías:
- Almacenar los APK firmados en tu servidor
- Configurar tu app para verificar actualizaciones
- Solicitar permisos para instalar APK desde fuentes desconocidas

## Paso a paso: Configuración de CodePush/AppCenter

Si decides implementar la opción de actualización OTA (recomendada), sigue estos pasos:

### 1. Configuración de cuenta y proyecto en AppCenter

1. Crea una cuenta en [App Center](https://appcenter.ms/)
2. Instala la CLI de App Center:
   ```bash
   npm install -g appcenter-cli
   ```
3. Inicia sesión:
   ```bash
   appcenter login
   ```
4. Crea dos aplicaciones (una para Android y otra para iOS si es necesario):
   ```bash
   appcenter apps create -p Android -o Android -d "DysaEats Android"
   appcenter apps create -p iOS -o iOS -d "DysaEats iOS"
   ```
5. Obtén las claves de despliegue:
   ```bash
   appcenter codepush deployment list -a <usuario>/DysaEats-Android --displayKeys
   ```

### 2. Integración en el proyecto React Native

1. Instala el SDK:
   ```bash
   npm install react-native-code-push --save
   ```

2. Vincula la biblioteca (React Native 0.60+):
   ```bash
   cd ios && pod install && cd ..
   ```

3. Modifica el archivo `App.js` o `index.js`:
   ```javascript
   import codePush from "react-native-code-push";

   const codePushOptions = {
     checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
     installMode: codePush.InstallMode.ON_NEXT_RESUME
   };

   // Envuelve tu componente App con CodePush
   export default codePush(codePushOptions)(App);
   ```

4. Configura las claves de despliegue:
   - Para Android: Edita `android/app/build.gradle`
   - Para iOS: Edita `ios/<TuApp>/Info.plist`

### 3. Despliegue de actualizaciones

Para lanzar una actualización:

```bash
appcenter codepush release-react -a <usuario>/DysaEats-Android -d Production -m
```

Para desplegar a un porcentaje de usuarios:

```bash
appcenter codepush release-react -a <usuario>/DysaEats-Android -d Production -m -r 20%
```

Para revertir a una versión anterior:

```bash
appcenter codepush rollback -a <usuario>/DysaEats-Android Production
```

## Recursos adicionales

- [Documentación oficial de App Center](https://docs.microsoft.com/en-us/appcenter/distribution/codepush/)
- [React Native y CodePush](https://github.com/microsoft/react-native-code-push)
- [ADB Wireless](https://developer.android.com/studio/command-line/adb#wireless)