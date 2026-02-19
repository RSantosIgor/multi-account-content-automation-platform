-- ============================================================
-- DB-001: Bootstrap Extensions & Helpers
-- ============================================================

-- Required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ============================================================
-- Helper: auto-update updated_at on any table
--
-- Usage (per table):
--   CREATE TRIGGER set_updated_at
--     BEFORE UPDATE ON <table>
--     FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
