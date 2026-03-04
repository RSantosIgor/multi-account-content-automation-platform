-- Migration 022: RLS policies for SRC epic tables
-- Isolates data by user via x_accounts.user_id chain

-- content_items
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content_items"
  ON public.content_items FOR SELECT
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own content_items"
  ON public.content_items FOR INSERT
  WITH CHECK (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own content_items"
  ON public.content_items FOR UPDATE
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own content_items"
  ON public.content_items FOR DELETE
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

-- youtube_sources
ALTER TABLE public.youtube_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own youtube_sources"
  ON public.youtube_sources FOR ALL
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

-- x_feed_sources
ALTER TABLE public.x_feed_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own x_feed_sources"
  ON public.x_feed_sources FOR ALL
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

-- newsletter_sources
ALTER TABLE public.newsletter_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own newsletter_sources"
  ON public.newsletter_sources FOR ALL
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

-- Service role bypass (backend uses service role key — needs unrestricted access)
CREATE POLICY "Service role bypass content_items"
  ON public.content_items FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass youtube_sources"
  ON public.youtube_sources FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass x_feed_sources"
  ON public.x_feed_sources FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass newsletter_sources"
  ON public.newsletter_sources FOR ALL
  TO service_role USING (true) WITH CHECK (true);
