# CLAUDE.md — Site da Capela Nossa Senhora de Fátima

Contexto para o Claude Code trabalhar neste projeto. Leia antes de editar.

## O que é

Site da **Capela Nossa Senhora de Fátima** (Paróquia N. S. Rainha dos Apóstolos),
substituindo um Google Sites. Tem site público + painel administrativo para a
comunidade gerenciar **fotos, eventos, avisos e a programação da semana** sem mexer
em código. Roda 100% no **plano gratuito do Cloudflare** (Workers + D1 + R2).

Migrou de um Google Sites cujo ponto fraco era gerenciar fotos — resolver isso
(galeria com upload fácil pelo celular) é o objetivo central.

## Stack e arquitetura

Monorepo com **npm workspaces** (`frontend` + `backend`).

- **frontend/** — React 18 + Vite 6 + TypeScript + React Router + Framer Motion + CSS Modules.
  Site público (SPA) e painel em `/admin`. Tema mariano (branco, dourado, azul de Fátima),
  títulos em Cormorant Garamond, corpo em Inter.
- **backend/** — Hono no Cloudflare Workers. **D1** (SQLite) para dados, **R2** para fotos.
  Autenticação por sessão (JWT HS256 em cookie httpOnly, senha PBKDF2 via Web Crypto).

**Deploy unificado, sem CORS:** o Worker serve a API em `/api/*` **e** os assets estáticos
de `frontend/dist` (binding `[assets]` com `not_found_handling = "single-page-application"`).
Em dev, o Vite (5173) faz proxy de `/api` → Worker (8787).

## Comandos

Rodar da **raiz** (`site-capela/`):

```bash
npm install                 # instala frontend + backend (workspaces)
npm run dev:backend         # Worker local (D1/R2 simulados) em :8787
npm run dev:frontend        # Vite em :5173 (proxy /api → :8787)
npm run build               # build do frontend → frontend/dist
npm run migrate:local       # aplica migrações no D1 local
npm run migrate:remote      # aplica migrações no D1 remoto (produção)
npm run create-admin -- "email" "Nome" "senha"   # gera SQL do admin
npm run deploy              # build + wrangler deploy (precisa login + setup)
```

Para dev local, crie `backend/.dev.vars`:
```
JWT_SECRET=algum-segredo-de-dev
APP_ENV=development
```

## Estrutura de dados (D1) — ver `backend/migrations/`

- `admin_users` — administradores (senha PBKDF2)
- `posts` — eventos e avisos unificados por `type` ('evento' | 'aviso')
- `albums` + `photos` — galerias (fotos ficam no R2, metadados no D1)
- `schedule` — programação da semana (aparece na Home)
- `settings` — contatos/redes (chave-valor)

## API (Hono) — ver `backend/src/routes/`

- **Público (GET):** `/api/schedule`, `/api/settings`, `/api/posts[?type=]`, `/api/posts/:slug`,
  `/api/albums`, `/api/albums/:slug`, `/api/img/:key` (stream do R2 + cache imutável)
- **Auth:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Admin (protegido, `requireAuth`):** CRUD de `/api/admin/posts`, `/api/admin/albums`,
  upload `POST /api/admin/albums/:id/photos` (multipart → R2), `/api/admin/photos/:id`,
  reordenar, `/api/admin/schedule`, `PUT /api/admin/settings`, `POST /api/admin/upload` (capa)

## Conteúdo fixo no código (não vai pro admin)

- **Pastorais** (9, com textos originais da comunidade): `frontend/src/data/pastorais.ts`
- **Info institucional** (nome, endereço, telefone, redes — defaults): `frontend/src/data/site.ts`
- Horários padrão de fallback: `frontend/src/data/horarios.ts`

Tudo o mais (fotos, eventos, avisos, programação, contatos) é editável em `/admin`.

## Convenções

- Upload de fotos é **comprimido no navegador** antes de subir (`frontend/src/lib/imageCompress.ts`)
  — máx. 1920px, JPEG 0.82. Economiza dados móveis e espaço no R2.
- Chaves do R2 são únicas por upload (UUID) → cache `immutable`.
- Slugs gerados no backend removem acentos (`backend/src/lib/slug.ts`).
- Público **não** faz login; só o admin. Não há cadastro de usuários comuns.
- Respeitar `prefers-reduced-motion` e acessibilidade (público inclui idosos):
  contraste alto, fontes legíveis, foco visível.

## Deploy no Cloudflare (auto no push)

Ver **DEPLOY.md**. Resumo: após o setup único (criar D1/R2, `database_id` no
`backend/wrangler.toml`, secret `JWT_SECRET`, admin inicial), conectar o repositório
no **Cloudflare → Workers & Pages → Workers Builds** com:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy -c backend/wrangler.toml`

A partir daí, cada `git push` na branch principal dispara build + deploy.
Mudanças de schema exigem `npm run migrate:remote` manual.

## Domínio

Alvo final: `nsdfatima.com.br` (hoje aponta para o Google Sites). Migrar os
nameservers para o Cloudflare e adicionar o domínio ao Worker (Settings → Domains).
