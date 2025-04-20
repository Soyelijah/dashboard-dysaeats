#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Iniciando DysaEats en modo desarrollo ===${NC}"

# Verificar si PostgreSQL está en ejecución
echo -e "${YELLOW}Verificando si PostgreSQL está en ejecución...${NC}"
pg_isready -h localhost > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo -e "${RED}PostgreSQL no está en ejecución. Intentando iniciar...${NC}"
  brew services start postgresql@14 || { echo -e "${RED}Error al iniciar PostgreSQL. Por favor inícielo manualmente.${NC}"; exit 1; }
  sleep 3
  pg_isready -h localhost > /dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo -e "${RED}No se pudo iniciar PostgreSQL. Por favor revise su instalación.${NC}"
    exit 1
  fi
fi
echo -e "${GREEN}PostgreSQL está en ejecución.${NC}"

# Verificar que la base de datos existe
echo -e "${YELLOW}Verificando si la base de datos dysaeats existe...${NC}"
PGPASSWORD=${DB_PASSWORD} psql -h localhost -U ${DB_USERNAME:-devlmer-dysaeats} -lqt | grep -q "dysaeats"
if [ $? -ne 0 ]; then
  echo -e "${RED}La base de datos 'dysaeats' no existe. Creándola...${NC}"
  PGPASSWORD=${DB_PASSWORD} createdb -h localhost -U ${DB_USERNAME:-devlmer-dysaeats} dysaeats || { echo -e "${RED}Error al crear la base de datos.${NC}"; exit 1; }
fi
echo -e "${GREEN}Base de datos lista.${NC}"

# Iniciar backend (en una nueva terminal/proceso)
echo -e "${YELLOW}Iniciando backend (NestJS)...${NC}"
cd backend && npm run start:dev &
BACKEND_PID=$!

# Iniciar frontend (en una nueva terminal/proceso)
echo -e "${YELLOW}Iniciando frontend (Next.js)...${NC}"
cd dashboard-web && npm run dev &
FRONTEND_PID=$!

# Esperar a que el usuario presione Ctrl+C
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}Servicios iniciados:${NC}"
echo -e "${GREEN}- Backend: http://localhost:3001${NC}"
echo -e "${GREEN}- Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo -e "${YELLOW}Presione Ctrl+C para detener todos los servicios${NC}"

# Capturar señal de interrupción (Ctrl+C)
trap "echo -e '${YELLOW}Deteniendo servicios...${NC}'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Esperar indefinidamente
wait