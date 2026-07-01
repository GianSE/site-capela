import { Link } from 'react-router-dom';
import { NAV_LINKS, CAPELA, VERSICULO } from '../../data/site';
import { Icon } from '../../components/Icon/Icon';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <img src="/img/logo-fatima-gold.png" alt="" width={48} height={48} />
            <div>
              <strong>{CAPELA.nomeCurto}</strong>
              <span>{CAPELA.paroquia}</span>
            </div>
          </div>
          <p className={styles.versiculo}>{VERSICULO}</p>
        </div>

        <nav className={styles.navCol} aria-label="Rodapé">
          <h3>Navegação</h3>
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.contactCol}>
          <h3>Contato</h3>
          <a href={CAPELA.telefoneLink} className={styles.contactItem}>
            <Icon name="phone" size={18} />
            {CAPELA.telefone}
          </a>
          <span className={styles.contactItem}>
            <Icon name="mapPin" size={18} />
            {CAPELA.endereco}
          </span>
          <div className={styles.social}>
            <a href={CAPELA.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Icon name="instagram" size={20} />
            </a>
            <a href={CAPELA.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <Icon name="facebook" size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>
            © {year} {CAPELA.nome}. Feito com fé pela nossa comunidade.
          </p>
        </div>
      </div>
    </footer>
  );
}
