import { useState, useEffect, type FormEvent } from 'react';
import { api } from '../lib/api';
import { useSeo } from '../hooks/useSeo';
import ui from './admin-ui.module.css';

type Settings = Record<string, string>;

const FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: 'telefone', label: 'Telefone', placeholder: '(43) 3523-2816' },
  { key: 'whatsapp', label: 'WhatsApp (só números, com DDD)', placeholder: '5543999999999' },
  { key: 'endereco', label: 'Endereço', placeholder: 'Av. Gralha Azul, 25…' },
  { key: 'instagram', label: 'Instagram (link)', placeholder: 'https://instagram.com/…' },
  { key: 'facebook', label: 'Facebook (link)', placeholder: 'https://facebook.com/…' },
];

export default function SettingsAdmin() {
  useSeo({ title: 'Configurações' });
  const [values, setValues] = useState<Settings>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<Settings>('/settings').then(setValues);
  }, []);

  function update(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/admin/settings', values);
      setSaved(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>Configurações</h1>
          <p>Contatos e redes sociais exibidos no site.</p>
        </div>
      </div>

      <form className={`${ui.card} ${ui.form}`} onSubmit={handleSubmit}>
        {FIELDS.map((f) => (
          <div key={f.key} className={ui.field}>
            <label>{f.label}</label>
            <input
              value={values[f.key] ?? ''}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder={f.placeholder}
            />
          </div>
        ))}

        <div className={ui.actions}>
          <button type="submit" className={ui.btnPrimary} disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar configurações'}
          </button>
          {saved && <span style={{ color: '#15803d', alignSelf: 'center' }}>✓ Salvo!</span>}
        </div>
      </form>
    </div>
  );
}
