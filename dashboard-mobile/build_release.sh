#!/bin/bash
# Script para generar APK de lanzamiento
# Autor: Claude
# Fecha: 04/03/2025

# Definir colores para mejor legibilidad
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuraciones
MOBILE_DIR="/Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile"
RELEASE_DIR="$MOBILE_DIR/android/app/build/outputs/apk/release"

# Asegurarse de usar Node.js v22.14.0
if command -v /Users/devlmer/.nvm/versions/node/v22.14.0/bin/node &> /dev/null; then
  export PATH=/Users/devlmer/.nvm/versions/node/v22.14.0/bin:$PATH
  echo -e "${GREEN}Usando Node.js v22.14.0${NC}"
  node -v
else
  echo -e "${RED}No se encontró Node.js v22.14.0. Por favor, instálalo usando nvm.${NC}"
  exit 1
fi

# Aumentar el límite de archivos abiertos
ulimit -n 65536
echo -e "${GREEN}Límite de archivos abiertos aumentado a $(ulimit -n)${NC}"

# Configurar directorio temporal
export TMPDIR=/tmp
mkdir -p $TMPDIR
chmod 777 $TMPDIR 2>/dev/null || true
echo -e "${GREEN}Directorio temporal configurado en $TMPDIR${NC}"

# Función para limpiar el proyecto
clean_project() {
  echo -e "${YELLOW}Limpiando el proyecto...${NC}"
  cd "$MOBILE_DIR/android"
  ./gradlew clean
  cd "$MOBILE_DIR"
  rm -rf android/app/src/main/assets/index.android.bundle
  rm -rf android/app/src/main/res/drawable-*
  rm -rf android/app/build/outputs
  echo -e "${GREEN}Proyecto limpiado exitosamente${NC}"
}

# Función para crear el bundle de JavaScript
create_bundle() {
  echo -e "${YELLOW}Creando bundle de JavaScript...${NC}"
  cd "$MOBILE_DIR"
  mkdir -p android/app/src/main/assets
  
  # Eliminar recursos no necesarios para evitar duplicación
  rm -rf android/app/src/main/res/drawable-*
  rm -rf android/app/src/main/res/raw
  
  node ./node_modules/@react-native-community/cli/build/bin.js bundle \
    --platform android \
    --dev false \
    --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error al crear el bundle de JavaScript${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Bundle de JavaScript creado exitosamente${NC}"
}

# Función para generar el APK
generate_apk() {
  echo -e "${YELLOW}Generando APK...${NC}"
  cd "$MOBILE_DIR/android"
  ./gradlew assembleRelease
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error al generar el APK${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}APK generado exitosamente${NC}"
}

# Función para copiar el APK a una ubicación más accesible
copy_apk() {
  echo -e "${YELLOW}Copiando APK a la carpeta raíz...${NC}"
  cd "$MOBILE_DIR"
  mkdir -p releases
  
  if [ -f "$RELEASE_DIR/app-release.apk" ]; then
    cp "$RELEASE_DIR/app-release.apk" "$MOBILE_DIR/releases/dysaeats-$(date +%Y%m%d).apk"
    echo -e "${GREEN}APK copiado a ${YELLOW}$MOBILE_DIR/releases/dysaeats-$(date +%Y%m%d).apk${NC}"
  else
    echo -e "${RED}No se encontró el APK. Verifica si la compilación fue exitosa.${NC}"
    exit 1
  fi
}

# Ejecutar todas las funciones
echo -e "${BLUE}=== Iniciando proceso de creación de APK para DysaEats ===${NC}"
clean_project
create_bundle
generate_apk
copy_apk
echo -e "${BLUE}=== Proceso completado ===${NC}"

# Mostrar instrucciones para instalar el APK
echo -e "${YELLOW}Para instalar el APK en tu dispositivo:${NC}"
echo -e "1. Conecta tu dispositivo Android a tu computadora vía USB"
echo -e "2. Asegúrate de tener la depuración USB habilitada en tu dispositivo"
echo -e "3. Ejecuta el siguiente comando:"
echo -e "   ${GREEN}adb install -r $MOBILE_DIR/releases/dysaeats-$(date +%Y%m%d).apk${NC}"
echo -e "   O transfiere el archivo a tu dispositivo e instálalo directamente"

exit 0