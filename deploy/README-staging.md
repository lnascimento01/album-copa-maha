# Staging Deploy Guide (Etapa 11)

Este guia prepara o projeto para **staging controlado**, sem alterar o fluxo local com Sail.

## Arquivos desta etapa

- `deploy/docker-compose.staging.yml`
- `deploy/Dockerfile.staging`
- `deploy/nginx/app.conf.example`
- `.env.staging.example`
- `deploy/staging-build.sh` (primeira subida)
- `deploy/deploy.sh` (rebuild + rollout zero-downtime)
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

## Arquitetura de deploy (zero-downtime)

A imagem é **imutável**: `deploy/Dockerfile.staging` é multi-stage e assa o
código, o `vendor` (Composer) e os assets do Vite dentro da imagem. O código
**não** é mais bind-montado do host. Cada release é uma imagem nova que sobe
ao lado da antiga e é trocada sem derrubar a aplicação.

- O `entrypoint.sh` não builda nada: ele publica os assets no volume
  compartilhado, roda `storage:link` e `optimize`, e sobe o `php-fpm`.
- As migrations rodam **uma única vez** no `deploy.sh`, antes da troca.
- O nginx serve os estáticos do volume `staging_app_public` e re-resolve o
  host `app` por requisição (via DNS do Docker), então o swap não exige
  restart do nginx.

## Primeira subida

Use o script (apenas na primeira vez):

```bash
bash deploy/staging-build.sh
```

Ele faz: build da imagem imutável → `up -d` → `migrate --force` →
`storage:link`. O cache de config/rotas/views é gerado pelo entrypoint a
cada start do container.

## Atualizar / rebuildar (zero-downtime)

Para cada novo release:

```bash
bash deploy/deploy.sh
```

Fluxo, sem tirar o site do ar:

1. `git pull --ff-only` (não afeta o container em execução)
2. `docker compose build app` — nova imagem, enquanto a antiga serve
3. `php artisan migrate --force` em container descartável da nova imagem
   (migrations precisam ser **backward-compatible / expand-contract**)
4. `docker rollout app` — sobe o novo container, espera ficar healthy e só
   então remove o antigo

> Requer o plugin **docker-rollout** no host
> (https://github.com/wowu/docker-rollout).

## Persistência

`deploy/docker-compose.staging.yml` já define volumes para:

- MySQL (`staging_mysql_data`)
- Redis (`staging_redis_data`)
- `public/` compartilhado app↔nginx (`staging_app_public`)
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
