import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import { api, imgUrl } from '../lib/api';
import type { Post, PostType } from '../types';
import { Icon } from '../components/Icon/Icon';
import { formatShortDate } from '../lib/format';
import ui from './admin-ui.module.css';

export function PostsListPage({ type }: { type: PostType }) {
  const label = type === 'evento' ? 'Eventos' : 'Avisos';
  useSeo({ title: label });
  const { data, loading } = useFetch<Post[]>('/admin/posts', []);
  const [removed, setRemoved] = useState<Set<number>>(new Set());

  const posts = (data ?? []).filter((p) => p.type === type && !removed.has(p.id));
  const base = `/admin/${type === 'evento' ? 'eventos' : 'avisos'}`;

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return;
    await api.del(`/admin/posts/${id}`);
    setRemoved((s) => new Set(s).add(id));
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>{label}</h1>
          <p>Crie, edite e publique {label.toLowerCase()} da capela.</p>
        </div>
        <Link to={`${base}/novo`} className={ui.btnPrimary}>
          <Icon name={type === 'evento' ? 'calendar' : 'broadcast'} size={18} /> Novo
        </Link>
      </div>

      {loading ? (
        <p className={ui.empty}>Carregando…</p>
      ) : posts.length === 0 ? (
        <div className={ui.empty}>Nenhum {type} cadastrado ainda.</div>
      ) : (
        <div className={ui.list}>
          {posts.map((p) => (
            <div key={p.id} className={ui.item}>
              {p.cover_id ? (
                <img src={imgUrl(p.cover_id)} alt="" className={ui.itemThumb} />
              ) : (
                <div className={ui.itemThumb} />
              )}
              <div className={ui.itemBody}>
                <h3>{p.title}</h3>
                <p>
                  {p.event_date ? formatShortDate(p.event_date) : '—'}
                  {p.location ? ` · ${p.location}` : ''}
                </p>
              </div>
              <span className={`${ui.badge} ${p.published ? ui.badgePublished : ui.badgeDraft}`}>
                {p.published ? 'Publicado' : 'Rascunho'}
              </span>
              <div className={ui.itemActions}>
                <Link to={`${base}/${p.id}`} className={ui.btnGhost}>
                  Editar
                </Link>
                <button onClick={() => handleDelete(p.id, p.title)} className={ui.btnDanger}>
                  <Icon name="close" size={16} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
