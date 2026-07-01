import { useSeo } from '../hooks/useSeo';
import { useFetch } from '../hooks/useFetch';
import type { Post } from '../types';
import { PageHero } from '../components/PageHero/PageHero';
import { PostCard } from '../components/PostCard/PostCard';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Loader } from '../components/Loader/Loader';
import styles from './ListPage.module.css';

export default function EventosPage() {
  useSeo({
    title: 'Eventos',
    description:
      'Acompanhe os próximos eventos da Capela Nossa Senhora de Fátima: quermesses, celebrações e encontros da comunidade.',
  });

  const { data, loading } = useFetch<Post[]>('/posts?type=evento', []);
  const eventos = (data ?? []).filter((e) => e.published);

  return (
    <>
      <PageHero
        eyebrow="Agenda da comunidade"
        title="Eventos"
        subtitle="Celebre conosco os momentos especiais da nossa capela."
      />

      <section className={`container ${styles.section}`}>
        {loading ? (
          <Loader />
        ) : eventos.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Nenhum evento no momento"
            message="Em breve teremos novidades. Acompanhe nossas redes sociais!"
          />
        ) : (
          <div className={styles.grid}>
            {eventos.map((ev) => (
              <PostCard key={ev.id} post={ev} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
