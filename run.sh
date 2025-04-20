#!/bin/bash
# Script maestro para ejecutar componentes de DysaEats
# Autor: Claude
# Fecha: 04/03/2025

# Definir colores para mejor legibilidad
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuraciones
BACKEND_DIR="/Users/devlmer/project-dysaeats/DysaEats/backend"
WEB_DIR="/Users/devlmer/project-dysaeats/DysaEats/dashboard-web"
MOBILE_DIR="/Users/devlmer/project-dysaeats/DysaEats/dashboard-mobile"

# Aumentar el límite de archivos abiertos
ulimit -n 65536

# Configurar directorio temporal
export TMPDIR=/tmp
mkdir -p $TMPDIR
chmod 777 $TMPDIR 2>/dev/null || true

# Función para mostrar ayuda
show_help() {
  echo -e "${BLUE}=== Script de ejecución de DysaEats ===${NC}"
  echo ""
  echo "Uso: ./run.sh [opción]"
  echo ""
  echo "Opciones:"
  echo -e "  ${GREEN}metro${NC}      Inicia Metro Bundler para la app móvil"
  echo -e "  ${GREEN}android${NC}    Ejecuta la app en Android"
  echo -e "  ${GREEN}ios${NC}        Ejecuta la app en iOS"
  echo -e "  ${GREEN}backend${NC}    Inicia el servidor backend"
  echo -e "  ${GREEN}web${NC}        Inicia el dashboard web"
  echo -e "  ${GREEN}all${NC}        Inicia todos los componentes (en terminales separadas)"
  echo -e "  ${GREEN}help${NC}       Muestra esta ayuda"
  echo ""
  echo -e "${YELLOW}Ejemplo:${NC} ./run.sh metro"
}

# Función para mostrar menú interactivo
show_menu() {
  echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║               ${YELLOW}DysaEats${BLUE}                  ║${NC}"
  echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}Selecciona una opción:${NC}"
  echo ""
  echo -e "  ${GREEN}1)${NC} Iniciar Metro Bundler para la app móvil"
  echo -e "  ${GREEN}2)${NC} Ejecutar app en Android"
  echo -e "  ${GREEN}3)${NC} Ejecutar app en iOS"
  echo -e "  ${GREEN}4)${NC} Iniciar servidor backend"
  echo -e "  ${GREEN}5)${NC} Iniciar dashboard web"
  echo -e "  ${GREEN}6)${NC} Iniciar todos los componentes (en terminales separadas)"
  echo -e "  ${GREEN}7)${NC} Mostrar ayuda"
  echo -e "  ${GREEN}0)${NC} Salir"
  echo ""
  echo -ne "${YELLOW}Selección [0-7]:${NC} "
  read -r choice
  
  case $choice in
    1) start_metro ;;
    2) run_android ;;
    3) run_ios ;;
    4) start_backend ;;
    5) start_web ;;
    6) start_all ;;
    7) show_help ;;
    0) echo -e "${YELLOW}¡Hasta pronto!${NC}"; exit 0 ;;
    *) echo -e "${RED}Opción inválida${NC}"; show_menu ;;
  esac
}

# Función para iniciar Metro Bundler
start_metro() {
  echo -e "${GREEN}Iniciando Metro Bundler...${NC}"
  cd "$MOBILE_DIR"
  node ./node_modules/@react-native-community/cli/build/bin.js start
}

# Función para ejecutar Android
run_android() {
  echo -e "${GREEN}Ejecutando app en Android...${NC}"
  cd "$MOBILE_DIR"
  node ./node_modules/@react-native-community/cli/build/bin.js run-android
}

# Función para ejecutar iOS
run_ios() {
  echo -e "${GREEN}Ejecutando app en iOS...${NC}"
  cd "$MOBILE_DIR"
  node ./node_modules/@react-native-community/cli/build/bin.js run-ios
}

# Función para iniciar backend
start_backend() {
  echo -e "${GREEN}Iniciando backend...${NC}"
  cd "$BACKEND_DIR"
  npm run start:dev
}

# Función para iniciar dashboard web
start_web() {
  echo -e "${GREEN}Iniciando dashboard web...${NC}"
  cd "$WEB_DIR"
  npm run dev
}

# Función para iniciar todos los componentes
start_all() {
  echo -e "${YELLOW}Iniciando todos los componentes en terminales separadas...${NC}"
  
  # Iniciar backend en una nueva terminal
  osascript -e "tell application \"Terminal\" to do script \"cd '$BACKEND_DIR' && npm run start:dev\""
  sleep 2
  
  # Iniciar dashboard web en una nueva terminal
  osascript -e "tell application \"Terminal\" to do script \"cd '$WEB_DIR' && npm run dev\""
  sleep 2
  
  # Iniciar Metro Bundler en una nueva terminal
  osascript -e "tell application \"Terminal\" to do script \"cd '$MOBILE_DIR' && ulimit -n 65536 && node ./node_modules/@react-native-community/cli/build/bin.js start\""
  
  echo -e "${GREEN}Todos los componentes iniciados.${NC}"
  echo -e "${BLUE}Para ejecutar la app en un dispositivo, usa:${NC}"
  echo -e "  ${YELLOW}./run.sh android${NC} (para Android)"
  echo -e "  ${YELLOW}./run.sh ios${NC} (para iOS)"
}

# Procesar argumentos o mostrar menú interactivo
if [ -z "$1" ]; then
  # Si no hay argumentos, mostrar menú interactivo
  show_menu
else
  # Si hay argumentos, procesarlos
  case "$1" in
    metro)
      start_metro
      ;;
    android)
      run_android
      ;;
    ios)
      run_ios
      ;;
    backend)
      start_backend
      ;;
    web)
      start_web
      ;;
    all)
      start_all
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      echo -e "${RED}Opción desconocida: $1${NC}"
      show_help
      exit 1
      ;;
  esac
fi

exit 0