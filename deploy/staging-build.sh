#!/usr/bin/env bash
# First-time staging bring-up.
#
# Use this once to stand the environment up. For subsequent releases use
# deploy/deploy.sh, which rebuilds and swaps the app with zero downtime.
#
# Dependencies (composer vendor) and the frontend assets are baked into the
# image by deploy/Dockerfile.staging, so there is no host-side composer/npm
# step here anymore.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deploy/docker-compose.staging.yml"

cd "${ROOT_DIR}"

if [[ ! -f "${ROOT_DIR}/.env" ]]; then
  echo "Arquivo .env não encontrado. Copie .env.staging.example para .env antes de continuar."
  exit 1
fi

echo "[1/6] Build da imagem imutável (código + vendor + assets)"
docker compose -f "${COMPOSE_FILE}" build app

echo "[2/6] Sobe serviços de staging"
docker compose -f "${COMPOSE_FILE}" up -d

echo "[3/6] Migrações (force)"
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan migrate --force

echo "[4/6] Link de storage"
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan storage:link || true

# config/route/view/event cache já são gerados pelo entrypoint a cada start.
echo "[5/6] Status dos containers"
docker compose -f "${COMPOSE_FILE}" ps

echo "[6/6] URLs e logs"
echo "Aplicação staging (HTTP): http://localhost:${STAGING_HTTP_PORT:-8080}"
echo "Logs da app: docker compose -f ${COMPOSE_FILE} logs -f app"
