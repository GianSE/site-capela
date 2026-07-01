import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, imgUrl } from '../lib/api';
import { useSeo } from '../hooks/useSeo';
import { makeVariants } from '../lib/imageCompress';
import type { AlbumWithPhotos, Photo } from '../types';
import { Icon } from '../components/Icon/Icon';
import ui from './admin-ui.module.css';
import styles from './AlbumEditPage.module.css';

export default function AlbumEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'novo';
  const navigate = useNavigate();
  useSeo({ title: isNew ? 'Novo álbum' : 'Editar álbum' });

  const [albumId, setAlbumId] = useState<number | null>(isNew ? null : Number(id));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [published, setPublished] = useState(true);
  const [coverPhotoId, setCoverPhotoId] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{
    phase: 'compress' | 'upload';
    done: number;
    total: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    api.get<AlbumWithPhotos>(`/admin/albums/${id}`).then((a) => {
      setTitle(a.title);
      setDescription(a.description ?? '');
      setEventDate(a.event_date ? a.event_date.slice(0, 10) : '');
      setPublished(!!a.published);
      setCoverPhotoId(a.cover_photo_id);
      setPhotos(a.photos);
    });
  }, [id, isNew]);

  async function saveMeta(e?: FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description: description || null,
        event_date: eventDate || null,
        published,
      };
      if (isNew || albumId === null) {
        const res = await api.post<{ id: number }>('/admin/albums', payload);
        setAlbumId(res.id);
        // Troca a URL para o modo edição (permite upload em seguida)
        navigate(`/admin/galeria/${res.id}`, { replace: true });
      } else {
        await api.put(`/admin/albums/${albumId}`, payload);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    let targetId = albumId;
    // Se o álbum ainda não existe, cria automaticamente antes de subir.
    if (targetId === null) {
      if (!title.trim()) {
        alert('Dê um título ao álbum antes de adicionar fotos.');
        return;
      }
      const res = await api.post<{ id: number }>('/admin/albums', {
        title,
        description: description || null,
        event_date: eventDate || null,
        published,
      });
      targetId = res.id;
      setAlbumId(res.id);
      navigate(`/admin/galeria/${res.id}`, { replace: true });
    }

    // Envia UMA POR VEZ: gera thumb+full, sobe, e a foto aparece no grid
    // assim que termina — a barra vai avançando (feedback gradual).
    setProgress({ phase: 'upload', done: 0, total: files.length });
    for (let i = 0; i < files.length; i++) {
      try {
        const { thumb, full } = await makeVariants(files[i]);
        const form = new FormData();
        form.append('thumb', thumb);
        form.append('full', full);
        const res = await api.post<{ photos: { id: number; image_id: string }[] }>(
          `/admin/albums/${targetId}/photos`,
          form
        );
        const p = res.photos?.[0];
        if (p) {
          setPhotos((prev) => [
            ...prev,
            {
              id: p.id,
              album_id: targetId as number,
              image_id: p.image_id,
              caption: null,
              width: null,
              height: null,
              sort_order: prev.length + 1,
            },
          ]);
        }
      } catch (err) {
        console.error('Falha ao enviar uma foto:', err);
      }
      setProgress({ phase: 'upload', done: i + 1, total: files.length });
    }

    // 3) Sincroniza (capa definida automaticamente, ordem etc.)
    const fresh = await api.get<AlbumWithPhotos>(`/admin/albums/${targetId}`);
    setPhotos(fresh.photos);
    setCoverPhotoId(fresh.cover_photo_id);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function deletePhoto(photoId: number) {
    if (!confirm('Excluir esta foto?')) return;
    await api.del(`/admin/photos/${photoId}`);
    setPhotos((ps) => ps.filter((p) => p.id !== photoId));
  }

  async function setCover(photoId: number) {
    if (albumId === null) return;
    await api.put(`/admin/albums/${albumId}`, { cover_photo_id: photoId });
    setCoverPhotoId(photoId);
  }

  return (
    <div>
      <div className={ui.header}>
        <div>
          <h1>{isNew ? 'Novo álbum' : title || 'Editar álbum'}</h1>
          <p>Preencha os dados e adicione as fotos.</p>
        </div>
        <button onClick={() => navigate('/admin/galeria')} className={ui.btnGhost}>
          <Icon name="chevronLeft" size={18} /> Voltar
        </button>
      </div>

      <form className={`${ui.card} ${ui.form}`} onSubmit={saveMeta}>
        <div className={ui.field}>
          <label>Título do álbum *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className={ui.row}>
          <div className={ui.field}>
            <label>Data</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </div>
          <label className={ui.checkbox} style={{ alignSelf: 'end', paddingBottom: 12 }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publicar no site
          </label>
        </div>
        <div className={ui.field}>
          <label>Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
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
            <span>Toque para escolher várias fotos do seu celular ou computador</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          hidden
        />

        {photos.length > 0 && (
          <div className={styles.photoGrid}>
            {photos.map((photo) => (
              <div key={photo.id} className={styles.photoCard}>
                <img src={imgUrl(photo.image_id, 'thumb')} alt={photo.caption ?? ''} loading="lazy" />
                {coverPhotoId === photo.id && (
                  <span className={styles.coverBadge}>
                    <Icon name="star" size={12} /> Capa
                  </span>
                )}
                <div className={styles.photoActions}>
                  {coverPhotoId !== photo.id && (
                    <button onClick={() => setCover(photo.id)} title="Definir como capa">
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
