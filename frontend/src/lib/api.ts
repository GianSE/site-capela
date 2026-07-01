/**
 * Cliente de API minimalista.
 * Em dev o Vite faz proxy de /api → Worker (porta 8787).
 * Em produção, mesma origem (o Worker serve o frontend e a API).
 */

const BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) msg = data.error;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new ApiError(msg, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/**
 * URL de uma imagem servida pelo Worker (proxy do B2 + cache da Cloudflare).
 * `base` é a chave guardada no D1; `variant` escolhe o tamanho pré-gerado no upload.
 *   'thumb' → grids e listas   ·   'full' → lightbox e páginas de detalhe
 */
export function imgUrl(base: string, variant: 'thumb' | 'full' = 'full'): string {
  return `${BASE}/img/${base}_${variant}.jpg`;
}
