import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { uniqueSlug } from '../lib/slug';
import { uploadImage, deleteImage } from '../lib/cloudinary';

export const adminRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Tudo aqui exige autenticação.
adminRoutes.use('*', requireAuth);

// ============================================================
// UPLOAD avulso (capa de evento/aviso) → Cloudinary, devolve o public_id
// ============================================================
adminRoutes.post('/upload', async (c) => {
  const form = await c.req.formData();
  const raw = form.get('file') as unknown as File | string | null;
  if (!raw || typeof raw === 'string') {
    return c.json({ error: 'Nenhum arquivo enviado' }, 400);
  }
  const { publicId } = await uploadImage(c.env, raw, 'capela/covers');
  return c.json({ cover_id: publicId }, 201);
});

// ============================================================
// POSTS (eventos / avisos)
// ============================================================
adminRoutes.get('/posts', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM posts ORDER BY COALESCE(event_date, created_at) DESC, id DESC`
  ).all();
  return c.json(results);
});

adminRoutes.get('/posts/:id', async (c) => {
  const post = await c.env.DB.prepare(`SELECT * FROM posts WHERE id = ?`)
    .bind(c.req.param('id'))
    .first();
  if (!post) return c.json({ error: 'Não encontrado' }, 404);
  return c.json(post);
});

interface PostInput {
  type?: string;
  title?: string;
  summary?: string;
  body?: string;
  location?: string;
  event_date?: string;
  cover_id?: string;
  published?: boolean;
}

adminRoutes.post('/posts', async (c) => {
  const b = await c.req.json<PostInput>().catch(() => ({}) as PostInput);
  if (!b.title || (b.type !== 'evento' && b.type !== 'aviso')) {
    return c.json({ error: 'Tipo e título são obrigatórios' }, 400);
  }
  const slug = await uniqueSlug(b.title, async (s) => {
    const r = await c.env.DB.prepare(`SELECT 1 FROM posts WHERE slug = ?`).bind(s).first();
    return !!r;
  });

  const res = await c.env.DB.prepare(
    `INSERT INTO posts (slug, type, title, summary, body, location, event_date, cover_id, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      slug,
      b.type,
      b.title,
      b.summary ?? null,
      b.body ?? null,
      b.location ?? null,
      b.event_date || null,
      b.cover_id ?? null,
      b.published ? 1 : 0
    )
    .run();

  return c.json({ id: res.meta.last_row_id, slug }, 201);
});

adminRoutes.put('/posts/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<PostInput>().catch(() => ({}) as PostInput);
  const existing = await c.env.DB.prepare(`SELECT id FROM posts WHERE id = ?`).bind(id).first();
  if (!existing) return c.json({ error: 'Não encontrado' }, 404);

  await c.env.DB.prepare(
    `UPDATE posts SET
       title = COALESCE(?, title),
       summary = ?,
       body = ?,
       location = ?,
       event_date = ?,
       cover_id = ?,
       published = COALESCE(?, published),
       updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      b.title ?? null,
      b.summary ?? null,
      b.body ?? null,
      b.location ?? null,
      b.event_date || null,
      b.cover_id ?? null,
      b.published === undefined ? null : b.published ? 1 : 0,
      id
    )
    .run();

  return c.json({ ok: true });
});

adminRoutes.delete('/posts/:id', async (c) => {
  await c.env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(c.req.param('id')).run();
  return c.body(null, 204);
});

// ============================================================
// ALBUMS
// ============================================================
adminRoutes.get('/albums', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT a.*, cp.image_id AS cover_id,
            (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) AS photo_count
       FROM albums a
       LEFT JOIN photos cp ON cp.id = a.cover_photo_id
      ORDER BY COALESCE(a.event_date, a.created_at) DESC, a.id DESC`
  ).all();
  return c.json(results);
});

adminRoutes.get('/albums/:id', async (c) => {
  const id = c.req.param('id');
  const album = await c.env.DB.prepare(`SELECT * FROM albums WHERE id = ?`).bind(id).first();
  if (!album) return c.json({ error: 'Não encontrado' }, 404);
  const { results: photos } = await c.env.DB.prepare(
    `SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order, id`
  )
    .bind(id)
    .all();
  return c.json({ ...album, photos });
});

