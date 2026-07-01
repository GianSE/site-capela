import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useSeo } from '../hooks/useSeo';
import { Icon } from '../components/Icon/Icon';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  useSeo({ title: 'Entrar — Painel' });
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError((err as Error).message || 'Não foi possível entrar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <img src="/img/logo-fatima-gold.png" alt="" width={64} height={64} className={styles.logo} />
        <h1>Painel da Capela</h1>
        <p className={styles.sub}>Acesso restrito à administração</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.field}>
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
          {!busy && <Icon name="arrowRight" size={18} />}
        </button>
      </form>
    </div>
  );
}
