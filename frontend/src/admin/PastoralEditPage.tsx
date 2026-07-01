import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, imgUrl } from '../lib/api';
import { useSeo } from '../hooks/useSeo';
import { compressMany } from '../lib/imageCompress';
import type { Pastoral, PastoralPhoto } from '../types';
import { Icon } from '../components/Icon/Icon';
import type { IconName } from '../components/Icon/Icon';
import ui from './admin-ui.module.css';
// Reaproveita os estilos de upload/progresso/grade de fotos (genéricos, sem nada
// específico de álbum) para não duplicar ~150 linhas de CSS.
import styles from './AlbumEditPage.module.css';

const ICON_OPTIONS: IconName[] = [
  'book',
  'candle',
  'hands',
  'rosary',
  'chalice',
  'cross',
  'music',
  'broadcast',
  'heart',
  'star',
  'users',
];

export default function PastoralEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'novo';
  const navigate = useNavigate();
  useSeo({ title: isNew ? 'Nova pastoral' : 'Editar pastoral' });

  const [pastoralId, setPastoralId] = useState<number | null>(isNew ? null : Number(id));
  const [nome, setNome] = useState('');
  const [lema, setLema] = useState('');
  const [descricao, setDescricao] = useState('');
  const [icon, setIcon] = useState<IconName>('heart');
  const [fit, setFit] = useState<'cover' | 'contain'>('cover');
  const [published, setPublished] = useState(true);
  const [photos, setPhotos] = useState<PastoralPhoto[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{
    phase: 'compress' | 'upload';
    done: number;
    total: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    api.get<Pastoral>(`/admin/pastorais/${id}`).then((p) => {
      setNome(p.nome);
      setLema(p.lema ?? '');
      setDescricao(p.descricao ?? '');
      setIcon((p.icon as IconName) || 'heart');
      setFit(p.fit ?? 'cover');
      setPublished(!!p.published);
      setPhotos(p.photos);
    });
  }, [id, isNew]);

  async function saveMeta(e?: FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome,
        lema: lema || null,
        descricao: descricao || null,
        icon,
        fit,
        published,
      };
      if (isNew || pastoralId === null) {
        const res = await api.post<{ id: number }>('/admin/pastorais', payload);
        setPastoralId(res.id);
        navigate(`/admin/pastorais/${res.id}`, { replace: true });
      } else {
        await api.put(`/admin/pastorais/${pastoralId}`, payload);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    let targetId = pastoralId;
    if (targetId === null) {
      if (!nome.trim()) {
        alert('Dê um nome à pastoral antes de adicionar fotos.');
        return;
      }
      const res = await api.post<{ id: number }>('/admin/pastorais', {
        nome,
        lema: lema || null,
        descricao: descricao || null,
        icon,
        fit,
        published,
      });
      targetId = res.id;
      setPastoralId(res.id);
      navigate(`/admin/pastorais/${res.id}`, { replace: true });
    }

    setProgress({ phase: 'compress', done: 0, total: files.length });
    const compressed = await compressMany(files, (done, total) =>
      setProgress({ phase: 'compress', done, total })
    );

    setProgress({ phase: 'upload', done: 0, total: compressed.length });
    for (let i = 0; i < compressed.length; i++) {
      const form = new FormData();
      form.append('files', compressed[i]);
      try {
        const res = await api.post<{ photos: { id: number; image_id: string }[] }>(
          `/admin/pastorais/${targetId}/photos`,
          form
        );
        const p = res.photos?.[0];
        if (p) {
          setPhotos((prev) => [
            ...prev,
            {
              id: p.id,
              pastoral_id: targetId as number,
              image_id: p.image_id,
              sort_order: prev.length + 1,
            },
          ]);
        }
      } catch (err) {
        console.error('Falha ao enviar uma foto:', err);
      }
      setProgress({ phase: 'upload', done: i + 1, total: compressed.length });
    }
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function deletePhoto(photoId: number) {
    if (!confirm('Excluir esta foto?')) return;
    await api.del(`/admin/pastoral-photos/${photoId}`);
    setPhotos((ps) => ps.filter((p) => p.id !== photoId));
  }

  async function makeCover(photoId: number) {
    if (pastoralId === null) return;
    // A capa é sempre a primeira foto (menor sort_order) — reordena trazendo-a
    // para o início e mantém as demais na ordem atual.
    const rest = photos.filter((p) => p.id !== photoId).map((p) => p.id);
    const order = [photoId, ...rest];
    await api.put(`/admin/pastorais/${pastoralId}/photos/order`, { order });
    setPhotos((ps) => {
      const map = new Map(ps.map((p) => [p.id, p]));
      return order.map((pid, i) => ({ ...(map.get(pid) as PastoralPhoto), sort_order: i + 1 }));
    });
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>{isNew ? 'Nova pastoral' : nome || 'Editar pastoral'}</h1>
          <p>Preencha os dados e adicione fotos da equipe.</p>
        </div>
        <button onClick={() => navigate('/admin/pastorais')} className={ui.btnGhost}>
          <Icon name="chevronLeft" size={18} /> Voltar
        </button>
      </div>

      <form className={`${ui.card} ${ui.form}`} onSubmit={saveMeta}>
        <div className={ui.field}>
          <label>Nome da pastoral *</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>

        <div className={ui.field}>
          <label>Lema (frase de destaque)</label>
          <input value={lema} onChange={(e) => setLema(e.target.value)} />
        </div>

        <div className={ui.row}>
          <div className={ui.field}>
            <label>Ícone</label>
            <select value={icon} onChange={(e) => setIcon(e.target.value as IconName)}>
              {ICON_OPTIONS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className={ui.field}>
            <label>Como mostrar a foto</label>
            <select value={fit} onChange={(e) => setFit(e.target.value as 'cover' | 'contain')}>
              <option value="cover">Foto (preenche o card)</option>
              <option value="contain">Logo/cartaz (mostra inteiro)</option>
            </select>
          </div>
        </div>

        <label className={ui.checkbox}>
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publicar no site
        </label>

        <div className={ui.field}>
          <label>Descrição</label>
          <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} />
        </div>

        <div className={ui.actions}>
          <button type="submit" className={ui.btnPrimary} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar dados'}
          </button>
        </div>
      </form>

      {/* Upload de fotos */}
      <div className={styles.uploadSection}>
        <h2>Fotos {photos.length > 0 && <span>({photos.length})</span>}</h2>

        {progress ? (
          <div className={styles.progressBox}>
            <div className={styles.progressHead}>
              <span>
                {progress.phase === 'compress' ? 'Otimizando fotos…' : 'Enviando fotos…'}
              </span>
              <strong>
                {progress.done}/{progress.total}
              </strong>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <span className={styles.progressHint}>
              {progress.phase === 'upload'
                ? 'As fotos vão aparecendo abaixo conforme são enviadas.'
                : 'Preparando as imagens para envio…'}
            </span>
          </div>
        ) : (
          <button
            type="button"
            className={styles.uploadZone}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="image" size={32} />
            <strong>Adicionar fotos</strong>
            <span>Toque para escolher uma ou várias fotos da equipe</span>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} hidden />

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((photo, i) => (
              <div key={photo.id} className={styles.photoCard}>
                <img src={imgUrl(photo.image_id, 300)} alt="" loading="lazy" />
                {i === 0 && (
                  <span className={styles.coverBadge}>
                    <Icon name="star" size={12} /> Capa
                  </span>
                )}
                <div className={styles.photoActions}>
                  {i !== 0 && (
                    <button onClick={() => makeCover(photo.id)} title="Definir como capa">
                      <Icon name="star" size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    title="Excluir foto"
                    className={styles.del}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
