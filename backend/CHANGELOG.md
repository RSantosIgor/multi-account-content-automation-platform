# Changelog — Backend

All changes made by AI agents to this workspace are recorded here in **reverse chronological order** (newest first).

> **Agents:** Read `AGENTS.md §3` for the required format and rules before adding an entry.

---

## [2026-02-25 19:12 UTC] ad-hoc — Circuit-breaker for AI provider fatal errors

**Agent:** claude-sonnet-4-6
**Task:** ad-hoc
**Commit:** 31ac06b

### Files Modified

- `src/services/ai/suggest.ts` — added `isFatalApiError()` helper and circuit-breaker in `processNewArticles` loop: on fatal HTTP errors (400, 401, 403) the loop breaks immediately instead of continuing to spam the provider API
- `src/services/ai/anthropic.ts` — removed `console.error` from `generateRaw()` (violates AGENTS.md §5 logging rules)
- `src/services/ai/openai.ts` — removed `console.error` from `generateRaw()`
- `src/services/ai/deepseek.ts` — removed `console.error` from `generateRaw()`

### Summary

Fixed API spam caused by `processNewArticles` silently swallowing fatal errors (e.g. "credit balance too low") while continuing to iterate all unprocessed articles. The loop now detects non-retryable HTTP status codes and breaks immediately. Also cleaned up `console.error` usage in provider `generateRaw()` methods — errors are already re-thrown and handled by the caller.

---

## [2026-02-25 18:00 UTC] ad-hoc — Sidebar fix, rejection stepper, TASKS.md restructure

**Agent:** claude-sonnet-4-6
**Task:** ad-hoc
**Commit:** 31ac06b

### Files Modified

- `src/services/ai/prompts.ts` — extended prompt builders (modification details carried over from Phase 1 work)
- `../docs/TASKS.md` — added EPIC FLOW (8 tasks for News Flow Redesign), moved INFRA epic to end of order, marked all UX tasks as DONE, added observation to FLOW-004/005 about using full article content for tweet generation

### Summary

Post-UX cleanup: restructured TASKS.md epics order (UX → FLOW → INFRA), marked UX epic complete, and documented the FLOW redesign plan with full article content requirement for tweet generation on approval.

---

## [2026-02-25 13:49 UTC] UX-003 / UX-004 / UX-006 / UX-008 — UX Phases 2–4 Backend

**Agent:** claude-sonnet-4-6
**Task:** UX-003, UX-004, UX-006, UX-008
**Commit:** 645774b

### Files Created

- `src/routes/stats.ts` — `GET /api/v1/accounts/:accountId/stats?from=&to=` returning daily post counts and aggregated metrics (avg/day, avg/week, avg/month, total)

### Files Modified

- `src/routes/accounts.ts` — added `PATCH /api/v1/accounts/:id` endpoint to update `is_active` field with ownership check
- `src/routes/timeline.ts` — added `GET /api/v1/timeline/items/:id` endpoint returning full item detail with article, suggestion, post and news_site joins
- `src/routes/index.ts` — registered stats routes module

### Summary

Backend support for UX Phases 2–4: account update endpoint, full timeline item detail with all joins, and statistics aggregation route with configurable date range filter.

---

## [2026-02-25 00:03 UTC] UX-002 — Phase 1 Frontend Backend Fixes

**Agent:** claude-sonnet-4-6
**Task:** UX-002
**Commit:** 4e64f04

### Files Modified

- `src/routes/timeline.ts` — added `article_summary` field to timeline response payload
- `src/routes/ai.ts` — fixed `Json` type casting for article summary Supabase insert
- `src/services/scraper/article-fetcher.ts` — fixed TypeScript types for cheerio element iteration

### Summary

Minor backend fixes required by the frontend article summary display: timeline API now exposes `article_summary`, and TypeScript strict-mode issues in the article fetcher and AI route were resolved.

---

## [2026-02-24 22:55 UTC] UX-002 / UX-005 — Phase 1 Backend: Article Summaries & Prompt Rules

**Agent:** claude-sonnet-4-6
**Task:** UX-002, UX-005
**Commit:** 2331cc1

### Files Created

- `supabase/migrations/012_article_summaries.sql` — adds `full_article_content TEXT` to `scraped_articles` and `article_summary JSONB` to `ai_suggestions`
- `supabase/migrations/013_prompt_rules.sql` — creates `prompt_rules` table with `rule_type CHECK ('analysis'|'publication')`, RLS policies, priority ordering, and `updated_at` trigger
- `src/services/scraper/article-fetcher.ts` — fetches full article HTML and extracts main text content using cheerio; tries selectors `article`, `.article-content`, `.entry-content`, `main`; strips HTML and returns plain text
- `src/services/ai/summarizer.ts` — generates 3–5 bullet-point article summary using AI provider; returns `{ bullets: string[] }`; falls back to `[title]` on parse failure
- `src/services/ai/prompt-builder.ts` — `buildAnalysisPrompt()` and `buildPublicationPrompt()` load active rules ordered by priority and append them to the base system prompt
- `src/routes/prompt-rules.ts` — CRUD routes for `prompt_rules`: `GET/POST /api/v1/accounts/:accountId/prompt-rules`, `PUT/DELETE /api/v1/accounts/:accountId/prompt-rules/:ruleId` with ownership checks

### Files Modified

- `src/services/ai/anthropic.ts` — implemented `generateRaw(systemPrompt, userPrompt)` method on `AnthropicProvider`
- `src/services/ai/openai.ts` — implemented `generateRaw()` on `OpenAiProvider`
- `src/services/ai/deepseek.ts` — implemented `generateRaw()` on `DeepseekProvider`
- `src/services/ai/provider.ts` — added `generateRaw()` to `AiProvider` interface
- `src/services/ai/prompts.ts` — added `buildAnalysisSystemPrompt()` and `parseAnalysisResponse()` for eligibility checking
- `src/services/ai/suggest.ts` — integrated `buildPublicationPrompt()` into `processNewArticles()` and `suggestForArticle()`
- `src/routes/ai.ts` — on suggestion approval: fetch full article content via `fetchArticleContent()`, cache in `full_article_content`, generate `article_summary` bullets, then update suggestion
- `src/routes/index.ts` — registered `promptRulesRoutes`
- `src/types/database.ts` — regenerated types for new columns and `prompt_rules` table; replaced `any` with `Json` type from Supabase helpers

### Summary

Full Phase 1 backend for UX epic: two DB migrations, article content fetching service, AI summarizer, custom prompt rule builder, and complete prompt-rules CRUD API. All AI providers now support `generateRaw()`. On suggestion approval, the system fetches the full article (cached in DB), generates bullet summaries, and uses publication rules for tweet generation.

### Notes

- `full_article_content` is cached on first fetch and reused on subsequent approvals
- `prompt_rules.rule_type = 'analysis'` rules are reserved for the future FLOW redesign (eligibility phase); currently only `publication` rules are active

---

## [2026-02-24 21:00 UTC] POSTS-001 / POSTS-002 / TIMELINE-001 / ADMIN-001 / ADMIN-002 — Posts, Timeline & Admin

**Agent:** claude-sonnet-4-6
**Task:** POSTS-001, POSTS-002, TIMELINE-001, ADMIN-001, ADMIN-002
**Commit:** 81b1e3a

### Files Created

- `src/services/x-api/client.ts` — `XApiClient` service: decrypts OAuth tokens, posts tweets via `twitter-api-v2`, returns `{ xPostId, xPostUrl }`
- `src/routes/posts.ts` — `POST /api/v1/suggestions/:id/publish` (publish to X), `GET /api/v1/accounts/:accountId/posts` (post history with pagination)
- `src/routes/timeline.ts` — `GET /api/v1/accounts/:accountId/timeline` unified feed combining `ai_suggestions` + `posts` with status filters, type filters, and pagination
- `src/routes/admin.ts` — `GET /api/v1/admin/users` (list all users with roles), `PATCH /api/v1/admin/users/:id/role` (change user role); admin-only via `authorize('admin')`

