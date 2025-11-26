#!/bin/bash

echo "🚀 Iniciando App Container..."
echo "⏳ Esperando a la base de datos en host: $DB_HOST..."

# Modificado: Quitamos --silent y mostramos el error explícitamente
# Intentamos conectar hasta 30 veces
for i in {1..30}; do
    if mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD"; then
        echo "✅ Conexión exitosa a la base de datos."
        break
    fi
    echo "⚠️ Falló intento $i/30. Esperando..."
    sleep 2
done

# Si llegamos aquí y no conectó, fallamos.
if ! mysqladmin ping -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent; then
    echo "❌ Error Fatal: No se pudo conectar a la BD. Revisa usuario/password/host."
    exit 1
fi

# 2. Ejecutar Migraciones
echo "📂 Ejecutando migraciones..."
php artisan migrate --force

# 3. Iniciar Web Server
echo "🔥 Iniciando Servidor Web..."
exec /usr/bin/supervisord -c /etc/supervisord.conf