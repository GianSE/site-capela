/**
 * Bindings do ambiente Cloudflare Worker.
 * Mapeiam para o que está declarado em wrangler.toml.
 */
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  JWT_SECRET: string;
  APP_ENV: string;
  // Backblaze B2 (S3-compatível)
  B2_ENDPOINT: string;
  B2_REGION: string;
  B2_BUCKET: string;
  B2_KEY_ID: string;
  B2_APP_KEY: string;
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
