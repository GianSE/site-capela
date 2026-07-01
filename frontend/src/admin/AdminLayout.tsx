import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader } from '../components/Loader/Loader';
import { Icon } from '../components/Icon/Icon';
import type { IconName } from '../components/Icon/Icon';
import styles from './AdminLayout.module.css';

const LINKS: { to: string; label: string; icon: IconName }[] = [
  { to: '/admin', label: 'Painel', icon: 'star' },
  { to: '/admin/eventos', label: 'Eventos', icon: 'calendar' },
  { to: '/admin/avisos', label: 'Avisos', icon: 'broadcast' },
  { to: '/admin/galeria', label: 'Galeria', icon: 'image' },
  { to: '/admin/programacao', label: 'Programação', icon: 'clock' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: 'mapPin' },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'users' },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/admin/login" replace />;

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="/img/logo-fatima-gold.png" alt="" width={38} height={38} />
          <div>
            <strong>Painel</strong>
            <span>Capela N. S. de Fátima</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/admin'}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <Icon name={l.icon} size={20} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <a href="/" target="_blank" rel="noreferrer" className={styles.viewSite}>
            <Icon name="arrowRight" size={16} /> Ver site
          </a>
          <button onClick={handleLogout} className={styles.logout}>
            <Icon name="close" size={16} /> Sair
          </button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
