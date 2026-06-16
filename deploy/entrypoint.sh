#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

echo "[deploy] composer install"
composer install --no-dev --optimize-autoloader --no-interaction

echo "[deploy] pnpm install"
pnpm install --frozen-lockfile

echo "[deploy] pnpm build"
pnpm run build

echo "[deploy] storage:link"
php artisan storage:link || true

echo "[deploy] migrate"
php artisan migrate --force

echo "[deploy] optimize"
php artisan optimize:clear
php artisan optimize

echo "[deploy] starting php-fpm"
exec php-fpm -F
