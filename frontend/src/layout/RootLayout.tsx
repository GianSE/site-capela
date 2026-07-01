import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from './Navbar/Navbar';
import { Footer } from './Footer/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton/WhatsAppButton';

export function RootLayout() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <ScrollRestoration />
      <Navbar />
      <main id="conteudo">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
