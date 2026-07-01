# Capela Nossa Senhora de Fátima — Site

Site da Capela N. S. de Fátima (Paróquia N. S. Rainha dos Apóstolos) com painel
administrativo para gerenciar **fotos, eventos, avisos e a programação da semana**.

Tudo roda **gratuitamente e sem cartão**: Cloudflare (Workers + D1) + Cloudinary (fotos).

## Estrutura

```
site-capela/
├── frontend/   React + Vite + TypeScript (site público + painel /admin)
└── backend/    Hono no Cloudflare Workers (API REST + D1 + Cloudinary)
```

- **Frontend:** React 18, React Router, Framer Motion, CSS Modules. Tema mariano
  (branco, dourado e azul de Fátima).
- **Backend:** Hono. Banco **D1** (SQLite) para conteúdo, **Cloudinary** para as fotos.
  Autenticação por sessão (JWT em cookie httpOnly, senha PBKDF2).
- **Deploy unificado:** um único Worker serve a API (`/api/*`) e o site estático
  (`frontend/dist`), sem CORS.

## Desenvolvimento local

Pré-requisitos: Node 20+.

```bash
# 1) Backend (Worker + D1 simulados localmente)
cd backend
npm install
npm run db:migrate:local           # cria as tabelas no D1 local
node scripts/create-admin.mjs "seu@email.com" "Seu Nome" "suaSenha"
# rode o comando "--local" impresso para criar seu usuário admin
npm run dev                        # http://127.0.0.1:8787

# 2) Frontend (em outro terminal)
cd frontend
npm install
npm run dev                        # http://localhost:5173 (faz proxy /api → 8787)
```

Acesse o site em `http://localhost:5173` e o painel em `http://localhost:5173/admin`.

> Crie um arquivo `backend/.dev.vars` com `JWT_SECRET=...` e `APP_ENV=development`
> para o desenvolvimento local (não comite esse arquivo).

## Deploy

Veja o passo a passo completo em **[DEPLOY.md](./DEPLOY.md)**.

## Conteúdo fixo (no código)

As **pastorais** e os textos institucionais ficam em `frontend/src/data/`
(`pastorais.ts`, `site.ts`) — edite ali quando precisar. Tudo o mais
(fotos, eventos, avisos, programação, contatos) é gerenciado pelo painel `/admin`.
