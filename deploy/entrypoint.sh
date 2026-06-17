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
# Idempotent: skip (without a scary ERROR) if the symlink already exists.
if [ ! -e public/storage ]; then
    php artisan storage:link
fi

echo "[entrypoint] optimize (config/route/view/event cache)"
php artisan optimize:clear
php artisan optimize

# The code is baked as the build user (maha), but php-fpm serves requests as
# www-data — which must be able to write compiled views, framework caches and
# sessions at runtime (e.g. tempnam() when compiling inline Blade components).
# Hand those paths to www-data AFTER the root-run artisan steps above so every
# generated file ends up owned by the worker. storage/app (uploads) is left
# untouched to keep startup fast.
echo "[entrypoint] fixing writable permissions for www-data"
chown -R www-data:www-data storage/framework storage/logs bootstrap/cache

echo "[entrypoint] starting php-fpm"
exec php-fpm -F
