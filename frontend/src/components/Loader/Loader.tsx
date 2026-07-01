import styles from './Loader.module.css';

export function Loader() {
  return (
    <div className={styles.wrap} role="status" aria-label="Carregando">
      <div className={styles.spinner} />
    </div>
  );
}
