# Etapa 1: Construir Angular
FROM node:20-alpine as build
WORKDIR /app

# 1. Copiamos archivos de dependencias
COPY package*.json ./

# 2. Instalación ROBUSTA para redes lentas
# Aumentamos el timeout a 10 minutos y configuramos reintentos automáticos
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 10 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set network-timeout 600000 \
    && npm install

# 3. Copiamos el resto del código
COPY . .

# 4. Construimos la app (Asegúrate que 'turismo-frontend' coincide con tu angular.json)
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiamos el build a Nginx (ajusta el nombre de la carpeta si es necesario)
COPY --from=build /app/dist/turismo-frontend /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]