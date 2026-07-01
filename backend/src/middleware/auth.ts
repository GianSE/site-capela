import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import type { Env, Variables } from '../types';
import { verifyJwt } from '../lib/crypto';

export const COOKIE_NAME = 'capela_session';

/** Middleware que exige sessão válida; injeta o usuário no contexto. */
export const requireAuth: MiddlewareHandler<{
  Bindings: Env;
  Variables: Variables;
}> = async (c, next) => {
  const token = getCookie(c, COOKIE_NAME);
  if (!token) return c.json({ error: 'Não autenticado' }, 401);

  const payload = await verifyJwt(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Sessão expirada' }, 401);

  c.set('user', payload);
  await next();
};
