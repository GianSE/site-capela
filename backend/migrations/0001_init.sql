-- ============================================================
-- Schema inicial — Capela Nossa Senhora de Fátima
-- ============================================================

-- Administradores do painel
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Eventos e Avisos (unificados por "type")
CREATE TABLE IF NOT EXISTS posts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  type       TEXT NOT NULL CHECK (type IN ('evento', 'aviso')),
  title      TEXT NOT NULL,
  summary    TEXT,
  body       TEXT,
  location   TEXT,
  event_date TEXT,
  cover_id   TEXT,
  published  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts (type, published);
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts (event_date);

-- Álbuns de fotos
CREATE TABLE IF NOT EXISTS albums (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  event_date     TEXT,
  cover_photo_id INTEGER,
  published      INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Fotos dos álbuns (arquivo no Cloudinary, metadados aqui)
CREATE TABLE IF NOT EXISTS photos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id   INTEGER NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  image_id   TEXT NOT NULL,
  caption    TEXT,
  width      INTEGER,
  height     INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_photos_album ON photos (album_id, sort_order);

-- Programação da semana
CREATE TABLE IF NOT EXISTS schedule (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  label       TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  time        TEXT,
  note        TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  active      INTEGER NOT NULL DEFAULT 1
);

-- Configurações (contatos, redes) — chave/valor
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
