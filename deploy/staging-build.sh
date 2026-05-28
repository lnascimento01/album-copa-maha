#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deploy/docker-compose.staging.yml"

cd "${ROOT_DIR}"

if [[ ! -f "${ROOT_DIR}/.env" ]]; then
  echo "Arquivo .env não encontrado. Copie .env.staging.example para .env antes de continuar."
  exit 1
fi

echo "[1/9] Build da imagem de app"
docker compose -f "${COMPOSE_FILE}" build app

echo "[2/9] Instala dependências PHP (sem dev)"
docker compose -f "${COMPOSE_FILE}" run --rm app composer install --no-dev --optimize-autoloader --no-interaction

echo "[3/9] Build frontend com Node container"
docker run --rm \
  -v "${ROOT_DIR}:/app" \
  -w /app \
  node:22-alpine \
  sh -lc "npm ci && npm run build"

echo "[4/9] Sobe serviços de staging"
docker compose -f "${COMPOSE_FILE}" up -d

echo "[5/9] Migrações (force)"
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan migrate --force

echo "[6/9] Link de storage"
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan storage:link || true

echo "[7/9] Cache de configuração/rotas/views"
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan config:cache
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan route:cache
docker compose -f "${COMPOSE_FILE}" exec -T app php artisan view:cache

echo "[8/9] Status dos containers"
docker compose -f "${COMPOSE_FILE}" ps

echo "[9/9] URLs e logs"
echo "Aplicação staging (HTTP): http://localhost:${STAGING_HTTP_PORT:-8080}"
echo "Logs da app: docker compose -f ${COMPOSE_FILE} logs -f app"
