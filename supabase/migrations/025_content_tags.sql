-- Migration 025: EDT-001 — Tags temáticas por content_item
-- Armazena tags extraídas por AI para cada content_item.
-- Estrutura preparada para integração futura com pgvector (embeddings).

CREATE TABLE public.content_tags (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid        NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  tag             text        NOT NULL,              -- tag normalizada em lowercase (ex: 'inteligência artificial')
  confidence      real        NOT NULL DEFAULT 1.0,  -- 0.0–1.0, confiança da AI na relevância
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_item_id, tag)
);

CREATE INDEX idx_content_tags_tag  ON public.content_tags(tag);
CREATE INDEX idx_content_tags_item ON public.content_tags(content_item_id);

-- RLS
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content_tags"
  ON public.content_tags FOR SELECT
  USING (
    content_item_id IN (
      SELECT id FROM public.content_items
      WHERE x_account_id IN (
        SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
      )
    )
  );

-- Futuro: quando pgvector estiver disponível no projeto
-- ALTER TABLE public.content_items ADD COLUMN embedding vector(1536);
-- CREATE INDEX idx_content_items_embedding
--   ON content_items USING ivfflat (embedding vector_cosine_ops);

COMMENT ON TABLE public.content_tags IS
  'Tags temáticas extraídas por AI. Futuro: complementar com embeddings vetoriais (pgvector) para similaridade semântica.';