### Files Modified

- `src/routes/ai.ts` — added `PATCH /api/v1/suggestions/:id/status` (approve/reject with ownership check)
- `src/routes/sites.ts` — added manual scrape trigger; integrated with `ScraperRunner.runSite()`
- `src/services/scraper/rss-detector.ts` — improved direct feed URL detection; added XML cleaning for BOM and leading whitespace
- `src/services/scraper/rss.ts` — fixed feed parsing to handle direct feed URLs without requiring HTML link tag
- `src/routes/index.ts` — registered posts, timeline, admin routes

### Summary

Complete publishing pipeline: X API client with encrypted token handling, publish route, timeline feed API, and admin user management. RSS scraper improvements fix direct feed URL detection and malformed XML feeds.

---

## [2026-02-22 00:24 UTC] ad-hoc — Add DeepSeek AI Provider Support

**Agent:** gpt-5-codex
**Task:** ad-hoc
**Commit:** 8592dcf

### Files Created

- `src/services/ai/deepseek.ts` — Implemented DeepSeek provider using OpenAI-compatible client with `baseURL=https://api.deepseek.com`.
- `src/services/ai/deepseek.test.ts` — Added unit tests for DeepSeek prompt call and malformed JSON fallback handling.

### Files Modified

- `src/config.ts` — Added `deepseek` to `AI_PROVIDER` enum and introduced optional `DEEPSEEK_API_KEY`.
- `src/services/ai/provider.ts` — Extended AI provider factory to return `DeepseekProvider`.
- `src/services/ai/provider.test.ts` — Added coverage for DeepSeek provider selection.
- `src/test/setup.ts` — Added test env seed for `DEEPSEEK_API_KEY`.
- `../backend/.env.example` — Added DeepSeek provider option and `DEEPSEEK_API_KEY` example.
- `../docs/ARCHITECTURE.md` — Updated AI provider/env documentation to include DeepSeek.

### Summary

Added DeepSeek as a first-class AI provider option in the backend AI abstraction and configuration, preserving the same interface and fallback behavior used by OpenAI/Anthropic.

## [2026-02-22 00:18 UTC] AI-001 / AI-002 / AI-003 / AI-004 — AI Providers, Pipeline, and Routes

**Agent:** gpt-5-codex
**Task:** AI-001, AI-002, AI-003, AI-004
**Commit:** 8592dcf

### Files Created

- `src/services/ai/provider.ts` — Defined `AiProvider` interface and factory (`createAiProvider`) with runtime selection by `AI_PROVIDER`.
- `src/services/ai/openai.ts` — Implemented OpenAI provider (`gpt-4o-mini`) with prompt usage, JSON parsing, and graceful fallback for malformed responses.
- `src/services/ai/anthropic.ts` — Implemented Anthropic provider (`claude-haiku-4-5-20251001`) with shared prompt/parse flow and graceful fallback.
- `src/services/ai/prompts.ts` — Added pure prompt builders plus safe AI JSON parsing/normalization utilities.
- `src/services/ai/suggest.ts` — Added AI processing pipeline for batch article processing and manual per-article suggestion generation.
- `src/routes/ai.ts` — Added routes:
  - `POST /api/v1/ai/suggest/:articleId`
  - `PATCH /api/v1/suggestions/:id/status`
- `src/services/ai/openai.test.ts` — Unit tests for OpenAI provider prompt usage and malformed JSON handling.
- `src/services/ai/anthropic.test.ts` — Unit tests for Anthropic provider prompt usage and malformed JSON handling.
- `src/services/ai/provider.test.ts` — Unit tests for provider factory selection by env config.

### Files Modified

- `src/routes/index.ts` — Registered AI routes module.
- `src/services/scraper/runner.ts` — Triggered AI processing after successful article insertion in scraper runs.

