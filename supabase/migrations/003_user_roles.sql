-- ============================================================
-- DB-002 (part 2): User Roles
-- ============================================================
-- Stores the application role for each user.
-- One-to-one with auth.users (UNIQUE on user_id).
-- Default role is 'member'. Admin must be assigned manually
-- by a user with the service_role key.
-- ============================================================

CREATE TABLE public.user_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast role lookups by user_id
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Auto-update updated_at on every UPDATE
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own role
CREATE POLICY "users can view own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT, UPDATE, or DELETE policies for regular users.
-- Absence of policies means those operations are DENIED for all
-- authenticated users — only the service_role key (which bypasses
-- RLS entirely) can write to this table.
-- This prevents any user from escalating their own role.
