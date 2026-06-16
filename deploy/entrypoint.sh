#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

if [[ "${SKIP_ASSET_BUILD:-0}" != "1" ]]; then
    echo "[deploy] composer install"
    composer install --no-dev --optimize-autoloader --no-interaction

    echo "[deploy] npm ci"
    npm ci

    echo "[deploy] npm build"
    npm run build
else
    echo "[deploy] assets pre-built — skipping composer/npm"
fi

echo "[deploy] storage:link"
php artisan storage:link || true

echo "[deploy] migrate"
php artisan migrate --force

echo "[deploy] optimize"
php artisan optimize:clear
php artisan optimize

echo "[deploy] starting php-fpm"
exec php-fpm -F
