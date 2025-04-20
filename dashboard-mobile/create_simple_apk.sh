#\!/bin/bash
# Script para crear un apk funcional simple

# Configuraciones
export PATH=/Users/devlmer/.nvm/versions/node/v22.14.0/bin:$PATH
export TMPDIR=/tmp
ulimit -n 65536

# Limpiar el proyecto
cd android
./gradlew clean
cd ..

# Crear directorio para el bundle
mkdir -p android/app/src/main/assets

# Crear un bundle muy simple manualmente
echo "var __DEV__=false;
require(\"./src/SimpleApp.js\");
__r(\"ReactMobileAppNew\");" > android/app/src/main/assets/index.android.bundle

# Generar APK de depuración sin ejecutar el bundler
cd android
./gradlew assembleDebug -x bundleDebugJsAndAssets -x createDebugBundle


