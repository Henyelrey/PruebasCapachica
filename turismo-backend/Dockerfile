FROM php:8.2-fpm

# 1. Instalar dependencias (Solo Backend + Cliente DB)
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

# 2. Copiar archivos
COPY . .
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./supervisord.conf /etc/supervisord.conf
COPY ./start.sh /usr/local/bin/start.sh

RUN chmod +x /usr/local/bin/start.sh

# 3. Instalar dependencias PHP (Sin dependencias de Node)
RUN cp .env.example .env || true \
    && composer install --optimize-autoloader --no-dev \
    && php artisan key:generate \
    && php artisan storage:link \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
USER root

# Usamos el script para esperar a la DB
CMD ["/usr/local/bin/start.sh"]