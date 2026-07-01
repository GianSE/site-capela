import type { ScheduleItem } from '../types';

/**
 * Programação padrão da semana (fallback).
 * A API (/api/schedule) sobrepõe estes valores quando disponível;
 * o admin pode editá-los pelo painel.
 */
export const HORARIOS_PADRAO: ScheduleItem[] = [
  {
    id: -1,
    label: 'Santa Missa',
    day_of_week: 'Sábado',
    time: '19h30',
    note: null,
    sort_order: 1,
    active: 1,
  },
  {
    id: -2,
    label: 'Legião de Maria',
    day_of_week: 'Terça-feira',
    time: '15h00',
    note: null,
    sort_order: 2,
    active: 1,
  },
  {
    id: -3,
    label: 'Reunião Pastoral Social',
    day_of_week: 'Terça-feira',
    time: '19h30',
    note: null,
    sort_order: 3,
    active: 1,
  },
  {
    id: -4,
    label: 'Adoração ao Santíssimo',
    day_of_week: 'Quinta-feira',
    time: null,
    note: null,
    sort_order: 4,
    active: 1,
  },
];
