-- ============================================================
-- FLOW-002: Make ai_suggestions.suggestion_text nullable
-- ============================================================
-- In the new flow, the analysis phase creates a suggestion
-- with status='pending' but suggestion_text=NULL.
-- The tweet text is only generated when the user approves
-- (or auto_flow approves automatically).
-- ============================================================

ALTER TABLE public.ai_suggestions
  ALTER COLUMN suggestion_text DROP NOT NULL;
