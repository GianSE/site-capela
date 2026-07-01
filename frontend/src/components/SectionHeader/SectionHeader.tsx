import type { ReactNode } from 'react';
import styles from './SectionHeader.module.css';

interface Props {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  center?: boolean;
}

export function SectionHeader({ eyebrow, title, subtitle, center }: Props) {
  return (
    <header className={`${styles.header} ${center ? styles.center : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
