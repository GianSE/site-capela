const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "2025-05-09" → "09 de maio de 2025" */
export function formatEventDate(iso: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  return `${String(d.getDate()).padStart(2, '0')} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/** "2025-05-09" → "09/05/2025" */
export function formatShortDate(iso: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  return d.toLocaleDateString('pt-BR');
}

/** Aceita uma data ISO (com ou sem hora) e devolve Date local sem deslocamento de fuso. */
function parseDate(iso: string): Date | null {
  if (!iso) return null;
  const datePart = iso.slice(0, 10);
  const [y, m, day] = datePart.split('-').map(Number);
  if (!y || !m || !day) return null;
  return new Date(y, m - 1, day);
}

/** Indica se uma data já passou (comparando só o dia). */
export function isPast(iso: string): boolean {
  const d = parseDate(iso);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}
