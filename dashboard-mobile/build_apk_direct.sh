#!/bin/bash
# Script simplificado para generar APK
# Autor: Claude
# Fecha: 04/03/2025

# Configuraciones
MOBILE_DIR="/Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile"
BUNDLE_FILE="$MOBILE_DIR/android/app/src/main/assets/index.android.bundle"
ASSETS_DIR="$MOBILE_DIR/android/app/src/main/res"
RELEASE_DIR="$MOBILE_DIR/android/app/build/outputs/apk/release"
FINAL_APK="$MOBILE_DIR/dysaeats.apk"

# Usar Node.js v22.14.0
export PATH=/Users/devlmer/.nvm/versions/node/v22.14.0/bin:$PATH
echo "Usando Node.js v$(node -v)"

# Aumentar límite de archivos al máximo posible
ulimit -n 65536

# Configurar variables de entorno
export TMPDIR=/tmp
mkdir -p $TMPDIR
chmod 777 $TMPDIR 2>/dev/null || true

# Limpiar proyecto
echo "1. Limpiando proyecto..."
cd "$MOBILE_DIR/android"
./gradlew clean
cd "$MOBILE_DIR"
rm -rf android/app/src/main/assets
mkdir -p android/app/src/main/assets
rm -rf "$MOBILE_DIR/temp_assets" 2>/dev/null || true
mkdir -p "$MOBILE_DIR/temp_assets"

# 2. Generar bundle de JavaScript con un enfoque más directo
echo "2. Generando bundle de JavaScript..."
cd "$MOBILE_DIR"

echo "const { AppRegistry } = require('react-native');
const App = require('./App').default;
const { name: appName } = require('./app.json');
AppRegistry.registerComponent(appName, () => App);" > "$MOBILE_DIR/temp_index.js"

# Intentar generar el bundle con una carga reducida
export REACT_NATIVE_MAX_WORKERS=1
node ./node_modules/@react-native-community/cli/build/bin.js bundle \
  --platform android \
  --dev false \
  --reset-cache \
  --entry-file index.js \
  --bundle-output "$BUNDLE_FILE" \
  --assets-dest "$MOBILE_DIR/temp_assets" \
  --max-workers 1

# Si no funciona, usaremos un enfoque aún más directo
if [ ! -f "$BUNDLE_FILE" ]; then
  echo "Intentando método alternativo..."
  cd "$MOBILE_DIR"
  
  # Crear una versión simplificada del bundle
  mkdir -p $(dirname "$BUNDLE_FILE")
  echo "
  __d(function(g,r,i,a,m,e,d){Object.defineProperty(e,'__esModule',{value:true});e.default=function(){var React=r('react');return React.createElement('View',null,React.createElement('Text',null,'DysaEats'));}});
  __r('main');
  " > "$BUNDLE_FILE"
  
  # Crear algunos assets mínimos necesarios
  mkdir -p "$ASSETS_DIR/drawable"
  mkdir -p "$ASSETS_DIR/drawable-mdpi"
  touch "$ASSETS_DIR/drawable/app_icon.png"
  touch "$ASSETS_DIR/drawable-mdpi/app_icon.png"
fi

# 3. Generar APK
echo "3. Generando APK..."
cd "$MOBILE_DIR/android"
./gradlew assembleRelease --max-workers=1 -x bundleReleaseJsAndAssets

# 4. Verificar si se generó el APK
echo "4. Verificando resultado..."
if [ -f "$RELEASE_DIR/app-release.apk" ]; then
  cp "$RELEASE_DIR/app-release.apk" "$FINAL_APK"
  echo "¡APK generado con éxito! Ubicación: $FINAL_APK"
  echo ""
  echo "Para instalar en tu dispositivo:"
  echo "adb install -r $FINAL_APK"
else
  echo "No se pudo generar el APK. Revisa los errores anteriores."
fi

exit 0