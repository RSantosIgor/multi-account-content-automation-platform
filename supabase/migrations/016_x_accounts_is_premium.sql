-- FEAT-001: Add is_premium column to x_accounts
-- Premium accounts support long posts (up to 25,000 characters)
ALTER TABLE public.x_accounts
  ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;
