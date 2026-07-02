import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
  { to: '/admin/pastorais', label: 'Pastorais', icon: 'heart' },
  { to: '/admin/programacao', label: 'Programação', icon: 'clock' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: 'mapPin' },
  { to: '/admin/usuarios', label: 'Usuários', icon: 'users' },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Fecha o menu ao trocar de página (ex.: usuário navega pelo teclado/voltar).
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Trava o scroll do body com o menu mobile aberto.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/admin/login" replace />;

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  return (
    <div className={styles.shell}>
      {/* Sidebar — visível só no desktop */}
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

      {/* Barra superior — visível só no mobile */}
      <header className={styles.mobileBar}>
        <Link to="/admin" className={styles.mobileBrand}>
          <img src="/img/logo-fatima-gold.png" alt="" width={32} height={32} />
          <strong>Painel</strong>
        </Link>
        <button
          className={styles.menuBtn}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
        >
          <Icon name={open ? 'close' : 'menu'} size={24} />
        </button>
      </header>

      {/* Menu suspenso — visível só no mobile, quando aberto */}
      <AnimatePresence>
        {open && (
          <motion.nav
            className={styles.mobileDrawer}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Navegação do painel"
          >
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/admin'}
                className={({ isActive }) =>
                  `${styles.mobileLink} ${isActive ? styles.active : ''}`
                }
              >
                <Icon name={l.icon} size={20} />
                {l.label}
              </NavLink>
            ))}
            <div className={styles.mobileFooter}>
              <a href="/" target="_blank" rel="noreferrer" className={styles.mobileLink}>
                <Icon name="arrowRight" size={18} /> Ver site
              </a>
              <button onClick={handleLogout} className={styles.mobileLink}>
                <Icon name="close" size={18} /> Sair
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