interface AlbumInput {
  title?: string;
  description?: string;
  event_date?: string;
  published?: boolean;
}

adminRoutes.post('/albums', async (c) => {
  const b = await c.req.json<AlbumInput>().catch(() => ({}) as AlbumInput);
  if (!b.title) return c.json({ error: 'Título é obrigatório' }, 400);
  const slug = await uniqueSlug(b.title, async (s) => {
    const r = await c.env.DB.prepare(`SELECT 1 FROM albums WHERE slug = ?`).bind(s).first();
    return !!r;
  });
  const res = await c.env.DB.prepare(
    `INSERT INTO albums (slug, title, description, event_date, published)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(slug, b.title, b.description ?? null, b.event_date || null, b.published ? 1 : 0)
    .run();
  return c.json({ id: res.meta.last_row_id, slug }, 201);
});

adminRoutes.put('/albums/:id', async (c) => {
  const id = c.req.param('id');
  type AlbumPut = AlbumInput & { cover_photo_id?: number };
  const b = await c.req.json<AlbumPut>().catch(() => ({}) as AlbumPut);
  await c.env.DB.prepare(
    `UPDATE albums SET
       title = COALESCE(?, title),
       description = ?,
       event_date = ?,
       cover_photo_id = COALESCE(?, cover_photo_id),
       published = COALESCE(?, published)
     WHERE id = ?`
  )
    .bind(
      b.title ?? null,
      b.description ?? null,
      b.event_date || null,
      b.cover_photo_id ?? null,
      b.published === undefined ? null : b.published ? 1 : 0,
      id
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/albums/:id', async (c) => {
  const id = c.req.param('id');
  // Remove as imagens do Cloudinary antes de apagar as linhas.
  const { results } = await c.env.DB.prepare(
    `SELECT image_id FROM photos WHERE album_id = ?`
  )
    .bind(id)
    .all<{ image_id: string }>();
  await Promise.all(results.map((p) => deleteImage(c.env, p.image_id)));
  await c.env.DB.prepare(`DELETE FROM albums WHERE id = ?`).bind(id).run();
  return c.body(null, 204);
});

// ============================================================
// PHOTOS — upload (multipart), legenda, ordem, exclusão
// ============================================================
adminRoutes.post('/albums/:id/photos', async (c) => {
  const albumId = c.req.param('id');
  const album = await c.env.DB.prepare(`SELECT id FROM albums WHERE id = ?`)
    .bind(albumId)
    .first();
  if (!album) return c.json({ error: 'Álbum não encontrado' }, 404);

  const form = await c.req.formData();
  const raw = form.getAll('files') as unknown as Array<File | string>;
  const files = raw.filter((f): f is File => typeof f !== 'string');
  if (files.length === 0) return c.json({ error: 'Nenhum arquivo enviado' }, 400);

  // Próxima posição de ordenação
  const last = await c.env.DB.prepare(
    `SELECT COALESCE(MAX(sort_order), 0) AS max FROM photos WHERE album_id = ?`
  )
    .bind(albumId)
    .first<{ max: number }>();
  let order = (last?.max ?? 0) + 1;

  const created: unknown[] = [];
  for (const file of files) {
    const { publicId, width, height } = await uploadImage(
      c.env,
      file,
      `capela/albums/${albumId}`
    );
    const res = await c.env.DB.prepare(
      `INSERT INTO photos (album_id, image_id, width, height, sort_order)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(albumId, publicId, width, height, order++)
      .run();
    created.push({ id: res.meta.last_row_id, image_id: publicId });
  }

  // Se o álbum ainda não tem capa (ou está órfã), usa a primeira foto.
  await c.env.DB.prepare(
    `UPDATE albums SET cover_photo_id = (
       SELECT id FROM photos WHERE album_id = ? ORDER BY sort_order, id LIMIT 1
     )
     WHERE id = ?
       AND (cover_photo_id IS NULL
            OR cover_photo_id NOT IN (SELECT id FROM photos WHERE album_id = ?))`
  )
    .bind(albumId, albumId, albumId)
    .run();

  return c.json({ uploaded: created.length, photos: created }, 201);
});

