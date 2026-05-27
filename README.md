# Álbum da Copa MAHA (`maha-copa-album`)

Base técnica monolítica em Laravel + React/Inertia para o produto **Álbum da Copa MAHA**, focada em autenticação segura, aprovação de cadastro, RBAC auditável e auditoria operacional.

## Etapa 2 (catálogo e coleção)

Esta etapa adiciona a estrutura inicial do álbum digital com:

- `teams`
- `albums`
- `players`
- `stickers`
- `user_stickers`

Inclui CRUD administrativo (sem delete por rota nesta etapa), visualização de coleção em `/album`, e auditoria de ações críticas de catálogo.

## Etapa 3 (pacotes)

Esta etapa adiciona a mecânica inicial de pacotes com rastreabilidade:

- `sticker_packs`
- `sticker_pack_items`
- concessão manual por admin
- abertura por participante
- sorteio apenas de figurinhas ainda não desbloqueadas
- gravação do resultado em `user_stickers`
- trilha de auditoria para concessão, abertura e cancelamento

## Etapa 4 (atividades e check-in operacional)

Esta etapa adiciona a primeira camada operacional de presença:

- `activities`
- `activity_checkins`
- rastreabilidade de origem em `sticker_packs` (`activity_id` e `activity_checkin_id`)
- marcação manual de presença por admin
- geração automática de pacotes por check-in confirmado
- revogação de check-in com bloqueio se pacote já foi aberto
- histórico de check-ins para participante em `/checkins`
- auditoria específica de atividade e check-in

## Etapa 5 (check-in autoatendimento por QR/código)

Esta etapa adiciona sessões temporárias de autoatendimento para presença:

- `activity_checkin_sessions`
- geração de link/token temporário para check-in
- código curto opcional para entrada manual
- confirmação de presença pelo participante via `/checkin/{token}` ou `/checkin-code`
- reaproveitamento do serviço central de check-in para geração de pacotes
- auditoria específica de sessão e autoatendimento
- token bruto exibido apenas no momento da criação (não persistido)

## Etapa 6 (códigos promocionais e missões sociais)

Esta etapa adiciona engajamento social operacional sem integração oficial com API do Instagram:

- `reward_codes`
- `reward_code_redemptions`
- `social_missions`
- `social_mission_submissions`
- rastreabilidade de origem em `sticker_packs` para:
  - `reward_code_id`
  - `reward_code_redemption_id`
  - `social_mission_id`
  - `social_mission_submission_id`
- resgate de código pelo participante com geração automática de pacotes
- submissão social pelo participante + revisão manual por admin
- aprovação de submissão com geração automática de pacotes
- auditoria de criação/ativação/revogação/resgate de código e fluxo de missão/submissão

## Etapa 7 (ranking, conquistas e share cards)

Esta etapa adiciona engajamento motivacional e compartilhamento visual:

- `achievements`
- `user_achievements`
- `share_cards`
- ranking calculado sob demanda do álbum ativo
- desbloqueio automático de conquistas sem duplicação
- concessão manual de conquista por admin
- cards compartilháveis (render em tela 9:16 + copy para story/post)
- auditoria de:
  - `achievement.created`
  - `achievement.updated`
  - `achievement.granted`
  - `achievement.unlocked`
  - `share_card.created`

### Fórmula de score (Etapa 7)

`score = stickers_unlocked*10 + packs_opened*3 + checkins_confirmed*5 + reward_codes_redeemed*2 + social_missions_approved*5 + achievements*8`

Observações:

- ranking inclui apenas usuários `approved`;
- admins ficam fora por padrão (há opção de inclusão no painel admin);
- sem integração oficial com API do Instagram nesta etapa;
- compartilhamento é operacional: card pronto para print/cópia, sem publicação automática.

## Etapa 8 (refino UX/UI, responsividade e performance frontend)

Esta etapa foca em acabamento para demo real sem alterar regras centrais de negócio:

