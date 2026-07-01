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
  cover_key: string | null;
  published: number; // 0 | 1
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: number;
  album_id: number;
  r2_key: string;
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
  cover_key: string | null; // resolvido pela API (join)
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
}
