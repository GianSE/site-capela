import { useSeo } from '../hooks/useSeo';
import { useFetch } from '../hooks/useFetch';
import type { Post } from '../types';
import { PageHero } from '../components/PageHero/PageHero';
import { PostCard } from '../components/PostCard/PostCard';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Loader } from '../components/Loader/Loader';
import styles from './ListPage.module.css';

export default function AvisosPage() {
  useSeo({
    title: 'Avisos',
    description:
      'Avisos e notícias da Capela Nossa Senhora de Fátima: mutirões, comunicados e a vida da nossa comunidade.',
  });

  const { data, loading } = useFetch<Post[]>('/posts?type=aviso', []);
  const avisos = (data ?? []).filter((a) => a.published);

  return (
    <>
      <PageHero
        eyebrow="Fique por dentro"
        title="Avisos e Notícias"
        subtitle="Mutirões, comunicados e tudo que acontece na nossa capela."
      />

      <section className={`container ${styles.section}`}>
        {loading ? (
          <Loader />
        ) : avisos.length === 0 ? (
          <EmptyState
            icon="broadcast"
            title="Nenhum aviso no momento"
            message="Quando houver novidades, elas aparecerão aqui."
          />
        ) : (
          <div className={styles.grid}>
            {avisos.map((a) => (
              <PostCard key={a.id} post={a} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
