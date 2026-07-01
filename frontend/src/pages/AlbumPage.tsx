import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import type { AlbumWithPhotos } from '../types';
import { Loader } from '../components/Loader/Loader';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Icon } from '../components/Icon/Icon';
import { imgUrl } from '../lib/api';
import { formatEventDate } from '../lib/format';
import styles from './AlbumPage.module.css';

export default function AlbumPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: album, loading } = useFetch<AlbumWithPhotos>(slug ? `/albums/${slug}` : null);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useSeo({ title: album?.title, description: album?.description ?? undefined });

  const photos = album?.photos ?? [];
  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () => setLightbox((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setLightbox((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, close, prev, next]);

  if (loading) return <Loader />;

  if (!album) {
    return (
      <div className="container">
        <EmptyState
          icon="image"
          title="Álbum não encontrado"
          message="Este álbum pode ter sido removido ou o endereço está incorreto."
        />
      </div>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <div className="container">
          <Link to="/galeria" className={styles.back}>
            <Icon name="chevronLeft" size={18} /> Galeria
          </Link>
          <h1>{album.title}</h1>
          {album.event_date && (
            <span className={styles.date}>{formatEventDate(album.event_date)}</span>
          )}
          {album.description && <p className={styles.desc}>{album.description}</p>}
        </div>
      </header>

      <section className={`container ${styles.section}`}>
        {photos.length === 0 ? (
          <EmptyState icon="image" title="Este álbum ainda não tem fotos" />
        ) : (
          <div className={styles.masonry}>
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                className={styles.thumb}
                onClick={() => setLightbox(i)}
                aria-label={`Abrir foto ${i + 1}`}
              >
                <img
                  src={imgUrl(photo.image_id)}
                  alt={photo.caption ?? `Foto ${i + 1}`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {lightbox !== null && photos[lightbox] && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <button className={styles.lbClose} onClick={close} aria-label="Fechar">
              <Icon name="close" size={28} />
            </button>
            {photos.length > 1 && (
              <button
                className={`${styles.lbNav} ${styles.lbPrev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Foto anterior"
              >
                <Icon name="chevronLeft" size={32} />
              </button>
            )}
            <motion.figure
              className={styles.lbFigure}
              key={photos[lightbox].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imgUrl(photos[lightbox].image_id)}
                alt={photos[lightbox].caption ?? `Foto ${lightbox + 1}`}
              />
              {photos[lightbox].caption && (
                <figcaption>{photos[lightbox].caption}</figcaption>
              )}
              <span className={styles.lbCounter}>
                {lightbox + 1} / {photos.length}
              </span>
            </motion.figure>
            {photos.length > 1 && (
              <button
                className={`${styles.lbNav} ${styles.lbNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Próxima foto"
              >
                <Icon name="chevronRight" size={32} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
