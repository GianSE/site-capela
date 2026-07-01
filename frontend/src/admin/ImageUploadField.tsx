import { useState, useRef } from 'react';
import { api, imgUrl } from '../lib/api';
import { makeVariants } from '../lib/imageCompress';
import { Icon } from '../components/Icon/Icon';
import styles from './ImageUploadField.module.css';

interface Props {
  value: string | null; // base key no B2
  onChange: (key: string | null) => void;
  label?: string;
}

/** Campo de upload de uma imagem de capa (gera thumb+full e envia ao B2). */
export function ImageUploadField({ value, onChange, label = 'Imagem de capa' }: Props) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { thumb, full } = await makeVariants(file);
      const form = new FormData();
      form.append('thumb', thumb);
      form.append('full', full);
      const { cover_id } = await api.post<{ cover_id: string }>('/admin/upload', form);
      onChange(cover_id);
    } catch (err) {
      alert('Erro ao enviar imagem: ' + (err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      {value ? (
        <div className={styles.preview}>
          <img src={imgUrl(value, 'thumb')} alt="Prévia" />
          <button type="button" className={styles.remove} onClick={() => onChange(null)}>
            <Icon name="close" size={16} /> Remover
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.dropzone}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <Icon name="image" size={28} />
          <span>{busy ? 'Enviando…' : 'Escolher imagem'}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        hidden
      />
    </div>
  );
}
