-- Pastorais: gerenciáveis pelo admin (antes eram fixas no código do frontend).

CREATE TABLE IF NOT EXISTS pastorais (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  nome       TEXT NOT NULL,
  lema       TEXT,
  descricao  TEXT,
  icon       TEXT NOT NULL DEFAULT 'heart',
  fit        TEXT NOT NULL DEFAULT 'cover' CHECK (fit IN ('cover', 'contain')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published  INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Fotos de cada pastoral (arquivo no Cloudinary, metadados aqui) — mesma
-- convenção de `photos`: image_id é o public_id no Cloudinary.
CREATE TABLE IF NOT EXISTS pastoral_photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  pastoral_id INTEGER NOT NULL REFERENCES pastorais (id) ON DELETE CASCADE,
  image_id    TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pastoral_photos ON pastoral_photos (pastoral_id, sort_order);

-- Seed com as 9 pastorais atuais (texto original da comunidade).
-- As fotos são inseridas separadamente via bootstrap (upload ao Cloudinary).
INSERT OR IGNORE INTO pastorais (id, slug, nome, lema, descricao, icon, fit, sort_order) VALUES
  (1, 'catequese', 'Catequese', 'Semeando a Palavra nos corações.',
   'A Catequese acompanha crianças, jovens e adultos no caminho da iniciação à vida cristã, preparando-os para os sacramentos e para uma caminhada de fé ativa e consciente.',
   'book', 'cover', 1),
  (2, 'coroinhas-cerimoniarios', 'Coroinhas e Cerimoniários', 'A beleza do serviço no altar.',
   'Com zelo, reverência e alegria, nossas crianças, jovens e adultos auxiliam o sacerdote e coordenam os ritos sagrados, garantindo que as nossas celebrações aconteçam com harmonia e profundo respeito à liturgia.',
   'candle', 'cover', 2),
  (3, 'dizimistas', 'Dizimistas', 'A gratidão que sustenta a nossa obra.',
   'A equipe do Dízimo conscientiza sobre a importância da partilha generosa, essencial para a manutenção do nosso templo e para o sustento das obras sociais e de evangelização da paróquia.',
   'hands', 'contain', 3),
  (4, 'legiao-de-maria', 'Legião de Maria', 'Sob o patrocínio de Nossa Senhora.',
   'O grupo Legião de Maria da nossa Capela é um grupo de oração e evangelização. Nossas reuniões semanais são dedicadas à oração do Terço e ao planejamento de visitas apostólicas às famílias e enfermos da nossa comunidade.',
   'rosary', 'cover', 4),
  (5, 'liturgia', 'Liturgia', 'A beleza do nosso encontro com Cristo.',
   'A equipe de Liturgia prepara e anima as nossas santas missas e celebrações, garantindo que todos os ritos aconteçam com zelo, reverência e muita participação da assembleia.',
   'chalice', 'cover', 5),
  (6, 'ministros', 'Ministros', 'Servidores do altar e da esperança.',
   'Os ministros auxiliam na distribuição da Eucaristia durante as missas e têm a missão especial de levar a comunhão e a Palavra de Deus aos enfermos e idosos em suas casas.',
   'cross', 'cover', 6),
  (7, 'musica', 'Música', 'Quem canta, reza duas vezes.',
   'Nossos músicos e corais dedicam seus dons para animar as celebrações, conduzindo a comunidade à oração por meio do louvor e da arte.',
   'music', 'cover', 7),
  (8, 'pascom', 'PASCOM', 'Evangelizar além das paredes da igreja.',
   'A Pascom é responsável por conectar nossa paróquia através das redes sociais, do nosso site e dos avisos, levando a mensagem de Cristo a todos os lugares.',
   'broadcast', 'contain', 8),
  (9, 'social', 'Social', 'A fé transformada em obras.',
   'Atuamos diretamente na caridade, oferecendo amparo espiritual e material (como a distribuição de alimentos) às famílias e pessoas em situação de vulnerabilidade na nossa comunidade.',
   'heart', 'cover', 9);