adminRoutes.put('/photos/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<{ caption?: string }>().catch(() => ({}) as { caption?: string });
  await c.env.DB.prepare(`UPDATE photos SET caption = ? WHERE id = ?`)
    .bind(b.caption ?? null, id)
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/photos/:id', async (c) => {
  const id = c.req.param('id');
  const photo = await c.env.DB.prepare(`SELECT image_id, album_id FROM photos WHERE id = ?`)
    .bind(id)
    .first<{ image_id: string; album_id: number }>();
  if (photo) await deleteImage(c.env, photo.image_id);
  await c.env.DB.prepare(`DELETE FROM photos WHERE id = ?`).bind(id).run();

  // Se a capa apontava para a foto removida (ou ficou órfã), reatribui à
  // primeira foto restante do álbum (ou NULL se não houver mais nenhuma).
  if (photo) {
    await c.env.DB.prepare(
      `UPDATE albums SET cover_photo_id = (
         SELECT id FROM photos WHERE album_id = ? ORDER BY sort_order, id LIMIT 1
       )
       WHERE id = ?
         AND (cover_photo_id IS NULL
              OR cover_photo_id NOT IN (SELECT id FROM photos WHERE album_id = ?))`
    )
      .bind(photo.album_id, photo.album_id, photo.album_id)
      .run();
  }
  return c.body(null, 204);
});

// Reordenar fotos: recebe { order: number[] } com IDs na nova sequência.
adminRoutes.put('/albums/:id/photos/order', async (c) => {
  const b = await c.req.json<{ order?: number[] }>().catch(() => ({}) as { order?: number[] });
  if (!Array.isArray(b.order)) return c.json({ error: 'order inválido' }, 400);
  const stmt = c.env.DB.prepare(`UPDATE photos SET sort_order = ? WHERE id = ?`);
  await c.env.DB.batch(b.order.map((photoId, i) => stmt.bind(i + 1, photoId)));
  return c.json({ ok: true });
});

// ============================================================
// SCHEDULE (programação)
// ============================================================
adminRoutes.get('/schedule', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM schedule ORDER BY sort_order, id`
  ).all();
  return c.json(results);
});

interface ScheduleInput {
  label?: string;
  day_of_week?: string;
  time?: string;
  note?: string;
  sort_order?: number;
  active?: boolean;
}

adminRoutes.post('/schedule', async (c) => {
  const b = await c.req.json<ScheduleInput>().catch(() => ({}) as ScheduleInput);
  if (!b.label || !b.day_of_week) {
    return c.json({ error: 'Atividade e dia são obrigatórios' }, 400);
  }
  const res = await c.env.DB.prepare(
    `INSERT INTO schedule (label, day_of_week, time, note, sort_order, active)
     VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(b.label, b.day_of_week, b.time ?? null, b.note ?? null, b.sort_order ?? 0, b.active === false ? 0 : 1)
    .run();
  return c.json({ id: res.meta.last_row_id }, 201);
});

adminRoutes.put('/schedule/:id', async (c) => {
  const id = c.req.param('id');
  const b = await c.req.json<ScheduleInput>().catch(() => ({}) as ScheduleInput);
  await c.env.DB.prepare(
    `UPDATE schedule SET
       label = COALESCE(?, label),
       day_of_week = COALESCE(?, day_of_week),
       time = ?,
       note = ?,
       sort_order = COALESCE(?, sort_order),
       active = COALESCE(?, active)
     WHERE id = ?`
  )
    .bind(
      b.label ?? null,
      b.day_of_week ?? null,
      b.time ?? null,
      b.note ?? null,
      b.sort_order ?? null,
      b.active === undefined ? null : b.active ? 1 : 0,
      id
    )
    .run();
  return c.json({ ok: true });
});

adminRoutes.delete('/schedule/:id', async (c) => {
  await c.env.DB.prepare(`DELETE FROM schedule WHERE id = ?`).bind(c.req.param('id')).run();
  return c.body(null, 204);
});

// ============================================================
// SETTINGS
// ============================================================
adminRoutes.put('/settings', async (c) => {
  const b = await c.req.json<Record<string, string>>().catch(() => ({}));
  const stmt = c.env.DB.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  );
  const entries = Object.entries(b);
  if (entries.length) {
    await c.env.DB.batch(entries.map(([k, v]) => stmt.bind(k, String(v))));
  }
  return c.json({ ok: true });
});
