import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { useSeo } from '../hooks/useSeo';
import type { Post } from '../types';
import { Loader } from '../components/Loader/Loader';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { Icon } from '../components/Icon/Icon';
import { imgUrl } from '../lib/api';
import { formatEventDate } from '../lib/format';
import styles from './PostDetailPage.module.css';

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, loading } = useFetch<Post>(slug ? `/posts/${slug}` : null);

  useSeo({
    title: post?.title,
    description: post?.summary ?? undefined,
  });

  if (loading) return <Loader />;

  if (!post) {
    return (
      <div className="container">
        <EmptyState
          icon="calendar"
          title="Conteúdo não encontrado"
          message="O que você procura pode ter sido removido ou o endereço está incorreto."
        />
      </div>
    );
  }

  const backTo = post.type === 'evento' ? '/eventos' : '/avisos';
  const backLabel = post.type === 'evento' ? 'Eventos' : 'Avisos';

  return (
    <article>
      <header className={styles.hero}>
        {post.cover_id && (
          <div className={styles.heroImage}>
            <img src={imgUrl(post.cover_id)} alt={post.title} />
            <div className={styles.heroOverlay} />
          </div>
        )}
        <div className={`container ${styles.heroContent}`}>
          <Link to={backTo} className={styles.back}>
            <Icon name="chevronLeft" size={18} /> {backLabel}
          </Link>
          <span className={styles.type}>
            {post.type === 'evento' ? 'Evento' : 'Aviso'}
          </span>
          <h1>{post.title}</h1>
          <div className={styles.meta}>
            {post.event_date && (
              <span>
                <Icon name="calendar" size={16} />
                {formatEventDate(post.event_date)}
              </span>
            )}
            {post.location && (
              <span>
                <Icon name="mapPin" size={16} />
                {post.location}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className={`container container-narrow ${styles.body}`}>
        {post.summary && <p className={styles.lead}>{post.summary}</p>}
        {post.body &&
          post.body
            .split('\n')
            .filter((p) => p.trim())
            .map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </article>
  );
}
