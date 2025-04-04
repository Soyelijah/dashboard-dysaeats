# Usar imagen de desarrollo de Next.js
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar archivos necesarios
COPY . .

# Variables de entorno para producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Exponer puerto
EXPOSE 3000

# Ejecutar en modo producción directo sin compilar
CMD ["npm", "run", "dev"]
