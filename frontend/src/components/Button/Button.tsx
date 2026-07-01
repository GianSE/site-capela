import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}

interface AsLink extends BaseProps {
  to: string;
  href?: never;
  onClick?: never;
}
interface AsAnchor extends BaseProps {
  href: string;
  to?: never;
  target?: string;
  rel?: string;
}
interface AsButton extends BaseProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  to?: never;
  href?: never;
  disabled?: boolean;
}

type ButtonProps = AsLink | AsAnchor | AsButton;

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className = '' } = props;
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={cls}>
        {children}
      </Link>
    );
  }
  if ('href' in props && props.href) {
    return (
      <a href={props.href} target={props.target} rel={props.rel} className={cls}>
        {children}
      </a>
    );
  }
  const { onClick, type = 'button', disabled } = props as AsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
