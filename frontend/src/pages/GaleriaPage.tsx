import { Link } from 'react-router-dom';
import { useSeo } from '../hooks/useSeo';
import { useFetch } from '../hooks/useFetch';
import type { Album } from '../types';
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
  const albuns = (data ?? []).filter((a) => a.published);

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
          <div className={styles.grid}>
            {albuns.map((a) => (
              <Link key={a.id} to={`/galeria/${a.slug}`} className={styles.card}>
                <div className={styles.imageWrap}>
                  {a.cover_id ? (
                    <img src={imgUrl(a.cover_id, 'thumb')} alt={a.title} loading="lazy" />
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
        )}
      </section>
    </>
  );
}
