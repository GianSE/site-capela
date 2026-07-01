import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CAPELA } from '../data/site';
import { PASTORAIS } from '../data/pastorais';
import { HORARIOS_PADRAO } from '../data/horarios';
import type { ScheduleItem, Post, Album } from '../types';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import { Button } from '../components/Button/Button';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { Icon } from '../components/Icon/Icon';
import { imgUrl } from '../lib/api';
import { formatEventDate } from '../lib/format';
import styles from './HomePage.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePage() {
  useSeo({
    description:
      'Capela Nossa Senhora de Fátima — missas, eventos, pastorais e a vida da nossa comunidade. Venha celebrar conosco.',
  });

  const { data: schedule } = useFetch<ScheduleItem[]>('/schedule', HORARIOS_PADRAO);
  const { data: eventos } = useFetch<Post[]>('/posts?type=evento&limit=3', []);
  const { data: albuns } = useFetch<Album[]>('/albums?limit=3', []);

  const horarios = schedule && schedule.length ? schedule : HORARIOS_PADRAO;
  const proximosEventos = (eventos ?? []).filter((e) => e.published);

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <motion.div
            className={styles.heroContent}
            initial="hidden"
            animate="show"
            variants={fadeUp}
          >
            <img
              src="/img/logo-fatima-gold.png"
              alt="Nossa Senhora de Fátima"
              className={styles.heroLogo}
              width={116}
              height={116}
            />
            <p className={styles.heroBadge}>
              <Icon name="star" size={16} />
              {CAPELA.paroquia}
            </p>
            <h1 className={styles.heroTitle}>
              Capela <span className="gold-text">Nossa Senhora</span> de Fátima
            </h1>
            <p className={styles.heroSubtitle}>
              Uma comunidade de fé, oração e serviço. Seja bem-vindo à casa de Maria —
              venha celebrar conosco.
            </p>
            <div className={styles.heroMass}>
              <Icon name="clock" size={20} />
              <span>
                Santa Missa <strong>aos sábados, 19h30</strong>
              </span>
            </div>
            <div className={styles.heroActions}>
              <Button to="/eventos" size="lg">
                Próximos eventos <Icon name="arrowRight" size={18} />
              </Button>
              <a href="#programacao" className={styles.heroSecondary}>
                Programação da semana
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== BEM-VINDO ===================== */}
      <section className={`container ${styles.welcome}`}>
        <motion.div
          className={styles.welcomeText}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="eyebrow">Nossa comunidade</p>
          <h2 className={styles.welcomeTitle}>Uma casa de fé e acolhimento</h2>
          <p>
            A Capela Nossa Senhora de Fátima é um lugar de encontro, oração e comunhão no
            Jardim Nova Esperança. Fazemos parte da {CAPELA.paroquia} e caminhamos unidos na
            fé, no serviço e na alegria de servir.
          </p>
          <p>
            Aqui, cada pessoa é bem-vinda — para a Santa Missa, para integrar uma pastoral ou
            simplesmente rezar em silêncio. As portas estão sempre abertas para você e sua
            família.
          </p>
          <div className={styles.welcomeActions}>
            <Button to="/pastorais" variant="ghost">
              Conheça as pastorais <Icon name="arrowRight" size={18} />
            </Button>
          </div>
        </motion.div>
        <motion.div
          className={styles.welcomeImage}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/img/capela-comunidade.jpg"
            alt="Comunidade na Capela Nossa Senhora de Fátima"
            loading="lazy"
          />
        </motion.div>
      </section>

      {/* ===================== PROGRAMAÇÃO ===================== */}
      <section id="programacao" className={`container ${styles.section}`}>
        <SectionHeader
          eyebrow="Vida da comunidade"
          title="Programação da semana"
          subtitle="Nossos encontros de oração e celebração ao longo da semana."
          center
        />
        <div className={styles.scheduleGrid}>
          {horarios.map((h, i) => (
            <motion.div
              key={h.id}
              className={styles.scheduleCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.scheduleIcon}>
                <Icon name="calendar" size={22} />
              </div>
              <div>
                <h3 className={styles.scheduleLabel}>{h.label}</h3>
                <p className={styles.scheduleWhen}>
                  {h.day_of_week}
                  {h.time ? ` · ${h.time}` : ''}
                </p>
                {h.note && <p className={styles.scheduleNote}>{h.note}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================== PASTORAIS ===================== */}
      <section className={styles.sectionAlt}>
        <div className="container">
          <SectionHeader
            eyebrow="Servir é amar"
            title="Nossas pastorais"
            subtitle="Grupos que dão vida à nossa comunidade. Há sempre um lugar para você servir."
            center
          />
          <div className={styles.pastoraisGrid}>
            {PASTORAIS.slice(0, 6).map((p) => (
              <Link key={p.slug} to="/pastorais" className={styles.pastoralCard}>
                <div className={styles.pastoralIcon}>
                  <Icon name={p.icon as never} size={24} />
                </div>
                <h3>{p.nome}</h3>
                <p>{p.lema}</p>
              </Link>
            ))}
          </div>
          <div className={styles.center}>
            <Button to="/pastorais" variant="ghost">
              Ver todas as pastorais <Icon name="arrowRight" size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* ===================== EVENTOS ===================== */}
      {proximosEventos.length > 0 && (
        <section className={`container ${styles.section}`}>
          <SectionHeader
            eyebrow="Agenda"
            title="Próximos eventos"
            subtitle="Participe e celebre conosco os momentos especiais da nossa capela."
          />
          <div className={styles.eventsGrid}>
            {proximosEventos.map((ev) => (
              <Link key={ev.id} to={`/eventos/${ev.slug}`} className={styles.eventCard}>
                {ev.cover_id && (
                  <div
                    className={styles.eventImage}
                    style={
                      { '--cover': `url("${imgUrl(ev.cover_id, 200)}")` } as React.CSSProperties
                    }
                  >
                    <img src={imgUrl(ev.cover_id, 800)} alt={ev.title} loading="lazy" />
                  </div>
                )}
                <div className={styles.eventBody}>
                  {ev.event_date && (
                    <span className={styles.eventDate}>
                      <Icon name="calendar" size={15} />
                      {formatEventDate(ev.event_date)}
                    </span>
                  )}
                  <h3>{ev.title}</h3>
                  {ev.summary && <p>{ev.summary}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===================== GALERIA PREVIEW ===================== */}
      {albuns && albuns.length > 0 && (
        <section className={styles.sectionAlt}>
          <div className="container">
            <SectionHeader
              eyebrow="Memórias"
              title="Galeria da comunidade"
              subtitle="Momentos de fé, festa e união registrados em nossa capela."
            />
            <div className={styles.galleryGrid}>
              {albuns.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  to={`/galeria/${a.slug}`}
                  className={styles.galleryCard}
                  style={
                    a.cover_id
                      ? ({ '--cover': `url("${imgUrl(a.cover_id, 200)}")` } as React.CSSProperties)
                      : undefined
                  }
                >
                  {a.cover_id ? (
                    <img src={imgUrl(a.cover_id, 600)} alt={a.title} loading="lazy" />
                  ) : (
                    <div className={styles.galleryPlaceholder}>
                      <Icon name="image" size={32} />
                    </div>
                  )}
                  <div className={styles.galleryOverlay}>
                    <h3>{a.title}</h3>
                    <span>{a.photo_count} fotos</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className={styles.center}>
              <Button to="/galeria" variant="ghost">
                Ver galeria completa <Icon name="arrowRight" size={18} />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ===================== CTA LOCALIZAÇÃO ===================== */}
      <section className={`container ${styles.section}`}>
        <div className={styles.ctaCard}>
          <div>
            <h2>Venha nos visitar</h2>
            <p className={styles.ctaAddress}>
              <Icon name="mapPin" size={20} />
              {CAPELA.endereco}
            </p>
          </div>
          <Button to="/contato" size="lg">
            Como chegar <Icon name="arrowRight" size={18} />
          </Button>
        </div>
      </section>
    </>
  );
}