### Summary

Implemented the full AI epic: provider abstraction, prompt templates, suggestion generation pipeline with batching, and protected suggestion routes with ownership checks. Added unit tests covering provider calls and malformed AI payload handling without throwing.

### Notes

- Backend `vitest` suite passes with new AI tests.
- `backend build` still reports pre-existing typing issues in scraper/sites modules unrelated to this AI implementation.

## [2026-02-21 22:44 UTC] ad-hoc — Fix Site Edit Scraper Strategy Recalculation

**Agent:** gpt-5-codex
**Task:** ad-hoc
**Commit:** 8592dcf

### Files Modified

- `src/routes/sites.ts` — Recomputed `source_type` and `feed_url` on site update when URL or `scraping_config` changes, applying RSS detection and HTML fallback consistently.

### Summary

Fixed site update behavior so editing URL/selectors now refreshes scraper strategy instead of keeping stale mode/feed settings that could break preview and scraping.

## [2026-02-21] SCRAPER-001 to SCRAPER-005 — Scraping Engine

**Agent:** Claude Opus 4.6
**Task:** SCRAPER-001, SCRAPER-002, SCRAPER-003, SCRAPER-004, SCRAPER-005

### Files Created

- `src/services/scraper/rss.ts` — RSS/Atom feed scraper using `rss-parser`. Extracts title, summary (HTML-stripped, max 500 chars), URL, and published date. Handles `content:encoded`, `contentSnippet`, and `content` fields.
- `src/services/scraper/rss.test.ts` — 7 unit tests: valid feed parsing, network error handling, HTML stripping, summary truncation, missing fields, maxArticles limit, empty feed.
- `src/services/scraper/html.ts` — HTML scraper using `cheerio` with CSS selector config. Resolves relative URLs, 2s polite delay, 15s timeout. Exports `parseHtml()` separately for testing without HTTP.
- `src/services/scraper/html.test.ts` — 7 unit tests: selector extraction, relative URL resolution, no-match selectors, missing title/link, maxArticles, empty summary.
- `src/services/scraper/runner.ts` — `ScraperRunner` orchestrator: `runAll()` processes all active sites, `runSite()` handles a single site with `scraping_runs` logging, `previewSite()` returns preview without DB save. Uses `upsert` with `ignoreDuplicates` for deduplication.
- `src/routes/scrape.ts` — Scraping routes: `POST /api/v1/scrape/run` (admin or cron secret), `POST /api/v1/scrape/run/:siteId` (owner auth), `GET /api/v1/accounts/:accountId/sites/:siteId/runs` (paginated run history).
- `src/jobs/index.ts` — `registerJobs()` registers a cron job (`0 */4 * * *`) that runs `ScraperRunner.runAll()` every 4 hours. Catches exceptions to prevent server crashes.

### Files Modified

- `src/routes/index.ts` — Registered `scrapeRoutes` plugin.
- `src/routes/sites.ts` — Updated test/preview endpoint to use real `ScraperRunner.previewSite()` instead of placeholder.
- `src/server.ts` — Calls `registerJobs(app.log)` before `fastify.listen()`.

### Summary

Complete scraping engine: RSS scraper (rss-parser), HTML scraper (cheerio + CSS selectors), orchestrator with deduplication (`ON CONFLICT DO NOTHING`), execution logging (`scraping_runs`), API routes for manual and scheduled runs, and cron scheduler (every 4 hours). Source type decision tree: `rss` → feed_url, `html` → selectors, `auto` → try RSS then HTML fallback. All 27 backend tests pass.

### Notes

- `ScraperRunner.previewSite()` enables the sites test endpoint to return real article previews without saving to DB.
- Cron secret header (`x-cron-secret`) allows triggering runs without JWT auth.
- HTML scraper adds a 2-second polite delay before each request.

## [2026-02-21] SITES-001 / SITES-002 — News Sites Management (RSS Auto-Detection + CRUD Routes)

