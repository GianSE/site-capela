/** Tipos de dados retornados pela API (espelham o schema D1). */

export type PostType = 'evento' | 'aviso';

export interface Post {
  id: number;
  slug: string;
  type: PostType;
  title: string;
  summary: string | null;
  body: string | null;
  location: string | null;
  event_date: string | null; // ISO date
  cover_id: string | null; // public_id no Cloudinary
  published: number; // 0 | 1
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: number;
  album_id: number;
  image_id: string; // public_id no Cloudinary
  caption: string | null;
  width: number | null;
  height: number | null;
  sort_order: number;
}

export interface Album {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  event_date: string | null;
  cover_photo_id: number | null;
  cover_id: string | null; // public_id da capa (resolvido pela API via join)
  category: string; // missas | mutiroes | eventos | outros
  photo_count: number; // resolvido pela API
  published: number;
  created_at: string;
}

export interface AlbumWithPhotos extends Album {
  photos: Photo[];
}

export interface ScheduleItem {
  id: number;
  label: string;
  day_of_week: string;
  time: string | null;
  note: string | null;
  sort_order: number;
  active: number;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  created_at?: string;
}

export interface PastoralPhoto {
  id: number;
  pastoral_id: number;
  image_id: string; // public_id no Cloudinary
  sort_order: number;
}

export interface Pastoral {
  id: number;
  slug: string;
  nome: string;
  lema: string | null;
  descricao: string | null;
  icon: string;
  fit: 'cover' | 'contain';
  sort_order: number;
  published: number;
  photo_count?: number; // resolvido pela API (lista admin)
  cover_id?: string | null; // capa resolvida pela API (lista admin)
}

export interface PastoralWithPhotos extends Pastoral {
  photos: PastoralPhoto[]; // presente em /pastorais (público) e /admin/pastorais/:id
}
