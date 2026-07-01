/**
 * Comprime/redimensiona imagens no navegador antes do upload.
 * Reduz o consumo de dados móveis e o espaço no R2, mantendo boa qualidade.
 */

const MAX_DIMENSION = 1920;
const QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  // Não mexe em formatos que não são raster comuns (ex.: já otimizados, gif animado)
  if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

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

  // Se a compressão não ajudou, mantém o original.
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
}

export async function compressMany(
  files: File[],
  onProgress?: (done: number, total: number) => void
): Promise<File[]> {
  const out: File[] = [];
  for (let i = 0; i < files.length; i++) {
    out.push(await compressImage(files[i]));
    onProgress?.(i + 1, files.length);
  }
  return out;
}