- refinamento de UI participante e admin com padrão visual consistente;
- melhoria de responsividade (mobile/tablet/desktop) nas telas principais;
- padronização de estados vazios, badges de status, métricas e tabelas;
- melhoria de navegação para fluxo de temporada;
- ajustes de code-splitting no Vite para reduzir peso do bundle principal;
- lazy load de QR Code em tela administrativa de atividade.

Principais componentes utilitários de UI adicionados/reutilizados nesta etapa:

- `PageHeader`
- `MetricCard`
- `StatusBadge`
- `OriginBadge`
- `ProgressBar`
- `EmptyState`
- `DataTableShell`

## Etapa 9 (conteúdo realista para demo do time MAHA)

Esta etapa prepara um ambiente de demonstração com dados de temporada mais próximos de produto real:

- catálogo seedado sem placeholders genéricos;
- base de jogadores/personagens em formato editável (`Atleta MAHA`, `Goleiro MAHA`, comissão e momentos);
- distribuição de figurinhas por tipo e raridade para narrativa de coleção;
- conquistas com copy de temporada e conquista especial manual (`Embaixador MAHA`);
- códigos promocionais de demo:
  - `MAHA10`
  - `TREINOFORTE`
  - `RESENHAMAHA`
- missões sociais de demo ativas:
  - story marcando o time;
  - compartilhar progresso do álbum;
  - convite para acompanhar o time.

Também foram refinadas as telas administrativas de cadastro de jogadores/figurinhas para facilitar operação com dados reais:

- ajuda de preenchimento;
- sugestões rápidas de posição;
- sugestão automática de código de figurinha (`MAHA-001`, `GK-001`, `MOM-001`, etc.);
- preview de imagem por URL/caminho textual.

Observação sobre imagens na Etapa 9:

- upload real de arquivo **não foi ativado** nesta etapa para evitar aumento de escopo e risco de regressão;
- os campos `*_path` seguem textuais com preview (URL/caminho);
- upload completo via storage público pode entrar numa etapa dedicada de hardening.

## Requisitos

- Docker + Docker Compose
- Laravel Sail (já incluído no projeto)

## Stack

- Laravel 13
- React + TypeScript + Inertia (mesmo repositório)
- Vite
- MySQL + Redis + Mailpit (via Sail)
- Pest
- Pint
- ESLint + TypeScript Check

## Configuração

```bash
cp .env.example .env
```

Principais variáveis:

- `APP_NAME="Álbum da Copa MAHA"`
- `DB_DATABASE=maha_copa_album`
- `DB_USERNAME=sail`
- `DB_PASSWORD=password`
- `MASTER_NAME="Leandro Nascimento"`
- `MASTER_EMAIL="lfsnascimento84@gmail.com"`
- `MASTER_PASSWORD="password"`
- `APP_SEED_DEMO_DATA=true`

Compatibilidade legada mantida:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Hardening para piloto:

- trocar `MASTER_PASSWORD` antes de ambiente não local;
- definir `APP_DEBUG=false` fora de desenvolvimento;
- ajustar `APP_URL` real do ambiente;
- manter `APP_SEED_DEMO_DATA=false` em piloto quando não quiser dados de demonstração.

## Subir com Sail

```bash
./vendor/bin/sail up -d
```

Aplicação local: `http://localhost:38080`

## Migrations e seed

```bash
./vendor/bin/sail artisan migrate:fresh --seed
```

Seed mínimo de sistema (sem dados de demonstração):

```bash
APP_SEED_DEMO_DATA=false ./vendor/bin/sail artisan migrate:fresh --seed
```

Quando `APP_SEED_DEMO_DATA=false`, o seed inclui apenas:

- permissões e roles;
- usuário master/admin;
- time base MAHA;
- álbum base MAHA 2026.

Dados de catálogo/demo (figurinhas, atividades, códigos, missões, conquistas e pacotes de exemplo) ficam no `DemoDataSeeder` e entram apenas com a flag habilitada.

## Credencial master local (dev)

- E-mail: `lfsnascimento84@gmail.com`
- Senha: valor de `MASTER_PASSWORD` no `.env`

