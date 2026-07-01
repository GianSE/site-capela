import { useSeo } from '../hooks/useSeo';
import { PageHero } from '../components/PageHero/PageHero';
import { Icon } from '../components/Icon/Icon';
import { CAPELA } from '../data/site';
import styles from './ContatoPage.module.css';

export default function ContatoPage() {
  useSeo({
    title: 'Contato',
    description: `Entre em contato com a ${CAPELA.nome}. Endereço: ${CAPELA.endereco}. Telefone: ${CAPELA.telefone}.`,
  });

  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    CAPELA.mapsQuery
  )}&output=embed`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    CAPELA.mapsQuery
  )}`;

  return (
    <>
      <PageHero
        eyebrow="Estamos à sua espera"
        title="Fale Conosco"
        subtitle="Tem alguma dúvida, pedido de oração ou quer participar? Será uma alegria receber você."
      />

      <section className={`container ${styles.section}`}>
        <div className={styles.banner}>
          <img
            src="/img/capela-comunidade.jpg"
            alt="Fachada da Capela Nossa Senhora de Fátima"
            loading="lazy"
          />
        </div>
        <div className={styles.grid}>
          <div className={styles.info}>
            <a href={CAPELA.telefoneLink} className={styles.card}>
              <div className={styles.cardIcon}>
                <Icon name="phone" size={22} />
              </div>
              <div>
                <h3>Telefone</h3>
                <p>{CAPELA.telefone}</p>
                <span className={styles.cardHint}>Paróquia N. S. Rainha dos Apóstolos</span>
              </div>
            </a>

            <a
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
              className={styles.card}
            >
              <div className={styles.cardIcon}>
                <Icon name="mapPin" size={22} />
              </div>
              <div>
                <h3>Endereço</h3>
                <p>{CAPELA.endereco}</p>
                <span className={styles.cardHint}>Toque para abrir no Google Maps</span>
              </div>
            </a>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Icon name="clock" size={22} />
              </div>
              <div>
                <h3>Santa Missa</h3>
                <p>Sábados, 19h30</p>
                <span className={styles.cardHint}>Veja a programação completa na página inicial</span>
              </div>
            </div>

            <div className={styles.social}>
              <a href={CAPELA.instagram} target="_blank" rel="noreferrer">
                <Icon name="instagram" size={20} /> Instagram
              </a>
              <a href={CAPELA.facebook} target="_blank" rel="noreferrer">
                <Icon name="facebook" size={20} /> Facebook
              </a>
            </div>
          </div>

          <div className={styles.mapWrap}>
            <iframe
              title="Localização da Capela Nossa Senhora de Fátima"
              src={mapsSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.map}
            />
          </div>
        </div>
      </section>
    </>
  );
}
