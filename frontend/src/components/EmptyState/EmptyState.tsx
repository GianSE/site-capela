import type { IconName } from '../Icon/Icon';
import { Icon } from '../Icon/Icon';
import styles from './EmptyState.module.css';

interface Props {
  icon?: IconName;
  title: string;
  message?: string;
}

export function EmptyState({ icon = 'calendar', title, message }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        <Icon name={icon} size={32} />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}
