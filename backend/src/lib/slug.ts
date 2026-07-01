/** Gera um slug amigável a partir de um texto (remove acentos, espaços → hífens). */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // remove acentos (combining marks)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

/** Garante unicidade do slug consultando uma função de existência. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || 'item';
  let slug = root;
  let n = 2;
  while (await exists(slug)) {
    slug = `${root}-${n++}`;
  }
  return slug;
}
