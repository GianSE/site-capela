# Arquitetura Free-Tier — guia para rodar muitos sites de graça

Guia reutilizável para hospedar vários sites pessoais gastando o mínimo de recursos.
Combo: **Cloudflare** (hospedagem + edge) + **Backblaze B2** (arquivos) + **Cloudinary**
(opcional, só transformação). Escrito a partir do projeto da Capela N. S. de Fátima.

## O princípio central

**Quase todo limite de free tier é por CONTA e compartilhado entre TODOS os seus sites**
— não por site. Então "gastar pouco por site" = manter cada site **fora dos caminhos
medidos** e empurrar tudo que der para o **estático** e para o **cache de borda**.

Regra de ouro: **request estático não conta; request de Worker conta; byte servido do
cache da Cloudflare é grátis; byte servido do origin é medido.**

## Limites que importam (e de quem são)

| Recurso | Free tier | Compartilhado por |
|---|---|---|
| Cloudflare Pages / Workers **Static Assets** | ilimitado | — (grátis de verdade) |
| Cloudflare **Workers** (dinâmico) | 100.000 req/dia | **conta** (todos os sites somam) |
| Cloudflare **D1** (SQLite) | 5 GB · 5M leituras/dia | conta |
| Cloudflare **Cache** (egress) | ilimitado | — (grátis) |
| **Backblaze B2** storage | 10 GB | conta |
| **Backblaze B2** egress **via Cloudflare** | **grátis** (Bandwidth Alliance) | — |
| **Cloudinary** | 25 créditos/mês¹ | conta |

¹ 1 crédito = 1 GB storage **ou** 1 GB banda **ou** 1.000 transformações. Storage + banda +
transforms competem pelo mesmo bolo — por isso o Cloudinary "acaba" primeiro quando é
compartilhado entre muitos sites.

## Divisão de trabalho de menor custo

```
Site estático (HTML/JS/CSS)  → Cloudflare Pages / Workers Assets   [ILIMITADO]
Imagens e arquivos           → Backblaze B2, servidos com cache da Cloudflare
                               (egress B2→Cloudflare é grátis; a borda cacheia o resto)
Lógica dinâmica (API/auth)   → Workers                              [enxuto: 100k/dia/conta]
Dados estruturados           → D1                                   [leituras baratas]
Transformação de imagem      → pré-gerar no upload (padrão) OU Cloudinary só quando
                               precisar transformar on-the-fly (e sempre com cache duro)
```

## Os 3 movimentos que fazem caber mais sites

### 1. Imagem não passa por Worker à toa — e quando passa, cacheia forte
Servir imagem pelo Worker gasta o orçamento de 100k/dia (compartilhado). Duas formas de
evitar o desperdício:

- **Com domínio próprio (ideal):** aponte um subdomínio (`img.seusite.com`) para o bucket
  B2 via CNAME **proxied** na Cloudflare + **Cache Rule "Cache Everything"** com TTL longo.
  As imagens são servidas pela borda da Cloudflare (egress grátis) e **nem invocam Worker**.
- **Sem domínio próprio (ex.: `*.workers.dev`):** o Worker faz proxy do B2 e cacheia com a
  **Cache API** (`caches.default`). O fetch B2→Worker é egress grátis (Bandwidth Alliance) e,
  depois do 1º acesso, a borda entrega do cache. Custa 1 request de Worker por view, mas isso
  é barato para sites de baixo tráfego.

### 2. Pré-gere os tamanhos no UPLOAD, não a cada view
Transformar on-the-fly (Cloudinary `w_300` etc.) gasta crédito **toda vez**. Em vez disso,
no momento do upload gere 2–3 variantes no **navegador** (canvas) e guarde todas no B2:

- `thumb` (~400–500px) → grids e listas
- `full` (~1600–1920px) → lightbox / visualização

Depois, cada view é só um GET cacheado. **Zero custo recorrente de transformação.**

### 3. URLs imutáveis → cache eterno
Cada arquivo recebe um id único (UUID) e **nunca** é sobrescrito. Isso permite
`Cache-Control: public, max-age=31536000, immutable`. A Cloudflare cacheia praticamente
para sempre e o origin quase nunca é chamado. Ao trocar a imagem, gera-se uma **nova** key
(a antiga expira sozinha).

## Onde cada armazenamento se encaixa

- **Backblaze B2** = origem durável dos arquivos. 10 GB grátis, egress grátis via Cloudflare.
  É o "arroz com feijão" escalável para muitos sites. Acesso via API S3-compatível.
- **Cloudinary** = conveniência de transformação dinâmica. Use só nos sites que realmente
  precisam, sempre com cache na frente. Não deixe ser o pipeline padrão de todos os sites.
- **Cloudflare R2** = alternativa ótima ao B2 (egress grátis nativo), mas **exige cartão** no
  cadastro mesmo no grátis. Evitado aqui por isso.

## Padrão de projeto recomendado (o "starter")

```
Frontend (React/Vite) estático  ──►  Cloudflare Workers Assets  (hospedagem grátis)
        │
        ├─ /api/*        ──►  Worker (Hono)  ──►  D1 (metadados)
        │                                     └►  B2 (upload/delete via S3 assinado)
        └─ /api/img/:key ──►  Worker  ──►  Cache API  ──►  (miss) B2 público
                                              └► hit: servido da borda, grátis
```

- **Upload:** navegador comprime + gera `thumb`/`full` → Worker assina e faz `PUT` no B2 →
  guarda as keys no D1.
- **Servir:** `/api/img/:key` no Worker faz `GET` no B2, cacheia com `caches.default` e
  responde com cache imutável. (Com domínio próprio, troca-se por CNAME + Cache Rule e
  dispensa-se o Worker.)

## Táticas extras (baixo esforço, bom retorno)

- **Prefira estático/SSG** ao invés de renderizar no Worker. Site estático = requests
  ilimitados e grátis.
- **`loading="lazy"`** em toda imagem abaixo da dobra.
- **Sirva o tamanho certo** (não mande 3000px para exibir em 300px).
- **Comprima no cliente** antes de subir (canvas, JPEG/WebP q~0.8) — economiza storage e banda.
- **Múltiplas contas grátis** por projeto/grupo: cada conta Cloudflare/B2/Cloudinary zera os
  limites de novo. Legítimo para projetos pessoais independentes e é a forma mais simples de
  "escalar o grátis".
- **PWA + Service Worker** cacheando imagens no dispositivo: retorno menor, faça por último.

## Checklist rápido para cada site novo

- [ ] Frontend estático na Cloudflare (Pages ou Workers Assets)
- [ ] Worker só para API/auth/upload (nada de renderizar página nem servir imagem à toa)
- [ ] Arquivos no B2, servidos com cache da Cloudflare (CNAME+Cache Rule, ou proxy+Cache API)
- [ ] Variantes de imagem geradas no upload; nada de transformar on-the-fly por view
- [ ] `Cache-Control: immutable, max-age=1 ano` nas imagens (keys únicas)
- [ ] `loading="lazy"` + tamanhos adequados
- [ ] Cloudinary só se precisar mesmo transformar dinamicamente

---

**Status neste projeto (capela):** hospedagem na Cloudflare ✅, dados no D1 ✅. As fotos
estão migrando de **Cloudinary → Backblaze B2 + cache da Cloudflare** para servir de template
deste padrão (ver branch `feat/b2-images`).
