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
Imagens (padrão)             → Cloudinary, 1 conta por site (CDN + f_auto/q_auto + resize)
Imagens (storage-heavy)      → Backblaze B2 + cache da Cloudflare (egress grátis)
Lógica dinâmica (API/auth)   → Workers                              [enxuto: 100k/dia/conta]
Dados estruturados           → D1                                   [leituras baratas]
```

> Ver a seção **"Imagens: qual escolher"** abaixo — a decisão Cloudinary vs B2 é o ponto
> central e depende de cada site (mídia vs storage).

## Os 3 movimentos que fazem caber mais sites

> Com **Cloudinary (Padrão A)**, os movimentos 1 e 2 já vêm de graça (CDN próprio +
> `f_auto`/resize on-the-fly). As técnicas abaixo importam sobretudo no **Padrão B (B2)** e
> como princípio geral de cache. O movimento 3 vale para os dois.

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

## Imagens: qual escolher (a decisão que importa)

Aqui vale uma correção importante em relação à intuição de "B2 é sempre mais barato":
**para mídia em si, o Cloudinary é tecnicamente melhor** — ele entrega WebP/AVIF por
navegador (`f_auto`), redimensiona on-the-fly, tem CDN próprio (não toca seus recursos
Cloudflare) e não exige código. O B2 só compensa quando o gargalo é **storage** ou quando
os 25 créditos de **uma** conta Cloudinary não dão conta de muitos sites.

Mas esse "muitos sites" tem uma saída mais simples que trocar de tecnologia:

> **Padrão recomendado: Cloudinary, uma conta grátis por site (ou por grupo de sites).**
> Cada conta = 25 créditos novos, sem cartão. Você multiplica o orçamento **mantendo**
> todas as vantagens de mídia do Cloudinary e **sem gastar Worker** com imagem.

### Regra de bolso

| Situação do site | Melhor escolha |
|---|---|
| Site comum, baixo/médio tráfego | **Cloudinary** (conta própria) — melhor entrega, zero código |
| Muitos sites | **Cloudinary com contas separadas** (multiplica o grátis) |
| **Storage-heavy** (milhares de fotos, GBs) | **B2 + Cloudflare** (10GB + egress grátis) |
| Quer parar de depender de terceiro | B2 + Cloudflare (você dono do pipeline) |

- **Cloudflare R2** = alternativa ótima ao B2 (egress grátis nativo), mas **exige cartão** no
  cadastro mesmo no grátis. Evitado por isso.

## Padrão A (recomendado) — Cloudinary por conta

```
Frontend estático  ──►  Cloudflare Workers Assets   (hospedagem grátis)
        └─ /api/*   ──►  Worker (Hono) ──► D1 (metadados)   [Worker só p/ dados/upload]
Imagens            ──►  Cloudinary (CDN + f_auto/q_auto + resize on-the-fly)
                        [servidas pelo CDN do Cloudinary — não tocam seu Worker]
```
- Upload: navegador comprime → Worker envia ao Cloudinary (assinado) → guarda o public_id no D1.
- Servir: `imgUrl(id)` monta a URL do Cloudinary com `f_auto,q_auto,w_X`. Simples.
- Escala: 1 conta Cloudinary por site/grupo.

## Padrão B (só p/ storage-heavy) — B2 + cache da Cloudflare

```
Frontend estático  ──►  Cloudflare Workers Assets
        ├─ /api/*        ──►  Worker (Hono) ──► D1 (metadados)
        │                                    └► B2 (PUT/DELETE via S3 assinado)
        └─ /api/img/:key ──►  Worker ──► Cache API ──► (miss) B2
                                             └► hit: servido da borda, grátis
```
- Upload: navegador gera `thumb`/`full` → Worker faz `PUT` no B2 → guarda a base no D1.
- Servir: `/api/img/:key` no Worker faz `GET` no B2, cacheia (`caches.default`, imutável).
  Com domínio próprio, troca-se por CNAME + Cache Rule e dispensa-se o Worker.
- Trade-off: perde `f_auto`/resize on-the-fly, gasta 1 request de Worker por view, mais código.
- **Implementação de referência:** branch `feat/b2-images` deste repositório.

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
- [ ] Imagens no **Cloudinary** (conta própria do site) — padrão A; **B2** só se for storage-heavy
- [ ] `f_auto,q_auto` + tamanho certo por contexto (não mande 3000px p/ exibir em 300px)
- [ ] `loading="lazy"` nas imagens abaixo da dobra
- [ ] Comprima no cliente antes de subir (economiza storage)
- [ ] Nova conta grátis por site quando o free tier de uma apertar

---

**Status neste projeto (capela):** hospedagem na Cloudflare ✅, dados no D1 ✅, fotos no
**Cloudinary** ✅ (Padrão A — é um site só, de baixo tráfego; o Cloudinary faz o trabalho
melhor e com menos código). A variante **B2 + Cloudflare** (Padrão B) fica pronta e guardada
na branch `feat/b2-images` como template para um eventual site **storage-heavy**.
