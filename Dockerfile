# ---------- Etapa 1: Build Angular ----------
FROM node:20-alpine AS build

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Construir la aplicación Angular en modo producción
RUN npm run build -- --configuration production


# ---------- Etapa 2: Servidor Nginx ----------
FROM nginx:alpine

# Eliminar configuración por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar build Angular al servidor nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer puerto
EXPOSE 80

# Ejecutar nginx
CMD ["nginx", "-g", "daemon off;"]