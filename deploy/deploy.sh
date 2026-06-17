#!/usr/bin/env bash
# Zero-downtime staging deploy.
#
# How it stays up the whole time:
#   1. Pull the latest code (the running container is unaffected — its code is
#      baked into the current image, not read from the working tree).
#   2. Build a brand-new immutable image (code + composer vendor + Vite assets
#      baked in) while the old container keeps serving.
#   3. Run database migrations once, in a throw-away container of the NEW
#      image, before any traffic is swapped. Migrations must be
#      backward-compatible (expand/contract) because the old container is
#      still serving during the brief overlap.
#   4. `docker rollout` starts a new app container next to the old one, waits
#      until it is healthy, then removes the old one. nginx re-resolves the
#      app hostname per request, so traffic shifts to the new container with
#      no restart and no dropped connections.
#
# Requirements on the host:
#   - Docker + Compose v2
#   - docker-rollout plugin (https://github.com/wowu/docker-rollout)
#
# Usage (from the server, inside the repo root):
#   cd /path/to/album-copa-maha
#   bash deploy/deploy.sh

set -euo pipefail

# ── Self-update guard ────────────────────────────────────────────────
# This script updates itself through `git pull`. If the pull rewrote the
# file mid-run, bash would keep reading the old file by byte offset and
# execute a corrupted mix of old and new logic. So pull FIRST, then re-exec
# the fresh copy. DEPLOY_REEXEC marks the second pass so it does not pull
# (or re-exec) again.
if [[ -z "${DEPLOY_REEXEC:-}" ]]; then
    echo "[deploy] pulling latest code…"
    git pull --ff-only
    exec env DEPLOY_REEXEC=1 bash "$0" "$@"
fi

COMPOSE_FILE="deploy/docker-compose.staging.yml"
COMPOSE="docker compose -f ${COMPOSE_FILE}"

if ! docker rollout --help >/dev/null 2>&1; then
    echo "[deploy] ERROR: the 'docker rollout' plugin is not installed." >&2
    echo "         Install it from https://github.com/wowu/docker-rollout" >&2
    exit 1
fi

echo "[deploy] building new immutable image (old container keeps serving)…"
$COMPOSE build app

echo "[deploy] running migrations on the new image (expand/contract)…"
# One-off container of the freshly built image; --no-deps avoids touching the
# running services. The DB stays shared, so migrations apply before the swap.
$COMPOSE run --rm --no-deps app php artisan migrate --force

echo "[deploy] zero-downtime rollout of app…"
# Starts the new container, waits for its healthcheck, then retires the old.
docker rollout -f "${COMPOSE_FILE}" app

echo "[deploy] reloading nginx (safety; the swap itself needs no reload)…"
$COMPOSE exec nginx nginx -s reload 2>/dev/null || true

echo "[deploy] done — site stayed up throughout."
