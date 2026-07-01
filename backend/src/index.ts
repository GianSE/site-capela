import { Hono } from 'hono';
import type { Env, Variables } from './types';
import { publicRoutes } from './routes/public';
import { authRoutes } from './routes/auth';
import { adminRoutes } from './routes/admin';

/**
 * Worker da Capela N. S. de Fátima.
 *  - API REST sob /api/* (Hono)
 *  - O frontend estático (SPA) é servido pelo binding [assets].
 *    Requests que não casam com /api/* e não são arquivos caem no index.html
 *    (not_found_handling = single-page-application).
 */
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'capela-fatima', env: c.env.APP_ENV ?? 'unknown' })
);

app.route('/api/auth', authRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api', publicRoutes);

// Rotas de API inexistentes → 404 JSON (não devolve HTML).
app.all('/api/*', (c) => c.json({ error: 'Rota não encontrada' }, 404));

// SPA fallback: qualquer outra rota (ex.: /admin, /galeria) entrega o index.html
// para o React Router assumir no cliente. Sem isso, o acesso direto dá 404.
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

// Erros não tratados → JSON consistente.
app.onError((err, c) => {
  console.error('Erro não tratado:', err);
  return c.json({ error: 'Erro interno do servidor' }, 500);
});

export default app;
