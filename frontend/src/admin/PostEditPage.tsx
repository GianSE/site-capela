import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useSeo } from '../hooks/useSeo';
import type { Post, PostType } from '../types';
import { ImageUploadField } from './ImageUploadField';
import { Icon } from '../components/Icon/Icon';
import ui from './admin-ui.module.css';

export function PostEditPage({ type }: { type: PostType }) {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'novo';
  const navigate = useNavigate();
  const label = type === 'evento' ? 'Evento' : 'Aviso';
  const base = `/admin/${type === 'evento' ? 'eventos' : 'avisos'}`;
  useSeo({ title: isNew ? `Novo ${label}` : `Editar ${label}` });

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [published, setPublished] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isNew) return;
    api.get<Post>(`/admin/posts/${id}`).then((p) => {
      setTitle(p.title);
      setSummary(p.summary ?? '');
      setBody(p.body ?? '');
      setLocation(p.location ?? '');
      setEventDate(p.event_date ? p.event_date.slice(0, 10) : '');
      setCoverKey(p.cover_key);
      setPublished(!!p.published);
    });
  }, [id, isNew]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = {
      type,
      title,
      summary: summary || null,
      body: body || null,
      location: location || null,
      event_date: eventDate || null,
      cover_key: coverKey,
      published,
    };
    try {
      if (isNew) await api.post('/admin/posts', payload);
      else await api.put(`/admin/posts/${id}`, payload);
      navigate(base);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>{isNew ? `Novo ${label}` : `Editar ${label}`}</h1>
        </div>
        <button onClick={() => navigate(base)} className={ui.btnGhost}>
          <Icon name="chevronLeft" size={18} /> Voltar
        </button>
      </div>

      {error && <div className={ui.empty} style={{ color: '#b91c1c' }}>{error}</div>}

      <form className={`${ui.card} ${ui.form}`} onSubmit={handleSubmit}>
        <div className={ui.field}>
          <label>Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className={ui.row}>
          <div className={ui.field}>
            <label>{type === 'evento' ? 'Data do evento' : 'Data'}</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <div className={ui.field}>
            <label>Local</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex.: Salão da capela"
            />
          </div>
        </div>

        <div className={ui.field}>
          <label>Resumo (aparece nos cards)</label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Uma frase curta de destaque"
          />
        </div>

        <div className={ui.field}>
          <label>Descrição completa</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva os detalhes. Pule linha para separar parágrafos."
            rows={8}
          />
        </div>

        <ImageUploadField value={coverKey} onChange={setCoverKey} />

        <label className={ui.checkbox}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publicar (visível no site)
        </label>

        <div className={ui.actions}>
          <button type="submit" className={ui.btnPrimary} disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
