-- Run this in Supabase Dashboard → SQL Editor
-- Creates the martyrs table with indexes and public read access

CREATE TABLE IF NOT EXISTS martyrs (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  birth_year      TEXT,
  enlistment_date TEXT,
  hometown        TEXT,
  death_date      TEXT,
  rank            TEXT,
  unit            TEXT,
  raw_info        TEXT,
  is_unknown      BOOLEAN DEFAULT false,
  cemetery        TEXT NOT NULL,
  source_file     TEXT,
  grave_no        TEXT,
  row_no          TEXT,
  zone            TEXT,
  lot             TEXT,
  relics          TEXT,
  gather_location TEXT,
  gather_unit     TEXT,
  move_location   TEXT,
  move_person     TEXT,
  notes           TEXT
);

-- Fast filtering by cemetery
CREATE INDEX IF NOT EXISTS idx_martyrs_cemetery ON martyrs(cemetery);

-- Fast search by name (trigram for Vietnamese fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_martyrs_name_trgm ON martyrs USING GIN (name gin_trgm_ops);

-- Public read-only access (no auth required)
ALTER TABLE martyrs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON martyrs;
CREATE POLICY "Public read access" ON martyrs
  FOR SELECT USING (true);
