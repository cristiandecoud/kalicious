-- Cambia el id de TEXT a UUID con default generado por Postgres
ALTER TABLE recipes
  ALTER COLUMN id TYPE UUID USING id::UUID,
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
