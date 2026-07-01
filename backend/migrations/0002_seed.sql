-- ============================================================
-- Seed inicial — programação da semana e configurações
-- (Idempotente: usa INSERT OR IGNORE / chaves estáveis)
-- ============================================================

INSERT OR IGNORE INTO schedule (id, label, day_of_week, time, note, sort_order, active) VALUES
  (1, 'Santa Missa', 'Sábado', '19h30', NULL, 1, 1),
  (2, 'Legião de Maria', 'Terça-feira', '15h00', NULL, 2, 1),
  (3, 'Reunião Pastoral Social', 'Terça-feira', '19h30', NULL, 3, 1),
  (4, 'Adoração ao Santíssimo', 'Quinta-feira', NULL, NULL, 4, 1);

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('telefone', '(43) 3523-2816'),
  ('endereco', 'Av. Gralha Azul, 25 — Jardim Nova Esperança'),
  ('instagram', 'https://www.instagram.com/capela_nossa_senhorafatima/'),
  ('facebook', 'https://www.facebook.com/share/18RJAjnsbZ/'),
  ('whatsapp', '');
