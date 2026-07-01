/** Categorias de álbuns da galeria. */
export const ALBUM_CATEGORIES = [
  { value: 'missas', label: 'Missas' },
  { value: 'mutiroes', label: 'Mutirões' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'outros', label: 'Outros' },
] as const;

export type AlbumCategory = (typeof ALBUM_CATEGORIES)[number]['value'];

export function categoryLabel(value: string): string {
  return ALBUM_CATEGORIES.find((c) => c.value === value)?.label ?? 'Outros';
}
