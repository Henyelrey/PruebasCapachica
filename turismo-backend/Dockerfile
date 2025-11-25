FROM php:8.2-fpm

# 1. Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
      default-mysql-client \
      libzip-dev \
      libpng-dev \
      libjpeg-dev \
      libfreetype6-dev \
      libonig-dev \
      libxml2-dev \
      nginx \
      supervisor \
      git \
      unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql zip gd mbstring xml \
    && mkdir -p /run/php /var/log/supervisor /var/lib/nginx/body /run/nginx \
    && chown -R www-data:www-data /run/php /var/lib/nginx /run/nginx

COPY --from=composer:2.6 /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

# --- ⚡ INICIO OPTIMIZACIÓN ⚡ ---
# 2. Copiamos SOLO los ficheros de definición primero
COPY composer.json composer.lock ./

# 3. Instalamos dependencias (Esto se cacheará si no tocas el composer.json)
# Usamos --no-scripts y --no-autoloader porque aún no tenemos el código de la app
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# 4. AHORA copiamos el resto del código
COPY . .
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./supervisord.conf /etc/supervisord.conf
COPY ./start.sh /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh

# 5. Finalizamos la instalación (Generar autoloader optimizado)
RUN cp .env.example .env || true \
    && composer dump-autoload --optimize --no-dev \
    && php artisan key:generate \
    && php artisan storage:link \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html
# --- FIN OPTIMIZACIÓN ---

EXPOSE 80
USER root

CMD ["/usr/local/bin/start.sh"]