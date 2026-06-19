#!/usr/bin/env bash
set -euo pipefail

cd /var/www/html

# This image is immutable: code, vendor and built assets are baked in at
# build time. Database migrations are run once by deploy/deploy.sh before the
# rollout (NOT here), so they never run concurrently while the old and new
# containers overlap during the zero-downtime swap.
#
# Runtime prep (asset publish, optimize, chown) is only needed when this
# container is about to serve requests — i.e. when the command is php-fpm
# (the image's default CMD). One-off invocations such as
#   docker compose run --rm app php artisan migrate --force
# pass their OWN argv; we must exec that argv instead of swallowing it and
# booting php-fpm, which would hang the deploy and silently skip the
# migration. So: run prep only for php-fpm, then exec whatever was requested.
if [ "${1:-}" = "php-fpm" ]; then
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

    # The code is baked as the build user (maha), but php-fpm serves requests
    # as www-data — which must be able to write compiled views, framework
    # caches and sessions at runtime. storage/logs is a named volume that
    # grows unbounded, so a recursive chown over it gets slower every boot; the
    # volume inherits www-data from the image, so a non-recursive chown of the
    # mount point is enough. storage/app (uploads) is left untouched.
    echo "[entrypoint] fixing writable permissions for www-data"
    chown -R www-data:www-data storage/framework bootstrap/cache
    chown www-data:www-data storage/logs
fi

echo "[entrypoint] exec: $*"
exec "$@"
