import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import { api, imgUrl } from '../lib/api';
import type { Album } from '../types';
import { Icon } from '../components/Icon/Icon';
import { formatShortDate } from '../lib/format';
import ui from './admin-ui.module.css';

export default function AlbumsListPage() {
  useSeo({ title: 'Galeria' });
  const { data, loading } = useFetch<Album[]>('/admin/albums', []);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const albums = (data ?? []).filter((a) => !removed.has(a.id));

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Excluir o álbum "${title}" e todas as suas fotos? Esta ação não pode ser desfeita.`))
      return;
    await api.del(`/admin/albums/${id}`);
    setRemoved((s) => new Set(s).add(id));
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>Galeria de Fotos</h1>
          <p>Crie álbuns e adicione fotos dos eventos e celebrações.</p>
        </div>
        <Link to="/admin/galeria/novo" className={ui.btnPrimary}>
          <Icon name="image" size={18} /> Novo álbum
        </Link>
      </div>

      {loading ? (
        <p className={ui.empty}>Carregando…</p>
      ) : albums.length === 0 ? (
        <div className={ui.empty}>Nenhum álbum ainda. Crie o primeiro!</div>
      ) : (
        <div className={ui.list}>
          {albums.map((a) => (
            <div key={a.id} className={ui.item}>
              {a.cover_id ? (
                <img src={imgUrl(a.cover_id, 'thumb')} alt="" className={ui.itemThumb} />
              ) : (
                <div className={ui.itemThumb} />
              )}
              <div className={ui.itemBody}>
                <h3>{a.title}</h3>
                <p>
                  {a.photo_count} foto{a.photo_count === 1 ? '' : 's'}
                  {a.event_date ? ` · ${formatShortDate(a.event_date)}` : ''}
                </p>
              </div>
              <span className={`${ui.badge} ${a.published ? ui.badgePublished : ui.badgeDraft}`}>
                {a.published ? 'Publicado' : 'Rascunho'}
              </span>
              <div className={ui.itemActions}>
                <Link to={`/admin/galeria/${a.id}`} className={ui.btnGhost}>
                  Abrir
                </Link>
                <button onClick={() => handleDelete(a.id, a.title)} className={ui.btnDanger}>
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
