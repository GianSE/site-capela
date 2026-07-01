import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useSeo } from '../hooks/useSeo';
import type { ScheduleItem } from '../types';
import { Icon } from '../components/Icon/Icon';
import ui from './admin-ui.module.css';
import styles from './ScheduleAdmin.module.css';

const DIAS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export default function ScheduleAdmin() {
  useSeo({ title: 'Programação' });
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulário de novo item
  const [label, setLabel] = useState('');
  const [day, setDay] = useState('Sábado');
  const [time, setTime] = useState('');

  async function reload() {
    const data = await api.get<ScheduleItem[]>('/admin/schedule');
    setItems(data);
    setLoading(false);
  }
  useEffect(() => {
    reload();
  }, []);

  async function addItem() {
    if (!label.trim()) return;
    await api.post('/admin/schedule', {
      label,
      day_of_week: day,
      time: time || null,
      sort_order: items.length + 1,
      active: true,
    });
    setLabel('');
    setTime('');
    reload();
  }

  async function remove(id: number) {
    if (!confirm('Remover esta atividade da programação?')) return;
    await api.del(`/admin/schedule/${id}`);
    setItems((s) => s.filter((i) => i.id !== id));
  }

  async function toggleActive(item: ScheduleItem) {
    await api.put(`/admin/schedule/${item.id}`, { active: !item.active });
    setItems((s) => s.map((i) => (i.id === item.id ? { ...i, active: i.active ? 0 : 1 } : i)));
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>Programação da Semana</h1>
          <p>Estas atividades aparecem na página inicial do site.</p>
        </div>
      </div>

      <div className={`${ui.card} ${styles.addForm}`}>
        <div className={ui.field}>
          <label>Atividade</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex.: Santa Missa"
          />
        </div>
        <div className={ui.field}>
          <label>Dia</label>
          <select value={day} onChange={(e) => setDay(e.target.value)}>
            {DIAS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className={ui.field}>
          <label>Horário</label>
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Ex.: 19h30"
          />
        </div>
        <button onClick={addItem} className={ui.btnPrimary}>
          <Icon name="calendar" size={18} /> Adicionar
        </button>
      </div>

      {loading ? (
        <p className={ui.empty}>Carregando…</p>
      ) : (
        <div className={ui.list} style={{ marginTop: 'var(--space-5)' }}>
          {items.map((item) => (
            <div key={item.id} className={ui.item}>
              <div className={ui.itemBody}>
                <h3 style={{ opacity: item.active ? 1 : 0.5 }}>{item.label}</h3>
                <p>
                  {item.day_of_week}
                  {item.time ? ` · ${item.time}` : ''}
                </p>
              </div>
              <div className={ui.itemActions}>
                <button onClick={() => toggleActive(item)} className={ui.btnGhost}>
                  {item.active ? 'Ocultar' : 'Mostrar'}
                </button>
                <button onClick={() => remove(item.id)} className={ui.btnDanger}>
                  <Icon name="close" size={16} /> Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
