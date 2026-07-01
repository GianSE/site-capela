import { AwsClient } from 'aws4fetch';
import type { Env } from '../types';

/**
 * Backblaze B2 via API S3-compatível (assinatura SigV4 com aws4fetch).
 * Grátis: 10 GB de storage; egress para a Cloudflare é grátis (Bandwidth Alliance).
 *
 * Config (wrangler.toml [vars] + secret):
 *   B2_ENDPOINT   ex.: https://s3.us-east-005.backblazeb2.com   (var)
 *   B2_REGION     ex.: us-east-005                              (var)
 *   B2_BUCKET     nome do bucket                                (var)
 *   B2_KEY_ID     applicationKeyId                              (var — não é segredo forte)
 *   B2_APP_KEY    applicationKey                                (secret)
 *
 * Convenção de chaves: cada imagem gera DUAS variantes no B2:
 *   {base}_thumb.jpg  (grids/listas)   e   {base}_full.jpg  (lightbox/detalhe)
 * O D1 guarda só a `base`; o frontend pede a variante via imgUrl(base, 'thumb'|'full').
 */

function client(env: Env): AwsClient {
  return new AwsClient({
    accessKeyId: env.B2_KEY_ID,
    secretAccessKey: env.B2_APP_KEY,
    region: env.B2_REGION,
    service: 's3',
  });
}

function objectUrl(env: Env, key: string): string {
  return `${env.B2_ENDPOINT}/${env.B2_BUCKET}/${key}`;
}

/** Envia um objeto ao B2 (PUT assinado). */
export async function putObject(
  env: Env,
  key: string,
  body: ArrayBuffer,
  contentType: string
): Promise<void> {
  const aws = client(env);
  const res = await aws.fetch(objectUrl(env, key), {
    method: 'PUT',
    body,
    headers: { 'Content-Type': contentType },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`B2 PUT falhou (${res.status}): ${text.slice(0, 200)}`);
  }
}

/** Remove um objeto do B2 (DELETE assinado). Ignora 404. */
export async function deleteObject(env: Env, key: string): Promise<void> {
  const aws = client(env);
  await aws
    .fetch(objectUrl(env, key), { method: 'DELETE' })
    .catch(() => {
      /* falha ao apagar não deve travar a operação no banco */
    });
}

/**
 * Busca um objeto do B2 (GET assinado) para servir ao usuário.
 * Usado pela rota /api/img — a resposta é cacheada na borda da Cloudflare.
 */
export async function getObject(env: Env, key: string): Promise<Response> {
  const aws = client(env);
  return aws.fetch(objectUrl(env, key), { method: 'GET' });
}

/** Nomes das duas variantes a partir da base. */
export function variantKey(base: string, variant: 'thumb' | 'full'): string {
  return `${base}_${variant}.jpg`;
}
