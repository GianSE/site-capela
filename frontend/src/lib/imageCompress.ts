/**
 * Redimensiona imagens no navegador antes do upload.
 * Gera 2 variantes por foto: `thumb` (grids/listas) e `full` (lightbox/detalhe).
 * Assim as fotos são pré-dimensionadas na origem — nada de transformar por view.
 */

const FULL_MAX = 1600;
const THUMB_MAX = 500;
const QUALITY = 0.82;

export interface Variants {
  thumb: File;
  full: File;
}

/** Redimensiona um File para no máximo `maxDim` (lado maior) em JPEG. */
async function resize(file: File, maxDim: number): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALITY)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}

/** Gera as variantes thumb + full de uma imagem. */
export async function makeVariants(file: File): Promise<Variants> {
  const [full, thumb] = await Promise.all([resize(file, FULL_MAX), resize(file, THUMB_MAX)]);
  return { thumb, full };
}