A senha default `password` é apenas para ambiente local de desenvolvimento.

## Fluxo de cadastro/aprovação

1. Usuário registra em `/register`.
2. Usuário nasce com status `pending`.
3. Usuário é redirecionado para `/approval/pending`.
4. Master/admin aprova em `/admin/users`.
5. Após aprovação, usuário acessa `/dashboard`.

## Rotas principais de auth

- `GET /login`
- `GET /register`
- `GET /forgot-password`
- `GET /reset-password/{token}`
- `GET /approval/pending`
- `GET /approval/rejected`
- `GET /approval/suspended`
- `GET /dashboard`

## Rotas da Etapa 2

Admin:

- `GET /admin/teams`
- `GET /admin/teams/create`
- `POST /admin/teams`
- `GET /admin/teams/{team}`
- `GET /admin/teams/{team}/edit`
- `PATCH /admin/teams/{team}`
- `GET /admin/albums`
- `GET /admin/albums/create`
- `POST /admin/albums`
- `GET /admin/albums/{album}`
- `GET /admin/albums/{album}/edit`
- `PATCH /admin/albums/{album}`
- `PATCH /admin/albums/{album}/publish`
- `PATCH /admin/albums/{album}/archive`
- `GET /admin/players`
- `GET /admin/players/create`
- `POST /admin/players`
- `GET /admin/players/{player}`
- `GET /admin/players/{player}/edit`
- `PATCH /admin/players/{player}`
- `GET /admin/stickers`
- `GET /admin/stickers/create`
- `POST /admin/stickers`
- `GET /admin/stickers/{sticker}`
- `GET /admin/stickers/{sticker}/edit`
- `PATCH /admin/stickers/{sticker}`
- `GET /admin/sticker-packs`
- `GET /admin/sticker-packs/create`
- `POST /admin/sticker-packs`
- `GET /admin/sticker-packs/{stickerPack}`
- `PATCH /admin/sticker-packs/{stickerPack}/cancel`
- `GET /admin/activities`
- `GET /admin/activities/create`
- `POST /admin/activities`
- `GET /admin/activities/{activity}`
- `GET /admin/activities/{activity}/edit`
- `PATCH /admin/activities/{activity}`
- `PATCH /admin/activities/{activity}/open`
- `PATCH /admin/activities/{activity}/close`
- `PATCH /admin/activities/{activity}/cancel`
- `POST /admin/activities/{activity}/checkins`
- `PATCH /admin/activity-checkins/{activityCheckin}/revoke`
- `POST /admin/activities/{activity}/checkin-sessions`
- `PATCH /admin/activity-checkin-sessions/{session}/revoke`
- `GET /admin/reward-codes`
- `GET /admin/reward-codes/create`
- `POST /admin/reward-codes`
- `GET /admin/reward-codes/{rewardCode}`
- `GET /admin/reward-codes/{rewardCode}/edit`
- `PATCH /admin/reward-codes/{rewardCode}`
- `PATCH /admin/reward-codes/{rewardCode}/activate`
- `PATCH /admin/reward-codes/{rewardCode}/revoke`
- `GET /admin/social-missions`
- `GET /admin/social-missions/create`
- `POST /admin/social-missions`
- `GET /admin/social-missions/{socialMission}`
- `GET /admin/social-missions/{socialMission}/edit`
- `PATCH /admin/social-missions/{socialMission}`
- `PATCH /admin/social-missions/{socialMission}/activate`
- `PATCH /admin/social-missions/{socialMission}/close`
- `PATCH /admin/social-missions/{socialMission}/cancel`
- `GET /admin/social-mission-submissions`
- `GET /admin/social-mission-submissions/{submission}`
- `PATCH /admin/social-mission-submissions/{submission}/approve`
- `PATCH /admin/social-mission-submissions/{submission}/reject`
- `GET /admin/rankings`
- `GET /admin/achievements`
- `GET /admin/achievements/create`
- `POST /admin/achievements`
- `GET /admin/achievements/{achievement}`
- `GET /admin/achievements/{achievement}/edit`
- `PATCH /admin/achievements/{achievement}`
- `POST /admin/achievements/{achievement}/grant`
- `GET /admin/share-cards`
- `GET /admin/share-cards/{shareCard}`

