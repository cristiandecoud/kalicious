-- Tabla principal de recetas
CREATE TABLE IF NOT EXISTS recipes (
  id          TEXT        PRIMARY KEY,
  title       TEXT        NOT NULL,
  category    TEXT        NOT NULL CHECK (category IN ('desayuno','almuerzo','cena','postre','snack')),
  time        INTEGER     NOT NULL CHECK (time > 0),
  servings    INTEGER     NOT NULL CHECK (servings > 0),
  ingredients TEXT[]      NOT NULL DEFAULT '{}',
  steps       TEXT        NOT NULL DEFAULT '',
  created_at  BIGINT      NOT NULL
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS recipes_created_at_idx ON recipes (created_at DESC);
CREATE INDEX IF NOT EXISTS recipes_category_idx   ON recipes (category);

-- RLS: habilitar pero permitir todo por ahora (sin auth)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON recipes
  FOR ALL
  USING (true)
  WITH CHECK (true);
