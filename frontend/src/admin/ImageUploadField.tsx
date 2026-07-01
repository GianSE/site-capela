import { useState, useRef } from 'react';
import { api, imgUrl } from '../lib/api';
import { compressImage } from '../lib/imageCompress';
import { Icon } from '../components/Icon/Icon';
import styles from './ImageUploadField.module.css';

interface Props {
  value: string | null; // r2 key
  onChange: (key: string | null) => void;
  label?: string;
}

/** Campo de upload de uma imagem de capa (comprime e envia ao R2). */
export function ImageUploadField({ value, onChange, label = 'Imagem de capa' }: Props) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append('file', compressed);
      const { key } = await api.post<{ key: string }>('/admin/upload', form);
      onChange(key);
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
          <img src={imgUrl(value)} alt="Prévia" />
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
