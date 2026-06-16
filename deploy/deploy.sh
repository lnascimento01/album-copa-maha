#!/usr/bin/env bash
# Zero-downtime staging deploy.
#
# Strategy:
#   1. Pull latest code (git pull) while old container keeps serving.
#   2. Pre-build assets inside a throw-away container (no ports, no
#      traffic) using the same image that is already running.
#   3. Restart the app container with SKIP_ASSET_BUILD=1 — it only
#      runs migrate + optimize + php-fpm, so downtime is ~10-20 s.
#
# Usage (from the server, inside the repo root):
#   cd /path/to/album-copa-maha
#   bash deploy/deploy.sh

set -euo pipefail

COMPOSE="docker compose -f deploy/docker-compose.staging.yml"

echo "[deploy] pulling latest code…"
git pull --ff-only

echo "[deploy] pre-building assets (old container keeps serving)…"
# Run composer + npm inside a one-off container that shares the
# working-directory volume but has no ports open and no healthcheck.
$COMPOSE run --rm --no-deps \
    -e SKIP_ASSET_BUILD=0 \
    --entrypoint bash \
    app -c "
        set -euo pipefail
        cd /var/www/html
        echo '  -> composer install'
        composer install --no-dev --optimize-autoloader --no-interaction
        echo '  -> npm ci'
        npm ci
        echo '  -> npm run build'
        npm run build
        echo '  -> pre-build done'
    "

echo "[deploy] restarting app with pre-built assets…"
SKIP_ASSET_BUILD=1 $COMPOSE up -d --force-recreate app

echo "[deploy] waiting for app to become healthy…"
timeout 200 bash -c "
    until docker inspect \
        \$(docker compose -f deploy/docker-compose.staging.yml ps -q app) \
        --format '{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; do
        sleep 5
    done
"

echo "[deploy] reloading nginx…"
$COMPOSE exec nginx nginx -s reload 2>/dev/null || true

echo "[deploy] done — site is up."
