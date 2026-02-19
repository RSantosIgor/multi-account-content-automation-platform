-- ============================================================
-- DB-005: Row Level Security Policies
-- ============================================================
-- Applies all CREATE POLICY statements for tables that need
-- user-level data isolation.
--
-- Ownership chain:
--   auth.users
--     └── x_accounts (user_id)
--           └── news_sites (x_account_id)
--                 ├── scraped_articles (news_site_id)
--                 │       └── ai_suggestions (x_account_id)
--                 ├── scraping_runs (news_site_id)
--                 └── posts (x_account_id)
--
-- Service-role key bypasses ALL RLS policies.
-- Tables with no write policies (INSERT/UPDATE/DELETE) are
-- effectively read-only for regular users.
-- ============================================================


-- ============================================================
-- x_accounts — owner can SELECT / INSERT / UPDATE / DELETE
-- ============================================================

CREATE POLICY "users can view own x_accounts"
  ON public.x_accounts
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users can insert own x_accounts"
  ON public.x_accounts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can update own x_accounts"
  ON public.x_accounts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users can delete own x_accounts"
  ON public.x_accounts
  FOR DELETE
  USING (user_id = auth.uid());


-- ============================================================
-- news_sites — owner (via x_accounts) can SELECT / INSERT / UPDATE / DELETE
-- ============================================================

CREATE POLICY "users can view own news_sites"
  ON public.news_sites
  FOR SELECT
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users can insert own news_sites"
  ON public.news_sites
  FOR INSERT
  WITH CHECK (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users can update own news_sites"
  ON public.news_sites
  FOR UPDATE
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "users can delete own news_sites"
  ON public.news_sites
  FOR DELETE
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );


-- ============================================================
-- scraped_articles — owner (via news_sites) can SELECT
--                    service_role only for INSERT / UPDATE / DELETE
-- ============================================================

CREATE POLICY "users can view own scraped_articles"
  ON public.scraped_articles
  FOR SELECT
  USING (
    news_site_id IN (
      SELECT ns.id
        FROM public.news_sites ns
        JOIN public.x_accounts xa ON xa.id = ns.x_account_id
       WHERE xa.user_id = auth.uid()
    )
  );

-- No INSERT / UPDATE / DELETE policies → service_role only


-- ============================================================
-- ai_suggestions — owner (via x_accounts) can SELECT + UPDATE status
--                  service_role only for INSERT / DELETE
-- ============================================================

CREATE POLICY "users can view own ai_suggestions"
  ON public.ai_suggestions
  FOR SELECT
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

-- Users may update status (approve / reject) on their own suggestions
CREATE POLICY "users can update own ai_suggestions status"
  ON public.ai_suggestions
  FOR UPDATE
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

-- No INSERT / DELETE policies → service_role only


-- ============================================================
-- posts — owner (via x_accounts) can SELECT
--         service_role only for INSERT / UPDATE / DELETE
-- ============================================================

CREATE POLICY "users can view own posts"
  ON public.posts
  FOR SELECT
  USING (
    x_account_id IN (
      SELECT id FROM public.x_accounts WHERE user_id = auth.uid()
    )
  );

-- No INSERT / UPDATE / DELETE policies → service_role only


-- ============================================================
-- scraping_runs — owner (via news_sites) can SELECT
--                 service_role only for INSERT / UPDATE / DELETE
-- ============================================================

CREATE POLICY "users can view own scraping_runs"
  ON public.scraping_runs
  FOR SELECT
  USING (
    news_site_id IN (
      SELECT ns.id
        FROM public.news_sites ns
        JOIN public.x_accounts xa ON xa.id = ns.x_account_id
       WHERE xa.user_id = auth.uid()
    )
  );

-- No INSERT / UPDATE / DELETE policies → service_role only