Participante:

- `GET /album`
- `GET /album/stickers/{sticker}`
- `GET /packs`
- `GET /packs/{stickerPack}`
- `POST /packs/{stickerPack}/open`
- `GET /checkins`
- `GET /checkins/{activityCheckin}`
- `GET /checkin/{token}`
- `POST /checkin/{token}/confirm`
- `GET /checkin-code`
- `POST /checkin-code`
- `GET /reward-code`
- `POST /reward-code`
- `GET /reward-codes/history`
- `GET /social-missions`
- `GET /social-missions/{socialMission}`
- `POST /social-missions/{socialMission}/submissions`
- `GET /social-submissions`
- `GET /social-submissions/{submission}`
- `GET /ranking`
- `GET /achievements`
- `GET /share-cards`
- `POST /share-cards`
- `GET /share-cards/{shareCard}`

Observação: nesta etapa, `/album` usa o **primeiro álbum ativo global** (MVP). Seleção por time do usuário será evolução futura.
Na etapa 3, essa mesma premissa continua válida para concessão e abertura de pacotes.

## Recover/Reset com Mailpit

1. Abrir dashboard do Mailpit: `http://localhost:38025`.
2. Em `/forgot-password`, solicitar link de recuperação para um e-mail cadastrado.
3. Abrir o e-mail no Mailpit e clicar no link de reset.
4. Definir nova senha na tela `/reset-password/{token}`.

## Qualidade

Testes:

```bash
./vendor/bin/sail artisan test
```

Pint:

```bash
./vendor/bin/sail php vendor/bin/pint --test
```

Lint frontend:

```bash
npm run lint:check
```

Type check:

```bash
npm run types:check
```

Build frontend:

```bash
npm run build
```

## Validação manual da Etapa 9

1. Login com master em `/login`.
2. Acessar `/admin/teams`, `/admin/albums`, `/admin/players` e `/admin/stickers`.
3. Ver catálogo seedado (time MAHA, álbum ativo e figurinhas iniciais).
4. Cadastrar um novo time.
5. Cadastrar um novo álbum (draft), publicar e arquivar.
6. Cadastrar jogador/personagem.
7. Cadastrar figurinha.
8. Logar com participante aprovado e acessar `/album`.
9. Criar atividade em `/admin/activities` com recompensa (quantidade e tamanho de pacotes).
10. Abrir atividade (`status=open`).
11. Marcar check-in de participante aprovado na tela da atividade.
12. Conferir geração automática de pacotes `source=checkin`.
13. Acessar `/packs` com participante e verificar origem da atividade.
14. Abrir pacote e validar desbloqueio no `/album`.
15. Em cenário com pacote aberto, tentar revogar check-in e validar bloqueio.
16. Consultar `/checkins` com participante e `/admin/audit-logs` com admin.
17. Na tela da atividade aberta (`/admin/activities/{id}`), gerar sessão de check-in por QR:
   - duração em minutos;
   - `max_uses` opcional;
   - `starts_at` opcional.
18. Copiar o link `/checkin/{token}` ou usar o código curto em `/checkin-code`.
19. Logar com participante aprovado e confirmar presença.
20. Validar:
   - criação de `activity_checkins`;
   - geração automática de pacotes pendentes;
   - incremento de `used_count` da sessão;
   - presença no histórico `/checkins`;
   - origem em `/admin/sticker-packs/{id}`.
