#!/bin/bash
cd "/Users/devlmer/project-dysaeats/DysaEats/dashboard-web"
echo "Creando aplicación Next.js..."

# Respuestas para create-next-app (Yes a Tailwind, No a App Router, No a src/ directory)
echo 'yes
yes
no
no' | npx create-next-app@latest . --typescript --eslint --use-npm

echo "Instalando dependencias adicionales..."
npm install @tanstack/react-table @hookform/resolvers zod axios socket.io-client react-hook-form recharts next-international next-themes @radix-ui/react-slot @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-toast date-fns