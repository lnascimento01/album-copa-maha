# Checklist de Staging / Piloto Controlado

## Pré-deploy

1. Definir domínio de staging.
2. Definir `APP_URL`.
3. Gerar `APP_KEY`.
4. Definir `MASTER_EMAIL`.
5. Definir `MASTER_PASSWORD` forte.
6. Definir `APP_DEBUG=false`.
7. Definir `APP_SEED_DEMO_DATA` conforme objetivo.
8. Configurar banco (`DB_*`).
9. Configurar e-mail (`MAIL_*`).
10. Configurar Redis.
11. Garantir storage persistente.
12. Rodar testes localmente antes do deploy.
13. Fazer backup se já houver dados.

## Deploy

### Primeira subida

1. `cp .env.staging.example .env` e preencher variáveis.
2. `bash deploy/staging-build.sh` (build da imagem imutável + up + migrate + storage:link).
3. Rodar seed mínimo ou demo, conforme `APP_SEED_DEMO_DATA`.
4. Validar logs no Docker e Laravel.

### Releases seguintes (zero-downtime)

1. Garantir que o host tem o plugin `docker-rollout` instalado.
2. Garantir que as migrations do release são backward-compatible (expand/contract).
3. `bash deploy/deploy.sh` — faz `git pull` → `build` → `migrate --force` → `docker rollout app`.
4. Confirmar que o site respondeu sem interrupção durante a troca.
5. Validar logs no Docker e Laravel.

> Build de assets/vendor e cache de config/rotas/views são feitos na imagem
> e no entrypoint — não há mais passo manual de `npm`/`composer`/`*:cache`.

## Pós-deploy

1. Login master.
2. Trocar senha master se necessário.
3. Criar usuário de teste.
4. Aprovar usuário.
5. Validar acesso ao álbum.
6. Criar atividade.
7. Gerar QR de check-in.
8. Confirmar presença com participante.
9. Abrir pacote.
10. Resgatar código promocional.
11. Submeter missão social.
12. Aprovar missão social.
13. Validar ranking/conquista/share card.
14. Consultar `audit_logs`.
15. Validar fluxo de logout.
16. Validar reset de senha (se e-mail ativo).

## Rollback básico

1. Restaurar backup de banco.
2. Voltar para a imagem anterior: `git checkout <tag/commit anterior>` e
   `bash deploy/deploy.sh` (o rollout sobe a imagem antiga e troca de volta
   sem downtime).
3. Rodar rollback de migration apenas se seguro.
4. Preferir restore completo para piloto controlado.
