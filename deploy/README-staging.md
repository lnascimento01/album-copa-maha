# Staging Deploy Guide (Etapa 11)

Este guia prepara o projeto para **staging controlado**, sem alterar o fluxo local com Sail.

## Arquivos desta etapa

- `deploy/docker-compose.staging.yml`
- `deploy/Dockerfile.staging`
- `deploy/nginx/app.conf.example`
- `.env.staging.example`
- `deploy/staging-build.sh`
- `deploy/backup-db-example.sh`
- `deploy/checklist-staging.md`

## Pré-requisitos

- Docker + Docker Compose v2
- acesso ao repositório no servidor de staging
- DNS/domínio configurado no reverse proxy (quando aplicável)

## Setup inicial

1. Copiar o env de staging:

```bash
cp .env.staging.example .env
```

2. Preencher variáveis obrigatórias:

- `APP_KEY` (gerar com `php artisan key:generate --show`)
- `APP_URL`
- `MASTER_PASSWORD` forte
- `DB_*`
- `MAIL_*`
- `SESSION_SECURE_COOKIE=true` para HTTPS

3. Definir se entra com dados de demo:

- `APP_SEED_DEMO_DATA=false` para piloto mais limpo;
- `APP_SEED_DEMO_DATA=true` para demonstração guiada.

## Build e subida

Use o script:

```bash
bash deploy/staging-build.sh
```

Ele executa:

1. build da imagem `app`
2. `composer install --no-dev --optimize-autoloader`
3. `npm ci && npm run build`
4. `docker compose up -d`
5. `php artisan migrate --force`
6. `php artisan storage:link`
7. `config:cache`, `route:cache`, `view:cache`

## Persistência

`deploy/docker-compose.staging.yml` já define volumes para:

- MySQL (`staging_mysql_data`)
- Redis (`staging_redis_data`)
- `storage/app/public` (`staging_storage_public`)
- `storage/logs` (`staging_storage_logs`)

> `bootstrap/cache` e `storage/framework/*` devem permanecer graváveis no container `app`.

## Logs

- Laravel app logs: `storage/logs/laravel.log`
- Docker logs:

```bash
docker compose -f deploy/docker-compose.staging.yml logs -f app
docker compose -f deploy/docker-compose.staging.yml logs -f nginx
```

## Auditoria operacional

Painel interno:

- `/admin/audit-logs`

Eventos críticos para monitorar no piloto:

- `user.login`
- `permission.denied`
- `sticker_pack.opened`
- `activity_checkin.confirmed`
- `activity_checkin.self_confirmed`
- `reward_code.redeemed`
- `social_mission_submission.approved`
- `activity_checkin_session.created`
- `activity_checkin_session.revoked`

## Backup básico

Gerar backup:

```bash
bash deploy/backup-db-example.sh
```

Antes de piloto real:

1. testar restore em ambiente isolado;
2. definir janela de backup (manual diário no mínimo);
3. executar backup antes de migrations sensíveis.

## HTTPS / Reverse proxy

Use `deploy/nginx/app.conf.example` como base.

Pontos obrigatórios:

- `APP_URL` com `https://...`
- `SESSION_SECURE_COOKIE=true`
- encaminhar headers de proxy:
  - `X-Forwarded-For`
  - `X-Forwarded-Proto`
  - `X-Real-IP`
- redirecionar `HTTP -> HTTPS` no proxy de borda.
