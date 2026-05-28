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

1. `composer install --no-dev --optimize-autoloader`.
2. `npm ci`.
3. `npm run build`.
4. Subir containers (`docker compose ... up -d`).
5. Rodar migrations (`php artisan migrate --force`).
6. Rodar seed mínimo ou demo, conforme `APP_SEED_DEMO_DATA`.
7. Criar storage link (`php artisan storage:link`).
8. `php artisan config:cache`.
9. `php artisan route:cache`.
10. `php artisan view:cache`.
11. Reiniciar serviços se necessário.
12. Validar logs no Docker e Laravel.

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
2. Voltar para imagem/código anterior.
3. Rodar rollback de migration apenas se seguro.
4. Preferir restore completo para piloto controlado.
