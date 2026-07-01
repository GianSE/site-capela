-- Categoria do álbum (missas | mutiroes | eventos | outros) para filtrar a galeria.
ALTER TABLE albums ADD COLUMN category TEXT NOT NULL DEFAULT 'outros';
CREATE INDEX IF NOT EXISTS idx_albums_category ON albums (category, published);
