# Deploy — Capela N. S. de Fátima (grátis, sem cartão)

Hospedagem no **Cloudflare** (Workers + D1) e fotos no **Cloudinary**.
Tudo no plano gratuito — e **sem precisar de cartão de crédito**.
Para ~100 visitantes, fica folgado dentro dos limites grátis.

O projeto é um **monorepo npm workspaces** (`frontend` + `backend`). Todos os comandos
abaixo rodam a partir da **raiz** (`site-capela/`).

Pré-requisitos: conta no Cloudflare e `npm install` já rodado na raiz.

---

## Parte A — Setup único (uma vez só)

### 1. Autenticar o Wrangler

```bash
npx wrangler login
```

### 2. Criar o banco D1

```bash
npx wrangler d1 create capela-db
```

Copie o `database_id` retornado e cole em **`backend/wrangler.toml`**, no lugar de
`PLACEHOLDER_DATABASE_ID`.

### 3. Configurar o Cloudinary (fotos)

1. Crie uma conta grátis em <https://cloudinary.com> (não pede cartão).
2. No **Dashboard**, copie: **Cloud name**, **API Key** e **API Secret**.
3. Em **`backend/wrangler.toml`**, preencha `CLOUDINARY_CLOUD_NAME` e `CLOUDINARY_API_KEY`.
4. Em **`frontend/src/data/site.ts`**, preencha `CLOUDINARY_CLOUD` com o mesmo Cloud name.
5. Guarde o **API Secret** para o passo 5 (é sensível, não vai no código).

### 4. Aplicar as migrações no banco remoto

```bash
npm run migrate:remote
```

Cria as tabelas e o seed inicial (programação e contatos).

### 5. Definir os segredos

```bash
npx wrangler secret put JWT_SECRET -c backend/wrangler.toml
# cole uma frase longa e aleatória quando solicitado

npx wrangler secret put CLOUDINARY_API_SECRET -c backend/wrangler.toml
# cole o API Secret do Cloudinary
```

### 6. Criar o primeiro administrador

```bash
npm run create-admin -- "seu@email.com" "Seu Nome" "suaSenhaForte"
```

Rode o comando `--remote` que o script imprime (um `wrangler d1 execute ... --remote`).

---

## Parte B — Deploy automático no `git push` (recomendado)

Igual ao portfólio: conecte o repositório e o Cloudflare faz build + deploy a cada push.

1. Suba o projeto para um repositório no GitHub (veja "Git" abaixo).
2. No painel Cloudflare → **Workers & Pages → Create → Workers → Connect to Git**.
3. Selecione o repositório da capela.
4. Configure o build:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy -c backend/wrangler.toml`
   - **Root directory:** `/` (raiz)
5. **Save and Deploy**.

Pronto. A partir daí, todo `git push` na branch principal dispara build + deploy
automático. O site fica em `https://capela-fatima.<sua-conta>.workers.dev`.

> Os segredos (`JWT_SECRET`, `CLOUDINARY_API_SECRET`) e o `database_id` já ficam no
> Worker/arquivo — o CI não precisa deles além do que já está configurado.

### Deploy manual (alternativa, sem Git)

```bash
npm run deploy      # build do frontend + wrangler deploy
```

---

## Atualizações futuras

- **Código:** só dê `git push` — o Cloudflare rebuilda e redeploya.
- **Schema do banco:** crie uma migração em `backend/migrations/` e rode
  `npm run migrate:remote` (o push sozinho não aplica migrações).

## Git (primeira vez)

```bash
cd C:\Users\gian\Desktop\site-capela
git init
git add .
git commit -m "feat: site da capela (frontend React + backend Worker)"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/site-capela.git
git push -u origin main
```

## Domínio próprio (nsdfatima.com.br)

Painel Cloudflare → seu Worker → **Settings → Domains & Routes** → adicione o domínio.
É necessário que o domínio esteja na sua conta Cloudflare (nameservers apontando para lá).

## Limites do plano grátis (referência)

| Recurso | Limite grátis | Uso esperado |
|---|---|---|
| Workers (requests) | 100.000/dia | Folgado |
| D1 (leituras) | 5 milhões/dia | Folgado |
| Cloudinary | 25 créditos/mês (≈ 25 GB de fotos) | Milhares de fotos |

Nenhum deles pede cartão de crédito.
