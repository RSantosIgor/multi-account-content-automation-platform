-- Migration 026: EDT-003 — Clusters editoriais e briefs
-- Tabelas que formam o coração da camada de inteligência editorial:
--   editorial_clusters  — agrupamentos temáticos detectados por AI
--   cluster_items       — M:N entre clusters e content_items
--   editorial_briefs    — sínteses e ângulos sugeridos por cluster
-- Extensão a ai_suggestions para rastreabilidade editorial.

-- ---------------------------------------------------------------------------
-- 1. editorial_clusters
-- ---------------------------------------------------------------------------
CREATE TABLE public.editorial_clusters (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id      uuid        NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  topic             text        NOT NULL,                    -- tema principal do cluster (gerado por AI)
  summary           text,                                    -- resumo de 1-2 frases do cluster
  tags              text[]      NOT NULL,                    -- tags compartilhadas que formaram o cluster
  trend_score       real        NOT NULL DEFAULT 0,          -- 0.0–10.0, score de relevância/volume
  item_count        integer     NOT NULL DEFAULT 0,
  source_type_count integer     NOT NULL DEFAULT 0,          -- quantos tipos de fonte diferentes
  time_window_start timestamptz NOT NULL,
  time_window_end   timestamptz NOT NULL,
  status            text        NOT NULL DEFAULT 'detected'
                    CHECK (status IN ('detected', 'ready', 'used', 'expired', 'dismissed')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clusters_account_status ON public.editorial_clusters(x_account_id, status);
CREATE INDEX idx_clusters_score          ON public.editorial_clusters(trend_score DESC);

-- ---------------------------------------------------------------------------
-- 2. cluster_items  (M:N entre clusters e content_items)
-- ---------------------------------------------------------------------------
CREATE TABLE public.cluster_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id      uuid NOT NULL REFERENCES public.editorial_clusters(id) ON DELETE CASCADE,
  content_item_id uuid NOT NULL REFERENCES public.content_items(id)      ON DELETE CASCADE,
  relevance_score real NOT NULL DEFAULT 1.0,  -- quão relevante este item é para o cluster
  UNIQUE(cluster_id, content_item_id)
);

CREATE INDEX idx_cluster_items_cluster ON public.cluster_items(cluster_id);
CREATE INDEX idx_cluster_items_content ON public.cluster_items(content_item_id);

-- ---------------------------------------------------------------------------
-- 3. editorial_briefs
-- ---------------------------------------------------------------------------
CREATE TABLE public.editorial_briefs (
  id               uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id       uuid  NOT NULL REFERENCES public.editorial_clusters(id) ON DELETE CASCADE,
  x_account_id     uuid  NOT NULL REFERENCES public.x_accounts(id)         ON DELETE CASCADE,
  brief_text       text  NOT NULL,                          -- síntese editorial do cluster
  suggested_angles jsonb NOT NULL DEFAULT '[]',             -- [{ angle: string, rationale: string }]
  selected_angle   text,                                    -- ângulo escolhido pelo usuário (ou auto)
  status           text  NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'approved', 'used', 'dismissed')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_briefs_account_status ON public.editorial_briefs(x_account_id, status);
CREATE INDEX idx_briefs_cluster        ON public.editorial_briefs(cluster_id);

-- ---------------------------------------------------------------------------
-- 4. Estender ai_suggestions para rastreabilidade editorial
-- ---------------------------------------------------------------------------
ALTER TABLE public.ai_suggestions
  ADD COLUMN editorial_brief_id uuid REFERENCES public.editorial_briefs(id),
  ADD COLUMN source_content_ids uuid[] NOT NULL DEFAULT '{}';

-- ---------------------------------------------------------------------------
-- 5. RLS policies
-- ---------------------------------------------------------------------------
ALTER TABLE public.editorial_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cluster_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_briefs   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clusters"
  ON public.editorial_clusters FOR SELECT
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own cluster_items"
  ON public.cluster_items FOR SELECT
  USING (
    cluster_id IN (
      SELECT id FROM public.editorial_clusters
      WHERE x_account_id IN (
        SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view own briefs"
  ON public.editorial_briefs FOR SELECT
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );
