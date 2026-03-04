-- Migration 021: newsletter_sources — per-account newsletter/email ingestion configuration
-- Part of SRC epic: multi-source ingestion layer

CREATE TABLE public.newsletter_sources (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id        uuid        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  name                text        NOT NULL,
  sender_email        text        NOT NULL,
  webhook_secret      text,
  is_active           boolean     NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  UNIQUE (x_account_id, sender_email)
);

CREATE INDEX idx_newsletter_sources_account
  ON public.newsletter_sources (x_account_id);
