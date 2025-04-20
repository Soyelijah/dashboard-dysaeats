# Etapa base
FROM node:18-alpine AS base

# Etapa de desarrollo
FROM base AS development
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
CMD ["npm", "run", "start:dev"]

# Etapa de construcción
FROM base AS build
WORKDIR /app
COPY package*.json ./
COPY --from=development /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa de producción
FROM base AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

# Para reducir el tamaño de la imagen y mejorar la seguridad
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# Configuración del usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

# Exposición de puerto y comando de inicio
EXPOSE 3000
CMD ["node", "dist/main"]