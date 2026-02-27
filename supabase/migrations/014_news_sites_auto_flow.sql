-- ============================================================
-- FLOW-001: Add auto_flow to news_sites
-- ============================================================
-- When true, eligible articles skip manual review and are
-- automatically published after AI analysis + generation.
-- Default false: existing sites keep manual approval flow.
-- ============================================================

ALTER TABLE public.news_sites
  ADD COLUMN auto_flow BOOLEAN NOT NULL DEFAULT false;
