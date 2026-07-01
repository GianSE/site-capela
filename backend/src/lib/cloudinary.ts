import type { Env } from '../types';

/**
 * Integração com o Cloudinary (armazenamento e entrega de imagens).
 * Grátis, sem cartão. Usa upload/exclusão assinados (assinatura SHA-1 no Worker).
 *
 * Vars necessárias (wrangler.toml + secret):
 *   CLOUDINARY_CLOUD_NAME   (var)
 *   CLOUDINARY_API_KEY      (var)
 *   CLOUDINARY_API_SECRET   (secret)
 */

export interface UploadedImage {
  publicId: string;
  width: number | null;
  height: number | null;
}

/** Assina os parâmetros conforme especificação do Cloudinary (SHA-1). */
async function sign(params: Record<string, string>, apiSecret: string): Promise<string> {
  // Ordena por chave, monta "k=v&k2=v2" e concatena o api_secret ao final.
  const toSign =
    Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&') + apiSecret;

  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(toSign));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Faz upload de uma imagem para o Cloudinary e devolve o public_id. */
export async function uploadImage(
  env: Env,
  file: File,
  folder: string
): Promise<UploadedImage> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signParams = { folder, timestamp };
  const signature = await sign(signParams, env.CLOUDINARY_API_SECRET);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', env.CLOUDINARY_API_KEY);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload falhou (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    public_id: string;
    width?: number;
    height?: number;
  };
  return { publicId: data.public_id, width: data.width ?? null, height: data.height ?? null };
}

/** Remove uma imagem do Cloudinary pelo public_id. */
export async function deleteImage(env: Env, publicId: string): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = await sign({ public_id: publicId, timestamp }, env.CLOUDINARY_API_SECRET);

  const form = new FormData();
  form.append('public_id', publicId);
  form.append('api_key', env.CLOUDINARY_API_KEY);
  form.append('timestamp', timestamp);
  form.append('signature', signature);

  await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
    method: 'POST',
    body: form,
  }).catch(() => {
    /* falha ao apagar no Cloudinary não deve travar a operação no banco */
  });
}
