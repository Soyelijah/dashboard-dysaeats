# Guía Detallada: Configuración de ADB Wireless para desarrollo sin cable

## Requisitos previos

- Un dispositivo Android (teléfono o tablet)
- Computadora de desarrollo con ADB instalado
- Ambos dispositivos conectados a la misma red WiFi
- Android 11+ para el método más sencillo, aunque funciona en versiones anteriores con pasos adicionales

## Paso 1: Preparación inicial

1. **Verifica que ADB está instalado en tu computadora**:
   ```bash
   adb version
   ```
   Deberías ver algo como: "Android Debug Bridge version 1.0.41"

2. **Habilita las opciones de desarrollador en tu dispositivo Android**:
   - Ve a Configuración > Acerca del teléfono
   - Toca 7 veces "Número de compilación"
   - Verás un mensaje: "Ya eres un desarrollador"

3. **Habilita la depuración USB**:
   - Ve a Configuración > Opciones de desarrollador
   - Activa "Depuración USB"

## Paso 2: Conexión inicial por USB

1. **Conecta tu dispositivo por cable USB a tu computadora**

2. **Acepta el mensaje de autorización en tu dispositivo** cuando aparezca:
   - Se mostrará "¿Permitir depuración USB?" con una huella digital RSA
   - Marca "Permitir siempre desde esta computadora" (opcional pero recomendado)
   - Toca "Permitir"

3. **Verifica que el dispositivo está conectado**:
   ```bash
   adb devices
   ```
   Deberías ver tu dispositivo listado como "device", por ejemplo:
   ```
   List of devices attached
   UGKNRODMRGQCIZUO    device
   ```

## Paso 3: Activar ADB Wireless (método varía según versión de Android)

### Para Android 11 o superior (método simple):

1. **Activa ADB Wireless directamente**:
   ```bash
   adb wireless
   ```

2. **Desconecta el cable USB** cuando veas el mensaje "successfully paired"

3. **Verifica la conexión inalámbrica**:
   ```bash
   adb devices
   ```
   Deberías ver tu dispositivo listado, pero ahora con una dirección IP, por ejemplo:
   ```
   List of devices attached
   192.168.1.5:37275    device
   ```

### Para versiones anteriores a Android 11:

1. **Asegúrate que el dispositivo está conectado por USB y verificado con ADB**

2. **Coloca ADB en modo TCP/IP**:
   ```bash
   adb tcpip 5555
   ```
   Deberías ver: "restarting in TCP mode port: 5555"

3. **Obtén la dirección IP de tu dispositivo**:
   ```bash
   adb shell ip addr show wlan0
   ```
   Busca en la salida algo como "inet 192.168.1.5/24" (tu dirección IP)

4. **Conéctate al dispositivo de forma inalámbrica**:
   ```bash
   adb connect 192.168.1.5:5555
   ```
   Deberías ver: "connected to 192.168.1.5:5555"

5. **Desconecta el cable USB**

6. **Verifica la conexión inalámbrica**:
   ```bash
   adb devices
   ```
   Deberías ver algo como:
   ```
   List of devices attached
   192.168.1.5:5555    device
   ```

## Paso 4: Desarrollo con ADB Wireless

Una vez conectado inalámbricamente, puedes:

1. **Instalar o actualizar la aplicación DysaEats**:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile/android && ./gradlew assembleDebug && adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Ejecutar la aplicación directamente**:
   ```bash
   cd /Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile && ./run.sh android
   ```

3. **Ver logs de la aplicación**:
   ```bash
   adb logcat | grep ReactNative
   ```

4. **Emitir cualquier otro comando ADB como si estuviera conectado por cable**

## Solución de problemas comunes

### Si pierdes la conexión:

1. **Vuelve a verificar los dispositivos**:
   ```bash
   adb devices
   ```

2. **Si el dispositivo no aparece, intenta reconectar**:
   ```bash
   adb connect 192.168.1.5:5555
   ```

3. **Si sigue sin funcionar, reinicia el servidor ADB**:
   ```bash
   adb kill-server
   adb start-server
   ```

4. **En último caso, vuelve a conectar por USB** y repite los pasos desde el principio

### Si cambia la red WiFi:

Si tu dispositivo o computadora cambian de red WiFi, necesitarás repetir el proceso de conexión, ya que la dirección IP probablemente haya cambiado.

## Consejos adicionales

1. **Para desactivar ADB Wireless**:
   ```bash
   adb usb
   ```
   Esto volverá a la conexión por USB

2. **Para mayor seguridad**, desactiva ADB Wireless cuando no lo estés usando:
   - En Android 11+, puedes desactivarlo desde Opciones de desarrollador
   - En versiones anteriores, usa `adb usb` o simplemente desactiva la depuración USB

3. **Automatiza el proceso** creando un script:

   ```bash
   #!/bin/bash
   # Guarda como 'wireless_adb.sh' y haz chmod +x wireless_adb.sh
   
   echo "Iniciando configuración ADB Wireless..."
   
   # Verificar Android 11+
   ANDROID_VERSION=$(adb shell getprop ro.build.version.release | cut -d. -f1)
   
   if [ "$ANDROID_VERSION" -ge 11 ]; then
     echo "Dispositivo con Android 11+, usando método simplificado..."
     adb wireless
   else
     echo "Dispositivo con Android anterior a 11, usando método TCP/IP..."
     adb tcpip 5555
     
     # Obtener dirección IP 
     IP=$(adb shell ip addr show wlan0 | grep "inet " | cut -d' ' -f6 | cut -d/ -f1)
     
     if [ -z "$IP" ]; then
       echo "No se pudo obtener la dirección IP. Asegúrate que WiFi esté activado."
       exit 1
     fi
     
     echo "Conectando a $IP:5555..."
     adb connect $IP:5555
   fi
   
   echo "Puedes desconectar el cable USB."
   echo "Para verificar la conexión, ejecuta: adb devices"
   ```

4. **Consejos para usar ADB Wireless con DysaEats**:

   - Si estás desarrollando con el modo de recarga en caliente (hot reload), la conexión inalámbrica funciona exactamente igual que la cableada
   - Para instalaciones más rápidas, mantén los archivos APK compilados en una ubicación de fácil acceso
   - Usa el comando `adb -s [DEVICE_IP:PORT] install -r path/to/app.apk` si tienes múltiples dispositivos conectados
   - Para desarrollo más eficiente, considera usar [React Native Hermes](https://reactnative.dev/docs/hermes) que mejora el rendimiento de la aplicación

5. **Ventajas de usar ADB Wireless con DysaEats**:

   - Mayor movilidad para probar la aplicación en diferentes contextos
   - Facilita las pruebas de geolocalización al poder moverte con el dispositivo
   - Previene el desgaste del puerto USB del dispositivo
   - Permite probar la aplicación en múltiples dispositivos sin cambiar constantemente el cable

## Referencias

- [Documentación oficial de ADB](https://developer.android.com/studio/command-line/adb)
- [Wireless Debugging en Android Studio](https://developer.android.com/studio/debug/dev-options#wireless)
- [Guía completa de ADB Commands](https://developer.android.com/studio/command-line/adb#commandsummary)