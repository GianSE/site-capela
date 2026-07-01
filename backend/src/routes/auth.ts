import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import type { Env, Variables } from '../types';
import { verifyPassword, signJwt } from '../lib/crypto';
import { requireAuth, COOKIE_NAME } from '../middleware/auth';

export const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const SESSION_DAYS = 7;

authRoutes.post('/login', async (c) => {
  const body = await c.req
    .json<{ email?: string; password?: string }>()
    .catch(() => ({}) as { email?: string; password?: string });
  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';

  if (!email || !password) {
    return c.json({ error: 'Informe e-mail e senha' }, 400);
  }

  const user = await c.env.DB.prepare(
    `SELECT id, email, name, password_hash FROM admin_users WHERE email = ?`
  )
    .bind(email)
    .first<{ id: number; email: string; name: string; password_hash: string }>();

  // Mensagem genérica para não revelar se o e-mail existe.
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return c.json({ error: 'E-mail ou senha inválidos' }, 401);
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const token = await signJwt(
    { sub: user.id, email: user.email, name: user.name, exp },
    c.env.JWT_SECRET
  );

  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: c.env.APP_ENV !== 'development',
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });

  return c.json({ id: user.id, email: user.email, name: user.name });
});

authRoutes.post('/logout', (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json({ ok: true });
});

authRoutes.get('/me', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ id: user.sub, email: user.email, name: user.name });
});
