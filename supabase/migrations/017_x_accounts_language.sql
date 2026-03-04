-- FEAT-002: Add language column to x_accounts
-- Controls the language used by the AI when generating posts
ALTER TABLE public.x_accounts
  ADD COLUMN language TEXT NOT NULL DEFAULT 'pt-BR';
