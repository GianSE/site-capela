import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import { useFetch } from '../hooks/useFetch';
import type { Album } from '../types';
import { ALBUM_CATEGORIES } from '../data/albumCategories';
import { PageHero } from '../components/PageHero/PageHero';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import { imgUrl } from '../lib/api';
import { formatEventDate } from '../lib/format';
import styles from './GaleriaPage.module.css';

export default function GaleriaPage() {
  useSeo({
    title: 'Galeria',
    description:
      'Galeria de fotos da Capela Nossa Senhora de Fátima. Reviva os momentos de fé e união da nossa comunidade.',
  });

  const { data, loading } = useFetch<Album[]>('/albums', []);
  const albuns = useMemo(() => (data ?? []).filter((a) => a.published), [data]);
  const [filter, setFilter] = useState<string>('todas');

  // Só mostra as categorias que realmente têm álbuns
  const categoriasPresentes = useMemo(() => {
    const set = new Set(albuns.map((a) => a.category));
    return ALBUM_CATEGORIES.filter((c) => set.has(c.value));
  }, [albuns]);

  const visiveis = filter === 'todas' ? albuns : albuns.filter((a) => a.category === filter);
  const mostrarFiltros = categoriasPresentes.length > 1;

  return (
    <>
      <PageHero
        eyebrow="Memórias da comunidade"
        title="Galeria de Fotos"
        subtitle="Momentos de fé, festa e união registrados em nossa capela."
      />

      <section className={`container ${styles.section}`}>
        {loading ? (
          <Loader />
        ) : albuns.length === 0 ? (
          <EmptyState
            icon="image"
            title="Ainda não há álbuns"
            message="Em breve compartilharemos as fotos dos nossos eventos e celebrações."
          />
        ) : (
          <>
            {mostrarFiltros && (
              <div className={styles.filters}>
                <button
                  className={`${styles.filterBtn} ${filter === 'todas' ? styles.active : ''}`}
                  onClick={() => setFilter('todas')}
                >
                  Todas
                </button>
                {categoriasPresentes.map((c) => (
                  <button
                    key={c.value}
                    className={`${styles.filterBtn} ${filter === c.value ? styles.active : ''}`}
                    onClick={() => setFilter(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.grid}>
              {visiveis.map((a) => (
                <Link key={a.id} to={`/galeria/${a.slug}`} className={styles.card}>
                  <div
                    className={styles.imageWrap}
                    style={
                      a.cover_id
                        ? ({ '--cover': `url("${imgUrl(a.cover_id, 200)}")` } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {a.cover_id ? (
                      <img src={imgUrl(a.cover_id, 600)} alt={a.title} loading="lazy" />
                    ) : (
                      <div className={styles.placeholder}>
                        <Icon name="image" size={32} />
                      </div>
                    )}
                    <span className={styles.count}>
                      <Icon name="image" size={14} /> {a.photo_count}
                    </span>
                  </div>
                  <div className={styles.body}>
                    <h3>{a.title}</h3>
                    {a.event_date && (
                      <span className={styles.date}>{formatEventDate(a.event_date)}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
