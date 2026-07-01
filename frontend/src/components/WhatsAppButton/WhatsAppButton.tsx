import { CAPELA } from '../../data/site';
import { Icon } from '../Icon/Icon';
import styles from './WhatsAppButton.module.css';

export function WhatsAppButton() {
  const whatsapp: string = CAPELA.whatsapp;
  if (!whatsapp) return null;

  const digits = whatsapp.replace(/\D/g, '');
  const href = `https://wa.me/${digits}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={styles.fab}
      aria-label="Falar no WhatsApp"
    >
      <Icon name="whatsapp" size={28} />
    </a>
  );
}
