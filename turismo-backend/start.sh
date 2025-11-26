#!/bin/bash

echo "🚀 Iniciando App Container..."
echo "⏳ Esperando a la base de datos en host: $DB_HOST..."

# Loop de espera con --skip-ssl para evitar error de certificado
max_tries=30
count=0
# CAMBIO AQUÍ ABAJO: Agregamos --skip-ssl
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --skip-ssl; do
    echo "⚠️ Intento $count/$max_tries fallido. Esperando..."
    sleep 2
    count=$((count+1))
    if [ $count -ge $max_tries ]; then
        echo "❌ ERROR FATAL: No se pudo conectar tras $max_tries intentos."
        # CAMBIO AQUÍ TAMBIÉN
        mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --skip-ssl
        exit 1
    fi
done

echo "✅ ¡Conexión exitosa a la base de datos!"

echo "📂 Ejecutando migraciones..."
php artisan migrate --force

echo "🔥 Iniciando Servidor Web..."
exec /usr/bin/supervisord -c /etc/supervisord.conf