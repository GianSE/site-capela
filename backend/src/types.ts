/**
 * Bindings do ambiente Cloudflare Worker.
 * Mapeiam para o que está declarado em wrangler.toml.
 */
export interface Env {
  DB: D1Database;
  FOTOS: R2Bucket;
  ASSETS: Fetcher;
  JWT_SECRET: string;
  APP_ENV: string;
}

/** Payload do token de sessão do admin. */
export interface SessionPayload {
  sub: number; // id do admin_user
  email: string;
  name: string;
  exp: number; // epoch seconds
}

/** Variáveis injetadas no contexto Hono após autenticação. */
export interface Variables {
  user: SessionPayload;
}
