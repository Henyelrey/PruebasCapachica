# Etapa 1: Construir Angular
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# CAMBIA 'nombre-de-tu-app' por lo que diga tu angular.json en "outputPath"
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine
# Copiar el build al servidor
COPY --from=build /app/dist/turismo-frontend /usr/share/nginx/html
# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]