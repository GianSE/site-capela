import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { RootLayout } from './layout/RootLayout';
import { Loader } from './components/Loader/Loader';
import { AuthProvider } from './admin/AuthContext';
import { AdminLayout } from './admin/AdminLayout';
import { PostsListPage } from './admin/PostsListPage';
import { PostEditPage } from './admin/PostEditPage';

// ---- Públicas ----
const HomePage = lazy(() => import('./pages/HomePage'));
const PastoraisPage = lazy(() => import('./pages/PastoraisPage'));
const EventosPage = lazy(() => import('./pages/EventosPage'));
const AvisosPage = lazy(() => import('./pages/AvisosPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const GaleriaPage = lazy(() => import('./pages/GaleriaPage'));
const AlbumPage = lazy(() => import('./pages/AlbumPage'));
const ContatoPage = lazy(() => import('./pages/ContatoPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ---- Admin ----
const LoginPage = lazy(() => import('./admin/LoginPage'));
const DashboardPage = lazy(() => import('./admin/DashboardPage'));
const AlbumsListPage = lazy(() => import('./admin/AlbumsListPage'));
const AlbumEditPage = lazy(() => import('./admin/AlbumEditPage'));
const ScheduleAdmin = lazy(() => import('./admin/ScheduleAdmin'));
const SettingsAdmin = lazy(() => import('./admin/SettingsAdmin'));

function page(el: React.ReactNode) {
  return <Suspense fallback={<Loader />}>{el}</Suspense>;
}

export const router = createBrowserRouter([
  // ---------- Site público ----------
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: page(<HomePage />) },
      { path: '/pastorais', element: page(<PastoraisPage />) },
      { path: '/eventos', element: page(<EventosPage />) },
      { path: '/eventos/:slug', element: page(<PostDetailPage />) },
      { path: '/avisos', element: page(<AvisosPage />) },
      { path: '/avisos/:slug', element: page(<PostDetailPage />) },
      { path: '/galeria', element: page(<GaleriaPage />) },
      { path: '/galeria/:slug', element: page(<AlbumPage />) },
      { path: '/contato', element: page(<ContatoPage />) },
      { path: '*', element: page(<NotFoundPage />) },
    ],
  },

  // ---------- Login (sem layout admin) ----------
  {
    path: '/admin/login',
    element: (
      <AuthProvider>{page(<LoginPage />)}</AuthProvider>
    ),
  },

  // ---------- Painel admin (protegido) ----------
  {
    path: '/admin',
    element: (
      <AuthProvider>
        <AdminLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: page(<DashboardPage />) },
      { path: 'eventos', element: page(<PostsListPage type="evento" />) },
      { path: 'eventos/:id', element: page(<PostEditPage type="evento" />) },
      { path: 'avisos', element: page(<PostsListPage type="aviso" />) },
      { path: 'avisos/:id', element: page(<PostEditPage type="aviso" />) },
      { path: 'galeria', element: page(<AlbumsListPage />) },
      { path: 'galeria/:id', element: page(<AlbumEditPage />) },
      { path: 'programacao', element: page(<ScheduleAdmin />) },
      { path: 'configuracoes', element: page(<SettingsAdmin />) },
    ],
  },
]);
