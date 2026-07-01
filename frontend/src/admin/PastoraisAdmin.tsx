import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import { api, imgUrl } from '../lib/api';
import type { Pastoral } from '../types';
import type { IconName } from '../components/Icon/Icon';
import { Icon } from '../components/Icon/Icon';
import ui from './admin-ui.module.css';

export default function PastoraisAdmin() {
  useSeo({ title: 'Pastorais' });
  const { data, loading, error } = useFetch<Pastoral[]>('/admin/pastorais', []);
  const [items, setItems] = useState<Pastoral[] | null>(null);
  const pastorais = items ?? data ?? [];

  // Sincroniza o estado local assim que os dados chegam (permite reordenar sem novo fetch)
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  async function handleDelete(p: Pastoral) {
    if (
      !confirm(
        `Excluir a pastoral "${p.nome}" e todas as suas fotos? Esta ação não pode ser desfeita.`
      )
    )
      return;
    await api.del(`/admin/pastorais/${p.id}`);
    setItems((s) => (s ?? []).filter((x) => x.id !== p.id));
  }

  async function move(index: number, dir: -1 | 1) {
    const list = [...pastorais];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setItems(list);
    // Persiste a nova ordem (1-based) dos dois itens trocados.
    await Promise.all([
      api.put(`/admin/pastorais/${list[index].id}`, { sort_order: index + 1 }),
      api.put(`/admin/pastorais/${list[target].id}`, { sort_order: target + 1 }),
    ]);
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>Pastorais</h1>
          <p>Crie, edite e organize as pastorais exibidas no site.</p>
        </div>
        <Link to="/admin/pastorais/novo" className={ui.btnPrimary}>
          <Icon name="heart" size={18} /> Nova pastoral
        </Link>
      </div>

      {loading ? (
        <p className={ui.empty}>Carregando…</p>
      ) : error ? (
        <div className={ui.empty}>Erro ao carregar pastorais.</div>
      ) : pastorais.length === 0 ? (
        <div className={ui.empty}>Nenhuma pastoral cadastrada ainda.</div>
      ) : (
        <div className={ui.list}>
          {pastorais.map((p, i) => (
            <div key={p.id} className={ui.item}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className={ui.btnGhost}
                  style={{ padding: 4 }}
                  aria-label="Mover para cima"
                >
                  <Icon name="chevronLeft" size={14} style={{ transform: 'rotate(90deg)' }} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === pastorais.length - 1}
                  className={ui.btnGhost}
                  style={{ padding: 4 }}
                  aria-label="Mover para baixo"
                >
                  <Icon name="chevronRight" size={14} style={{ transform: 'rotate(90deg)' }} />
                </button>
              </div>

              {p.cover_id ? (
                <img src={imgUrl(p.cover_id, 128)} alt="" className={ui.itemThumb} />
              ) : (
                <div className={ui.itemThumb} style={{ display: 'grid', placeItems: 'center' }}>
                  <Icon name={p.icon as IconName} size={22} />
                </div>
              )}

              <div className={ui.itemBody}>
                <h3>{p.nome}</h3>
                <p>
                  {p.photo_count ?? 0} foto
                  {(p.photo_count ?? 0) === 1 ? '' : 's'}
                </p>
              </div>
              <span className={`${ui.badge} ${p.published ? ui.badgePublished : ui.badgeDraft}`}>
                {p.published ? 'Publicada' : 'Oculta'}
              </span>
              <div className={ui.itemActions}>
                <Link to={`/admin/pastorais/${p.id}`} className={ui.btnGhost}>
                  Editar
                </Link>
                <button onClick={() => handleDelete(p)} className={ui.btnDanger}>
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
