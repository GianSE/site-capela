import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import { PageHero } from '../components/PageHero/PageHero';
import { Loader } from '../components/Loader/Loader';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Icon } from '../components/Icon/Icon';
import type { IconName } from '../components/Icon/Icon';
import { CAPELA } from '../data/site';
import { imgUrl } from '../lib/api';
import type { Pastoral } from '../types';
import styles from './PastoraisPage.module.css';

export default function PastoraisPage() {
  useSeo({
    title: 'Pastorais',
    description:
      'Conheça as pastorais da Capela Nossa Senhora de Fátima e as equipes que dão vida à nossa comunidade: Catequese, Liturgia, Legião de Maria, Música, Social e muito mais.',
  });

  const { data, loading } = useFetch<Pastoral[]>('/pastorais', []);
  const pastorais = data ?? [];

  // Lightbox: fotos da pastoral aberta + índice atual
  const [lb, setLb] = useState<{ photos: string[]; i: number; nome: string } | null>(null);

  const close = useCallback(() => setLb(null), []);
  const prev = useCallback(
    () => setLb((s) => (s ? { ...s, i: (s.i - 1 + s.photos.length) % s.photos.length } : s)),
    []
  );
  const next = useCallback(
    () => setLb((s) => (s ? { ...s, i: (s.i + 1) % s.photos.length } : s)),
    []
  );

  useEffect(() => {
    if (!lb) return;
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
  }, [lb, close, prev, next]);

  function open(p: Pastoral) {
    setLb({ photos: p.photos.map((ph) => imgUrl(ph.image_id)), i: 0, nome: p.nome });
  }

  return (
    <>
      <PageHero
        eyebrow="Servir é amar"
        title="Nossas Pastorais"
        subtitle="Cada grupo é um dom a serviço da comunidade. Conheça as equipes e venha fazer parte — há sempre um lugar para você."
      />

      <section className={`container ${styles.section}`}>
        {loading ? (
          <Loader />
        ) : pastorais.length === 0 ? (
          <EmptyState icon="heart" title="Nenhuma pastoral cadastrada ainda." />
        ) : (
          <div className={styles.grid}>
            {pastorais.map((p, i) => {
              const capa = p.photos[0];
              return (
                <motion.article
                  key={p.slug}
                  className={styles.card}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  {capa ? (
                    <button
                      className={styles.cover}
                      data-fit={p.fit}
                      style={
                        { '--cover': `url("${imgUrl(capa.image_id, 200)}")` } as React.CSSProperties
                      }
                      onClick={() => open(p)}
                      aria-label={`Ver fotos da pastoral ${p.nome}`}
                    >
                      <img src={imgUrl(capa.image_id, 700)} alt={`Pastoral ${p.nome}`} loading="lazy" />
                      <span className={styles.iconBadge}>
                        <Icon name={p.icon as IconName} size={20} />
                      </span>
                      {p.photos.length > 1 && (
                        <span className={styles.count}>
                          <Icon name="image" size={14} /> {p.photos.length}
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className={styles.cover}>
                      <div className={styles.noPhoto}>
                        <Icon name={p.icon as IconName} size={32} />
                      </div>
                    </div>
                  )}
                  <div className={styles.body}>
                    <h2 className={styles.name}>{p.nome}</h2>
                    {p.lema && <p className={styles.lema}>{p.lema}</p>}
                    {p.descricao && <p className={styles.desc}>{p.descricao}</p>}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        <div className={styles.invite}>
          <h2>Sente o chamado para servir?</h2>
          <p>
            Fale com a nossa equipe após a missa ou entre em contato. Toda vocação é bem-vinda
            na casa de Maria.
          </p>
          <a href={CAPELA.telefoneLink} className={styles.inviteBtn}>
            <Icon name="phone" size={18} />
            {CAPELA.telefone}
          </a>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lb && (
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
            {lb.photos.length > 1 && (
              <button
                className={`${styles.lbNav} ${styles.lbPrev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Anterior"
              >
                <Icon name="chevronLeft" size={32} />
              </button>
            )}
            <motion.figure
              className={styles.lbFigure}
              key={lb.i}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lb.photos[lb.i]} alt={`${lb.nome} — foto ${lb.i + 1}`} />
              <figcaption>
                {lb.nome}
                {lb.photos.length > 1 ? ` · ${lb.i + 1}/${lb.photos.length}` : ''}
              </figcaption>
            </motion.figure>
            {lb.photos.length > 1 && (
              <button
                className={`${styles.lbNav} ${styles.lbNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Próxima"
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