21. Revogar sessão ativa e confirmar bloqueio de novos check-ins.
22. Criar código promocional em `/admin/reward-codes` (draft) e ativar.
23. Fazer login com participante aprovado e resgatar em `/reward-code`.
24. Validar criação de `reward_code_redemptions` e `sticker_packs` com `source=reward_code`.
25. Verificar histórico em `/reward-codes/history` e origem em `/packs`.
26. Criar missão social em `/admin/social-missions` (draft) e ativar.
27. Como participante, abrir `/social-missions/{id}` e enviar submissão.
28. Como admin, revisar em `/admin/social-mission-submissions` e aprovar/rejeitar.
29. Como participante, acessar `/ranking` e validar posição/score.
30. Como admin, acessar `/admin/rankings` e validar listagem completa.
31. Como admin, acessar `/admin/achievements` e criar/editar conquista.
32. Validar desbloqueio automático após:
   - abrir pacote;
   - confirmar check-in;
   - resgatar código;
   - aprovar missão social.
33. Como participante, acessar `/achievements` e validar desbloqueadas/bloqueadas.
34. Gerar card em `/share-cards` e abrir `/share-cards/{id}`.
35. Validar `/admin/share-cards` e auditoria em `/admin/audit-logs`.
36. Validar geração de pacotes em aprovação (`source=social_mission`) e histórico em `/social-submissions`.
37. Confirmar que o catálogo não contém placeholders antigos como `Jogador 01` ou `Momento 01`.
38. Confirmar eventos em `/admin/audit-logs`.

### Responsividade sugerida para validação visual

- `360x800`
- `390x844`
- `430x932`
- `768x1024`
- `1024x768`
- `1366x768`
- `1440x900`

Checagens:

- sem overflow horizontal global;
- sidebar/menu navegável no mobile;
- cards e formulários legíveis;
- tabelas com `overflow-x` controlado;
- páginas `/album`, `/packs`, `/checkins`, `/reward-code`, `/social-missions`, `/ranking`, `/achievements` e `/share-cards` operacionais.

## Performance frontend (Etapa 8)

Melhorias aplicadas:

- `manualChunks` em `vite.config.ts` para separar vendors (`react`, `inertia`, `radix`, `icons`, `qrcode`, `misc`);
- `qrcode.react` carregado com import dinâmico/lazy na tela de atividade admin (`/admin/activities/{id}`).

Observação:

- mesmo com split de vendors, o build pode exibir aviso de chunk conforme evolução de páginas e dependências;
- nesta etapa, o foco foi reduzir pressão no chunk principal sem quebrar Inertia/Wayfinder e mantendo build estável.

## Roteiro rápido de demo

1. Admin faz login e aprova usuário pendente em `/admin/users`.
2. Admin cria atividade e abre (`status=open`) em `/admin/activities`.
3. Admin gera sessão de check-in por QR na atividade.
4. Participante confirma presença via QR/token ou código curto.
5. Participante recebe pacote e visualiza em `/packs`.
6. Participante abre pacote em `/packs/{id}`.
7. Participante confirma atualização de progresso em `/album`.
8. Participante resgata `MAHA10` em `/reward-code`.
9. Participante envia missão social em `/social-missions/{id}`.
10. Admin aprova submissão em `/admin/social-mission-submissions`.
11. Participante visualiza ranking, conquistas e share cards em `/ranking`, `/achievements` e `/share-cards`.

## Fluxo de pacotes (Etapa 3 e 4)

1. Admin concede pacotes em `/admin/sticker-packs/create`.
2. Participante visualiza pendentes em `/packs`.
3. Participante abre pacote em `/packs/{id}`.
4. Sistema entrega apenas figurinhas faltantes e ativas do álbum do pacote.
5. Resultado fica persistido em `sticker_pack_items` e `user_stickers`.
6. Histórico permanece auditável para admin e participante.

Na etapa 4:

1. Admin cria atividade e configura recompensa por presença.
2. Admin marca check-in para participante aprovado.
3. Sistema cria pacotes com `source=checkin`, `activity_id` e `activity_checkin_id`.
4. Participante acompanha histórico em `/checkins`.
5. Revogação só é permitida quando nenhum pacote vinculado foi aberto.

Na etapa 5:

1. Admin gera sessão temporária de check-in em atividade `open`.
2. Sessão retorna link com token bruto apenas no momento da criação.
3. Participante aprovado confirma presença por token ou código curto.
4. Check-in reaproveita serviço central e gera pacotes automaticamente.
5. Sessões respeitam validade temporal, status (`active/revoked`) e `max_uses`.
6. Tentativas inválidas retornam mensagem controlada e são auditáveis quando relevante.

