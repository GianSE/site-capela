import { Link } from 'react-router-dom';
import type { Post } from '../../types';
import { Icon } from '../Icon/Icon';
import { imgUrl } from '../../lib/api';
import { formatEventDate, isPast } from '../../lib/format';
import styles from './PostCard.module.css';

export function PostCard({ post }: { post: Post }) {
  const base = post.type === 'evento' ? '/eventos' : '/avisos';
  const past = post.event_date ? isPast(post.event_date) : false;

  return (
    <Link to={`${base}/${post.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {post.cover_id ? (
          <img src={imgUrl(post.cover_id, 'thumb')} alt={post.title} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>
            <Icon name={post.type === 'evento' ? 'calendar' : 'broadcast'} size={32} />
          </div>
        )}
        {past && <span className={styles.pastBadge}>Já aconteceu</span>}
      </div>
      <div className={styles.body}>
        {post.event_date && (
          <span className={styles.date}>
            <Icon name="calendar" size={15} />
            {formatEventDate(post.event_date)}
          </span>
        )}
        <h3>{post.title}</h3>
        {post.summary && <p>{post.summary}</p>}
        {post.location && (
          <span className={styles.location}>
            <Icon name="mapPin" size={15} />
            {post.location}
          </span>
        )}
      </div>
    </Link>
  );
}