**Agent:** Claude Sonnet 4.5
**Task:** SITES-001, SITES-002

### Files Created

- `src/services/scraper/rss-detector.ts` — RSS/Atom feed auto-detection service. Fetches site HTML with cheerio, looks for `<link rel="alternate" type="application/rss+xml|atom+xml">`. Returns `{ feedUrl: string | null }`. 10s timeout, graceful failure.
- `src/routes/sites.ts` — News sites CRUD routes:
  - `GET /api/v1/accounts/:accountId/sites` — List all sites for an X account
  - `POST /api/v1/accounts/:accountId/sites` — Create site with automatic RSS detection
  - `PUT /api/v1/accounts/:accountId/sites/:siteId` — Update site
  - `DELETE /api/v1/accounts/:accountId/sites/:siteId` — Delete site
  - `POST /api/v1/accounts/:accountId/sites/:siteId/test` — Test scraper (preview placeholder for SCRAPER-001/002)
- `src/schemas/sites.schema.ts` — Zod validation schemas for site creation and updates (`scrapingConfigSchema` for HTML selectors).
- `src/scripts/seed-mock-account.ts` — Seed script to create a mock X Account for local testing without OAuth. Run via `pnpm --filter backend seed`.

### Files Modified

- `src/routes/index.ts` — Registered `sitesRoutes` plugin.
- `package.json` — Added `--env-file=.env` to `dev`/`start` scripts; added `seed` script.

### Summary

Implemented RSS auto-detection and full CRUD routes for news sites management. On site creation, the backend auto-detects RSS/Atom feeds: if found, `source_type = 'rss'`; if HTML config provided, `source_type = 'html'`; otherwise `'auto'`. All routes enforce ownership checks. Added seed script for local development without X OAuth.

### Notes

- `verifyAccountOwnership()` helper ensures users can only access sites for their own X accounts.
- HTML scraping config requires: `article_selector`, `title_selector`, `summary_selector`, `link_selector`.
- Seed script uses service role key to insert a mock X Account with encrypted dummy tokens.

## [2026-02-20 17:33 UTC] XACCOUNT-001 / XACCOUNT-002 — OAuth PKCE + X Accounts API

**Agent:** gpt-5-codex
**Task:** XACCOUNT-001, XACCOUNT-002
**Commit:** ca588e5

### Files Created

- `src/services/x-api/oauth.ts` — Implemented PKCE generation, OAuth state persistence/validation, token exchange, X profile fetch, encrypted account upsert, and state cleanup.
- `src/routes/x-oauth.ts` — Added `GET /api/v1/x/oauth/start` and `GET /api/v1/x/oauth/callback` endpoints for OAuth start/callback flow.
- `src/routes/accounts.ts` — Added `GET /api/v1/accounts`, `GET /api/v1/accounts/:id`, and `DELETE /api/v1/accounts/:id` with ownership checks and token-safe responses.
- `src/routes/index.ts` — Central route registration for backend modules.

### Files Modified

- `src/app.ts` — Registered API routes plugin.
- `src/types/fastify.d.ts` — Fixed Fastify module augmentation to preserve framework types while extending `request.user` and `fastify.authenticate`.

### Summary

Implemented end-to-end X OAuth (PKCE) in the backend and account management routes with strict ownership checks, encrypted token persistence, callback state expiration handling, and token revocation on account removal.

### Notes

- `oauth_state` expiration now returns 400 on callback and stale rows are deleted.
- Account responses intentionally omit encrypted token fields.

## [2026-02-20 10:45 UTC] CORE-001 to CORE-005 — Core Backend Services

**Agent:** Claude Sonnet 4.5
**Task:** CORE-001, CORE-002, CORE-003, CORE-004, CORE-005
**Commit:** fdf7a7c

### Files Created