Na etapa 6:

1. Admin cria e ativa códigos promocionais para divulgação em story/post.
2. Participante aprovado resgata código manualmente no app.
3. Resgate cria `reward_code_redemptions`, incrementa `redeemed_count` e gera pacotes pendentes.
4. Admin cria missões sociais com validação manual.
5. Participante envia evidência textual/URL.
6. Admin aprova ou rejeita submissão.
7. Aprovação gera pacotes pendentes com rastreabilidade da missão/submissão.
8. Todo fluxo fica auditável sem integração oficial com Instagram API.

## Regras da Etapa 6 (Instagram operacional)

- Não há integração oficial com Instagram API nesta etapa.
- O código é divulgado externamente e digitado manualmente pelo participante.
- Evidências de missão são texto/URL; não há upload real de imagem.
- `reward_code` e `social_mission` geram pacotes apenas em ações válidas e aprovadas.
- Usuário não aprovado não participa de resgate/submissão.
- Falhas relevantes de resgate/submissão ficam auditáveis.

## Regras de segurança do check-in por QR/código

- O token bruto **não** é persistido; apenas `token_hash`.
- Sessão só pode ser criada para atividade `open` com álbum `active`.
- Sessão expirada/revogada/fora da janela não permite confirmação.
- `max_uses` (quando definido) limita confirmações bem-sucedidas.
- Usuário `pending/rejected/suspended` não confirma presença.
- A regra de unicidade `activity_id + user_id` impede duplicidade de check-in.
- Falhas de confirmação não geram pacotes.

## Checklist para piloto controlado

### 1) Antes de subir

1. Definir `APP_ENV` do ambiente.
2. Definir `APP_DEBUG=false`.
3. Definir `APP_URL` real.
4. Definir `MASTER_EMAIL`.
5. Definir `MASTER_PASSWORD` forte.
6. Definir `APP_SEED_DEMO_DATA` conforme estratégia de piloto.
7. Configurar banco e conexões.
8. Rodar `php artisan key:generate` no ambiente.
9. Rodar migrations e seed.
10. Validar usuário master/admin e acesso inicial.

### 2) Validação pós-deploy

1. Login com master.
2. Criar usuário de teste.
3. Aprovar usuário.
4. Acessar álbum.
5. Criar atividade.
6. Gerar QR/check-in session.
7. Confirmar presença com participante.
8. Abrir pacote.
9. Resgatar código promocional.
10. Submeter missão social.
11. Aprovar missão social.
12. Ver ranking, conquistas e share card.
13. Conferir trilha em `/admin/audit-logs`.

### 3) Segurança operacional

1. Não compartilhar senha master.
2. Trocar senha master após seed inicial.
3. Não manter `APP_DEBUG=true` fora de local.
4. Revisar usuários com role `admin`.
5. Revisar permissões por role.
6. Monitorar `audit_logs`.
7. Não expor links/token de QR fora da janela de validade.

### 4) Limitações conhecidas

1. Sem integração oficial com Instagram.
2. Sem geolocalização para check-in.
3. Sem upload real de imagens.
4. Catálogo ainda usa nomes editáveis/neutros.
5. Projeto preparado para piloto controlado, não para tráfego massivo público.

## Permissões delete

- Slugs `*.delete` continuam seedados para evolução futura de governança.
- Nesta fase, não há rotas `DELETE` expostas para catálogo principal.
- A ausência de rotas delete é intencional para reduzir risco operacional no piloto.

## Fora desta etapa

Não faz parte desta etapa:

- novas regras de domínio;
- novas entidades de negócio;
- integração oficial com API do Instagram;
- automação de publicação social;
- QR avançado com geolocalização.

Próxima prevista: **Etapa 11** (deploy/staging real com Docker/env de homologação, domínio, HTTPS, backup, logs e storage persistente).
