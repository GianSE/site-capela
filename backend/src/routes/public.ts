import { Hono } from 'hono';
import type { Env, Variables } from '../types';

/** Rotas públicas de leitura (sem autenticação). */
export const publicRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------- Programação da semana ----------
publicRoutes.get('/schedule', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, label, day_of_week, time, note, sort_order, active
       FROM schedule WHERE active = 1 ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

// ---------- Configurações (contatos/redes) ----------
publicRoutes.get('/settings', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<{
    key: string;
    value: string;
  }>();
  const map: Record<string, string> = {};
  for (const row of results) map[row.key] = row.value;
  return c.json(map);
});

// ---------- Posts (eventos/avisos) ----------
publicRoutes.get('/posts', async (c) => {
  const type = c.req.query('type');
  const limit = Math.min(Number(c.req.query('limit')) || 100, 100);

  let sql = `SELECT id, slug, type, title, summary, body, location, event_date,
                    cover_id, published, created_at, updated_at
               FROM posts WHERE published = 1`;
  const params: unknown[] = [];
  if (type === 'evento' || type === 'aviso') {
    sql += ` AND type = ?`;
    params.push(type);
  }
  // Eventos: por data (mais recente/próximo primeiro); Avisos: por criação.
  sql += ` ORDER BY COALESCE(event_date, created_at) DESC, id DESC LIMIT ?`;
  params.push(limit);

  const { results } = await c.env.DB.prepare(sql)
    .bind(...params)
    .all();
  return c.json(results);
});

publicRoutes.get('/posts/:slug', async (c) => {
  const slug = c.req.param('slug');
  const post = await c.env.DB.prepare(
    `SELECT id, slug, type, title, summary, body, location, event_date,
            cover_id, published, created_at, updated_at
       FROM posts WHERE slug = ? AND published = 1`
  )
    .bind(slug)
    .first();
  if (!post) return c.json({ error: 'Não encontrado' }, 404);
  return c.json(post);
});

// ---------- Álbuns ----------
publicRoutes.get('/albums', async (c) => {
  const limit = Math.min(Number(c.req.query('limit')) || 100, 100);
  const { results } = await c.env.DB.prepare(
    `SELECT a.id, a.slug, a.title, a.description, a.event_date, a.cover_photo_id,
            a.category, a.published, a.created_at,
            cp.image_id AS cover_id,
            (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) AS photo_count
       FROM albums a
       LEFT JOIN photos cp ON cp.id = a.cover_photo_id
      WHERE a.published = 1
      ORDER BY COALESCE(a.event_date, a.created_at) DESC, a.id DESC
      LIMIT ?`
  )
    .bind(limit)
    .all();
  return c.json(results);
});

publicRoutes.get('/albums/:slug', async (c) => {
  const slug = c.req.param('slug');
  const album = await c.env.DB.prepare(
    `SELECT a.id, a.slug, a.title, a.description, a.event_date, a.cover_photo_id,
            a.category, a.published, a.created_at,
            cp.image_id AS cover_id,
            (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) AS photo_count
       FROM albums a
       LEFT JOIN photos cp ON cp.id = a.cover_photo_id
      WHERE a.slug = ? AND a.published = 1`
  )
    .bind(slug)
    .first<{ id: number }>();
  if (!album) return c.json({ error: 'Álbum não encontrado' }, 404);

  const { results: photos } = await c.env.DB.prepare(
    `SELECT id, album_id, image_id, caption, width, height, sort_order
       FROM photos WHERE album_id = ? ORDER BY sort_order, id`
  )
    .bind(album.id)
    .all();

  return c.json({ ...album, photos });
});

// As imagens são servidas diretamente pela CDN do Cloudinary (ver frontend imgUrl).