- `src/plugins/authenticate.ts` — Fastify plugin that verifies Supabase JWTs via `supabase.auth.getUser()`, looks up `user_roles` for role, and populates `request.user`
- `src/plugins/authenticate.test.ts` — 5 tests: missing JWT, malformed header, invalid token, valid token with admin role, default member role
- `src/plugins/authorize.ts` — Role-based authorization factory function `authorize(...roles)` returning a preHandler hook; returns 403 for insufficient permissions
- `src/plugins/authorize.test.ts` — 3 tests: admin access, member 403, member-or-admin route
- `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt using `ENCRYPTION_KEY` from config; random IV per call; hex format output
- `src/lib/crypto.test.ts` — 5 tests: roundtrip, unique IVs, empty string, unicode, tampered ciphertext
- `src/lib/supabase.ts` — Singleton Supabase client using `createClient<Database>` with service role key
- `src/types/fastify.d.ts` — Type augmentation for `FastifyRequest.user` and `FastifyInstance.authenticate`

### Files Modified

- `src/app.ts` — Registered authenticate plugin; added global error handler (ZodError→400, HTTP errors, unhandled 500 with stack in dev only); disabled logger in test env
- `src/test/helpers/app.ts` — Updated to align with new authenticate plugin API (overrides decorator with mock user injection)
- `package.json` — Added `fastify-plugin` dependency

### Summary

Implemented all 5 Core Backend Services tasks. Authentication verifies Supabase JWTs and populates `request.user` with `id`, `email`, `role`. Authorization provides a reusable `authorize('admin')` preHandler factory. Crypto uses AES-256-GCM with random IVs for token encryption at rest. Global error handler ensures consistent JSON error responses across all routes. All 13 tests pass.

<!-- NEW ENTRIES GO HERE — insert above this line -->

## [2026-02-19 02:00 UTC] DB-003 / DB-004 / DB-005 / DB-006 — Full DB Schema & TypeScript Types

**Agent:** claude-sonnet-4-5-20250929
**Task:** DB-003, DB-004, DB-005, DB-006
**Commit:** 783e17b

### Files Created

- `supabase/migrations/004_x_accounts.sql` — `x_accounts` table with encrypted OAuth token columns (TEXT hex), unique `(user_id, x_user_id)`, RLS enabled
- `supabase/migrations/005_news_sites.sql` — `news_sites` table with `source_type CHECK`, `scraping_config JSONB`, `scraping_interval_hours`, partial index on `is_active`
- `supabase/migrations/006_scraped_articles.sql` — `scraped_articles` table with `UNIQUE(news_site_id, url)`, partial index on unprocessed rows
- `supabase/migrations/007_ai_suggestions.sql` — `ai_suggestions` table with status lifecycle `CHECK`, indexes on `x_account_id`, `article_id`, `status`
- `supabase/migrations/008_posts.sql` — `posts` table with `status CHECK ('published'|'failed')`, nullable `ai_suggestion_id` (ON DELETE SET NULL)
- `supabase/migrations/009_scraping_runs.sql` — `scraping_runs` table with `status CHECK`, descending index on `started_at`
- `supabase/migrations/010_oauth_state.sql` — `oauth_state` temporary table for PKCE flow (no policies — service_role only)
- `supabase/migrations/011_rls_policies.sql` — all `CREATE POLICY` statements: `x_accounts` (owner CRUD), `news_sites` (owner CRUD via x_accounts), `scraped_articles` (owner SELECT), `ai_suggestions` (owner SELECT + UPDATE status), `posts` (owner SELECT), `scraping_runs` (owner SELECT)
- `backend/src/types/database.ts` — Supabase-format TypeScript types for all 9 tables (`Row`, `Insert`, `Update`, `Relationships`); convenience type aliases exported at bottom

### Summary

Complete database schema: 9 tables across 11 migration files. All tables have `updated_at` triggers via `moddatetime`. RLS is enabled on every table; write access for data tables is restricted to `service_role` while users can read their own data via the ownership chain (`user → x_accounts → news_sites → ...`). TypeScript types are hand-written in the Supabase CLI format and should be regenerated with `pnpm db:types` once the Supabase project is linked.

### Notes

- `oauth_state` has no SELECT/INSERT/UPDATE/DELETE policies — accessed only via `service_role` in the backend OAuth flow
- `ai_suggestions` allows owner UPDATE (approve/reject) but INSERT is service_role only (AI pipeline)
- `database.ts` should be regenerated (`pnpm db:types`) after `supabase db push` to confirm alignment with actual schema
- `scraping_runs.status` defaults to `'running'`; runner updates to `'success'` or `'failed'` on finish

## [2026-02-19 01:00 UTC] DB-001 / DB-002 — Bootstrap Extensions, User Profiles & Roles

**Agent:** claude-sonnet-4-5-20250929
**Task:** DB-001, DB-002
**Commit:** 783e17b

### Files Created

- `supabase/migrations/001_extensions.sql` — enables `uuid-ossp` and `moddatetime` extensions; defines `trigger_set_updated_at()` helper function
- `supabase/migrations/002_user_profiles.sql` — creates `user_profiles` table (1:1 with `auth.users`), `handle_new_user()` trigger to auto-create profile on signup, RLS policies (SELECT + UPDATE for own row)
- `supabase/migrations/003_user_roles.sql` — creates `user_roles` table with `CHECK (role IN ('admin', 'member'))`, RLS policy (SELECT own row only; no write policies so only `service_role` can mutate)

### Summary

Bootstrap migrations for the database layer. Extensions enable UUID generation and automatic `updated_at` maintenance via `moddatetime`. User profile rows are auto-created on signup via a `SECURITY DEFINER` trigger. Role escalation is prevented by RLS: no INSERT/UPDATE/DELETE policies exist on `user_roles`, so only the service role key can assign or change roles.

### Notes

- `moddatetime(updated_at)` is used for the `updated_at` trigger (from the extension), consistent with ARCHITECTURE.md §5
- The `handle_new_user()` trigger uses `SECURITY DEFINER` so it runs as `postgres`, bypassing RLS on `user_profiles` — this is intentional and necessary
- `user_roles` rows must be created manually by a service-level operation (e.g., admin seed script or Supabase dashboard)

## [2026-02-19 00:00 UTC] SETUP-002 — Scaffold Fastify Backend

**Agent:** claude-sonnet-4-5-20250929
**Task:** SETUP-002
**Commit:** 040c1b9

### Files Created

- `backend/package.json` — workspace manifest with all backend dependencies
- `backend/tsconfig.json` — strict TypeScript config, ESNext modules, outDir `dist/`
- `backend/src/config.ts` — Zod-validated env parser; exits on missing vars
- `backend/src/app.ts` — Fastify factory with CORS, Helmet, Sensible, Swagger (dev only), `/health` endpoint
- `backend/src/server.ts` — entry point; boots app and listens on configured port
- `backend/.env.example` — template with all required variables documented
- `backend/vitest.config.ts` — Vitest config with V8 coverage, `src/test/setup.ts` as setup file
- `backend/src/test/setup.ts` — global test env vars so `config.ts` parses in test mode
- `backend/src/test/mocks/supabase.ts` — reusable Supabase client mock factory
- `backend/src/test/mocks/ai.ts` — reusable OpenAI and Anthropic mock factories
- `backend/src/test/mocks/x-api.ts` — reusable TwitterApi mock factory
- `backend/src/test/helpers/app.ts` — `buildTestApp()` helper for route integration tests

### Summary

Full Fastify backend scaffold with TypeScript strict mode, Zod config validation, and a complete test infrastructure (Vitest + mock factories). The server starts on `PORT` (default 3001) and returns `{ status: 'ok' }` at `GET /health`. Swagger UI is available at `/docs` in development mode.

### Notes

- `pnpm dev` uses `tsx watch` for hot-reload; `pnpm build` compiles to `dist/` via `tsc`
- `@fastify/sensible` is used for HTTP error helpers (`fastify.httpErrors.*`)
- Test setup silences `pino-pretty` logger output during test runs
