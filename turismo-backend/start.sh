#!/bin/bash

echo "🚀 Iniciando App Container..."

# 1. Esperar a que el contenedor 'db' responda
# Usamos las variables de entorno que Docker-Compose nos pasa
echo "⏳ Esperando a la base de datos en host: $DB_HOST..."

# Loop simple para esperar conexión
max_tries=30
count=0
while ! mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; do
    echo "Esperando a MySQL ($count/$max_tries)..."
    sleep 2
    count=$((count+1))
    if [ $count -ge $max_tries ]; then
        echo "❌ Error: No se pudo conectar a la base de datos en $DB_HOST."
        exit 1
    fi
done
echo "✅ Conexión exitosa a la base de datos."

# 2. Ejecutar Migraciones (Crear tablas)
echo "📂 Ejecutando migraciones..."
php artisan migrate --force

# 3. Iniciar Web Server (Supervisor -> Nginx + PHP)
echo "🔥 Iniciando Servidor Web..."
exec /usr/bin/supervisord -c /etc/supervisord.conf