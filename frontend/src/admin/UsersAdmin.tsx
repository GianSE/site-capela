import { useState, useEffect, type FormEvent } from 'react';
import { api, ApiError } from '../lib/api';
import { useSeo } from '../hooks/useSeo';
import { useAuth } from './AuthContext';
import type { AdminUser } from '../types';
import { Icon } from '../components/Icon/Icon';
import ui from './admin-ui.module.css';

export default function UsersAdmin() {
  useSeo({ title: 'Usuários do painel' });
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function reload() {
    const data = await api.get<AdminUser[]>('/admin/users');
    setUsers(data);
    setLoading(false);
  }
  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/users', { email, name, password });
      setEmail('');
      setName('');
      setPassword('');
      setSuccess('Administrador criado com sucesso!');
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao criar administrador');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(u: AdminUser) {
    if (!confirm(`Remover o acesso de "${u.name}" (${u.email})?`)) return;
    try {
      await api.del(`/admin/users/${u.id}`);
      setUsers((s) => s.filter((x) => x.id !== u.id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao remover administrador');
    }
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>Usuários do Painel</h1>
          <p>Crie e gerencie os acessos administrativos ao painel da capela.</p>
        </div>
      </div>

      <form className={`${ui.card} ${ui.form}`} onSubmit={handleCreate}>
        <h2 style={{ marginBottom: 4 }}>Novo administrador</h2>

        {error && (
          <div className={ui.empty} style={{ color: '#b91c1c', padding: 'var(--space-3)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className={ui.empty} style={{ color: '#15803d', padding: 'var(--space-3)' }}>
            {success}
          </div>
        )}

        <div className={ui.row}>
          <div className={ui.field}>
            <label>Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={ui.field}>
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
        </div>

        <div className={ui.field}>
          <label>Senha (mínimo 8 caracteres)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <div className={ui.actions}>
          <button type="submit" className={ui.btnPrimary} disabled={busy}>
            <Icon name="star" size={18} /> {busy ? 'Criando…' : 'Criar administrador'}
          </button>
        </div>
      </form>

      <h2 style={{ margin: 'var(--space-6) 0 var(--space-4)' }}>Administradores atuais</h2>

      {loading ? (
        <p className={ui.empty}>Carregando…</p>
      ) : (
        <div className={ui.list}>
          {users.map((u) => (
            <div key={u.id} className={ui.item}>
              <div className={ui.itemBody}>
                <h3>
                  {u.name}
                  {u.is_primary && (
                    <span className={`${ui.badge} ${ui.badgeDraft}`} style={{ marginLeft: 8 }}>
                      Principal
                    </span>
                  )}
                  {u.id === currentUser?.id && (
                    <span className={`${ui.badge} ${ui.badgePublished}`} style={{ marginLeft: 8 }}>
                      Você
                    </span>
                  )}
                </h3>
                <p>{u.email}</p>
              </div>
              <div className={ui.itemActions}>
                {!u.is_primary && u.id !== currentUser?.id && (
                  <button onClick={() => handleDelete(u)} className={ui.btnDanger}>
                    <Icon name="close" size={16} /> Remover acesso
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
