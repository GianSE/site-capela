import type { ReactNode } from 'react';
import styles from './PageHero.module.css';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
}

export function PageHero({ eyebrow, title, subtitle }: Props) {
  return (
    <section className={styles.hero}>
      <div className="container">
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </section>
  );
}
