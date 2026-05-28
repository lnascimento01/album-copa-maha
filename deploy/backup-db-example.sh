#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/deploy/docker-compose.staging.yml"
BACKUP_DIR="${ROOT_DIR}/storage/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
FILE_NAME="maha_copa_album_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

: "${DB_DATABASE:?Defina DB_DATABASE no .env}"
: "${DB_USERNAME:?Defina DB_USERNAME no .env}"
: "${DB_PASSWORD:?Defina DB_PASSWORD no .env}"

cd "${ROOT_DIR}"

echo "Gerando backup em ${BACKUP_DIR}/${FILE_NAME}"

docker compose -f "${COMPOSE_FILE}" exec -T mysql \
  sh -lc "mysqldump -u\"${DB_USERNAME}\" -p\"${DB_PASSWORD}\" \"${DB_DATABASE}\" --single-transaction --quick --lock-tables=false" \
  | gzip > "${BACKUP_DIR}/${FILE_NAME}"

echo "Backup concluído: ${BACKUP_DIR}/${FILE_NAME}"
echo "Exemplo de restore:"
echo "gunzip -c ${BACKUP_DIR}/${FILE_NAME} | docker compose -f ${COMPOSE_FILE} exec -T mysql sh -lc 'mysql -u\"${DB_USERNAME}\" -p\"${DB_PASSWORD}\" \"${DB_DATABASE}\"'"
