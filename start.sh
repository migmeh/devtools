#!/bin/bash

# Navegar al directorio de trabajo
cd /var/www/html

# Instalar dependencias de PHP solo si existe el archivo
if [ -f "composer.json" ]; then
    composer install --no-interaction
else
    echo "Aviso: No se encontró composer.json, saltando..."
fi

# Instalar dependencias de Node si falta la carpeta node_modules
# O si falta el ejecutable de Vite en node_modules/.bin (caso de volumen anónimo vacío)
if [ ! -d "node_modules" ] || [ ! -x "node_modules/.bin/vite" ]; then
    echo "Instalando dependencias de Node (Vite)..."
    npm install
fi

# Habilitar mod_rewrite de Apache (por si acaso)
a2enmod rewrite

# Iniciar Apache en segundo plano
apache2-foreground &

# Iniciar el servidor de desarrollo de Vite
echo "Lanzando Vite..."
# Use exec so the npm/vite process replaces the shell (PID 1)
# This improves signal handling and prevents the container exiting unexpectedly.
exec npm run dev -- --host