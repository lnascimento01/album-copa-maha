#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

# This image is immutable: code, vendor and built assets are baked in at
# build time. The container only prepares runtime state and starts php-fpm.
# Database migrations are run once by deploy/deploy.sh before the rollout,
# NOT here, so they are never executed concurrently while the old and new
# containers overlap during the zero-downtime swap.

# Sync the pristine public/ into the shared named volume so nginx can serve
# the static assets. Vite assets are content-hashed, so additive copies let
# the previous and the new release coexist in the volume during the swap.
echo "[entrypoint] publishing public assets to shared volume"
cp -a /usr/local/share/app-public/. /var/www/html/public/

echo "[entrypoint] storage:link"
php artisan storage:link || true

echo "[entrypoint] optimize (config/route/view/event cache)"
php artisan optimize:clear
php artisan optimize

echo "[entrypoint] starting php-fpm"
exec php-fpm -F
