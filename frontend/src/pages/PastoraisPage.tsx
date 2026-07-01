import { motion } from 'framer-motion';
import { PASTORAIS } from '../data/pastorais';
import { useSeo } from '../hooks/useSeo';
import { PageHero } from '../components/PageHero/PageHero';
import { Icon } from '../components/Icon/Icon';
import type { IconName } from '../components/Icon/Icon';
import { CAPELA } from '../data/site';
import styles from './PastoraisPage.module.css';

export default function PastoraisPage() {
  useSeo({
    title: 'Pastorais',
    description:
      'Conheça as pastorais da Capela Nossa Senhora de Fátima: Catequese, Liturgia, Legião de Maria, Música, Social e muito mais.',
  });

  return (
    <>
      <PageHero
        eyebrow="Servir é amar"
        title="Nossas Pastorais"
        subtitle="Cada grupo é um dom a serviço da comunidade. Venha fazer parte — há sempre um lugar para você."
      />

      <section className={`container ${styles.section}`}>
        <div className={styles.grid}>
          {PASTORAIS.map((p, i) => (
            <motion.article
              key={p.slug}
              className={styles.card}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.icon}>
                <Icon name={p.icon as IconName} size={26} />
              </div>
              <h2 className={styles.name}>{p.nome}</h2>
              <p className={styles.lema}>{p.lema}</p>
              <p className={styles.desc}>{p.descricao}</p>
            </motion.article>
          ))}
        </div>

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
    </>
  );
}
