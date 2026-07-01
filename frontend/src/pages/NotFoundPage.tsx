import { useSeo } from '../hooks/useSeo';
import { Button } from '../components/Button/Button';
import { Icon } from '../components/Icon/Icon';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  useSeo({ title: 'Página não encontrada' });

  return (
    <section className={styles.wrap}>
      <img src="/img/logo-fatima.png" alt="" width={80} height={80} />
      <h1>Página não encontrada</h1>
      <p>O endereço que você procura não existe ou foi movido.</p>
      <Button to="/" size="lg">
        <Icon name="arrowRight" size={18} /> Voltar ao início
      </Button>
    </section>
  );
}
