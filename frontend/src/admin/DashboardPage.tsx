import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import type { Post, Album, Pastoral } from '../types';
import { Icon } from '../components/Icon/Icon';
import type { IconName } from '../components/Icon/Icon';
import ui from './admin-ui.module.css';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  useSeo({ title: 'Painel' });
  const { user } = useAuth();
  const { data: eventos } = useFetch<Post[]>('/admin/posts', []);

  const allPosts = eventos ?? [];
  const nEventos = allPosts.filter((p) => p.type === 'evento').length;
  const nAvisos = allPosts.filter((p) => p.type === 'aviso').length;
  const { data: albums } = useFetch<Album[]>('/admin/albums', []);
  const nAlbums = (albums ?? []).length;
  const { data: pastorais } = useFetch<Pastoral[]>('/admin/pastorais', []);
  const nPastorais = (pastorais ?? []).length;

  const cards: { to: string; label: string; value: number; icon: IconName }[] = [
    { to: '/admin/eventos', label: 'Eventos', value: nEventos, icon: 'calendar' },
    { to: '/admin/avisos', label: 'Avisos', value: nAvisos, icon: 'broadcast' },
    { to: '/admin/galeria', label: 'Álbuns', value: nAlbums, icon: 'image' },
    { to: '/admin/pastorais', label: 'Pastorais', value: nPastorais, icon: 'heart' },
  ];

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>Olá, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Bem-vindo ao painel da Capela. O que vamos atualizar hoje?</p>
        </div>
      </div>

      <div className={styles.grid}>
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className={styles.statCard}>
            <div className={styles.statIcon}>
              <Icon name={c.icon} size={24} />
            </div>
            <div>
              <span className={styles.statValue}>{c.value}</span>
              <span className={styles.statLabel}>{c.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.quick}>
        <h2>Ações rápidas</h2>
        <div className={styles.quickGrid}>
          <Link to="/admin/galeria/novo" className={ui.btnPrimary}>
            <Icon name="image" size={18} /> Novo álbum de fotos
          </Link>
          <Link to="/admin/eventos/novo" className={ui.btnGhost}>
            <Icon name="calendar" size={18} /> Novo evento
          </Link>
          <Link to="/admin/avisos/novo" className={ui.btnGhost}>
            <Icon name="broadcast" size={18} /> Novo aviso
          </Link>
          <Link to="/admin/pastorais/novo" className={ui.btnGhost}>
            <Icon name="heart" size={18} /> Nova pastoral
          </Link>
        </div>
      </div>
    </div>
  );
}
