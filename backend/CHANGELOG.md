# Changelog — Backend

All changes made by AI agents to this workspace are recorded here in **reverse chronological order** (newest first).

## [2026-03-25] Fix — YouTube transcript via youtubei.js

### Changed

- `backend/src/services/ingest/transcript.ts` — reescrito para usar `youtubei.js` (InnerTube API) em vez de scraping HTML da página do YouTube. Muito mais estável — não depende mais do formato do `ytInitialPlayerResponse`.
- Adicionada dependência `youtubei.js` ao backend.

## [2026-03-24] SRC-011 — Ingestion Start Date (YouTube & X Feed)

### Added

- `supabase/migrations/030_ingestion_start_date.sql` — ADD COLUMN `ingestion_start_date timestamptz` em `youtube_sources` e `x_feed_sources`
- `backend/src/schemas/sources.schema.ts` — campo `ingestion_start_date` (optional, nullable) nos schemas de criação e atualização de YouTube e X Feed

### Modified

- `backend/src/services/ingest/youtube-ingester.ts` — na primeira execução (`last_scraped_at = null`), usa `ingestion_start_date` como `publishedAfter` na API; filtra vídeos com `publishedAt < ingestion_start_date` em todas as execuções
- `backend/src/services/ingest/x-feed-ingester.ts` — descarta tweets com `created_at < ingestion_start_date` antes do upsert

---

## [2026-03-24] Editorial — manual run endpoint

### Added

- `backend/src/routes/editorial.ts` — novo endpoint `POST /api/v1/accounts/:accountId/editorial/run`; dispara manualmente `EditorialClusterer.detectClusters` + `BriefGenerator.processDetectedClusters` e retorna `{ briefsGenerated }`

---

## [2026-03-24] Cron schedule — ingestão 1h + clustering 10min

### Modified

- `backend/src/jobs/index.ts` — todos os ingesters migrados para `0 * * * *` (1h, sem offsets); clustering/brief migrado de `0 */2 * * *` para `*/10 * * * *`; adicionado guard `hasNewTagsSince(15)` — clustering é pulado se nenhuma `content_tag` foi criada nos últimos 15 minutos

---

## [2026-03-24] EDT-009 — Auto-generate Suggestions per Angle

**Epic:** EDT (Editorial Intelligence)

### Modified

- `backend/src/services/editorial/brief-generator.ts` — after inserting brief, iterates over `suggested_angles` and calls `ContextualGeneratorService.generateFromBrief()` for each angle; isolated failures per angle; marks brief as `used` after all generations
- `backend/src/services/editorial/contextual-generator.ts` — added `skipMarkUsed` option to `generateFromBrief()` and extracted `markBriefUsed()` static method for external callers
- `backend/src/routes/editorial.ts` — removed `used` status check on POST `/generate` (allows re-generation); accepts `angle` in request body; GET briefs list and detail now include `ai_suggestions` relation

---

## [2026-03-19] UNIFY-001–010 — Unified Content Pipeline

**Epic:** UNIFY (Migrate to Unified Content Pipeline)

### Added

- `supabase/migrations/028_unify_news_site_sources.sql` — new `news_site_sources` table, `auto_flow` column on all source tables, data backfill from legacy `news_sites`, RLS policies
- `supabase/migrations/029_drop_legacy_tables.sql` — drops `scraped_articles`, `scraping_runs`, `news_sites`, bridge trigger, `ai_suggestions.scraped_article_id`
- `backend/src/services/ingest/news-site-ingester.ts` — `NewsSiteIngester` class (RSS/HTML → content_items)
- News-site CRUD in `sources.ts`: GET/POST/PUT/DELETE + `/run` + `/test` endpoints
- `auto_flow` field in update schemas for youtube, x-feed, newsletter sources

### Modified

- `backend/src/services/ai/suggest.ts` — rewritten: queries `content_items` only, `buildAutoFlowMap()` across all source tables, removed `scraped_articles` references
- `backend/src/services/ai/auto-flow.ts` — rewritten: `processContentItem()` replaces `processEligibleArticle()`, uses `content_items.full_content`
- `backend/src/routes/ai.ts` — route `/ai/suggest/:contentItemId` replaces `:articleId`, approval caches in `content_items.full_content`
- `backend/src/routes/timeline.ts` — joins through `content_items` instead of `scraped_articles`, `sourceName`/`sourceType` replace `siteId`/`siteName`
- `backend/src/routes/index.ts` — removed `sitesRoutes` and `scrapeRoutes`
- `backend/src/jobs/index.ts` — news site cron uses `NewsSiteIngester.runAll()`

### Removed

- `backend/src/routes/sites.ts` — legacy news site CRUD (superseded by sources.ts)
- `backend/src/routes/scrape.ts` — legacy scrape triggers
- `backend/src/services/scraper/runner.ts` — legacy scraper orchestrator (replaced by NewsSiteIngester)
- `backend/src/schemas/sites.schema.ts` — legacy schemas (moved to sources.schema.ts)

---

## [2026-03-05] SRC-009 + SRC-010 — Botões "Verificar Agora" para YouTube e X Feed

**Tasks:** SRC-009, SRC-010

### Modified

- `backend/src/routes/sources.ts` — adicionados dois novos endpoints POST:
  - `POST /api/v1/accounts/:accountId/sources/youtube/:sourceId/run` (SRC-009): valida ownership, exige `YOUTUBE_API_KEY`, chama `YoutubeIngester.runSource()` e retorna `{ itemsIngested, itemsSkipped, errors }`
  - `POST /api/v1/accounts/:accountId/sources/x-feeds/:sourceId/run` (SRC-010): valida ownership, chama `XFeedIngester.runSource()` e retorna `{ itemsIngested, itemsSkipped, errors }`
  - Importados `YoutubeIngester` e `XFeedIngester` no topo do arquivo

---

## [2026-03-05] EDT-008 — Sugestões contextuais no dashboard

**Task:** EDT-008

### Modified

- `backend/src/routes/timeline.ts` — endpoint de lista agora inclui `editorial_brief_id` e `source_content_ids` em cada sugestão; sugestões editoriais (sem article/content_item) agora aparecem na timeline com `sourceType: 'editorial'`; busca cluster topic dos briefs editoriais via query separada para usar como título

---

## [2026-03-04] EDT-006 — Geração contextual de sugestões a partir de briefs

**Task:** EDT-006

### Added

- `backend/src/services/editorial/contextual-generator.ts` — `ContextualGeneratorService.generateFromBrief()`: busca top 3 itens do cluster por relevance_score, obtém/cacheia `full_content` de cada fonte, monta prompt multi-fonte contextual, aplica publication rules, gera tweet + summary, insere ai_suggestion com `editorial_brief_id` + `source_content_ids`, marca brief + cluster como `used`
- `backend/src/services/ai/prompts.ts` — `buildContextualPublicationPrompt()`: prompt contextual para síntese de múltiplas fontes

### Modified

- `backend/src/routes/editorial.ts` — endpoint `POST /generate` refatorado para delegar ao `ContextualGeneratorService`; adicionada verificação de status (`conflict` se brief já usado); importações limpas (removido inline AI logic)

### Summary

Geração de sugestões editoriais agora usa `ContextualGeneratorService` com full_content de até 3 fontes do cluster, prompts multi-fonte e geração de article summary baseado no conteúdo combinado.

---

## [2026-03-04] EDT-004, EDT-005 — Clustering temporal e geração de briefs

**Tasks:** EDT-004 · EDT-005

### Added

- `supabase/migrations/027_ai_suggestions_nullable_article.sql` — torna `ai_suggestions.article_id` nullable para suportar sugestões editoriais sem scraped_article
- `backend/src/services/editorial/clusterer.ts` (EDT-004) — `EditorialClusterer.detectClusters()`: janela 48h, ≥2 tags compartilhadas, BFS para componentes conectados, `calculateTrendScore()` (count + diversidade + recência), expiração de clusters antigos (>72h)
- `backend/src/services/editorial/brief-generator.ts` (EDT-005) — `BriefGenerator.generateForCluster()` e `processDetectedClusters()` (threshold score=3.0); idempotente via verificação de brief existente
- `backend/src/routes/editorial.ts` (EDT-005) — 4 rotas: GET lista briefs, GET detalhe, PATCH (approve/dismiss/select_angle), POST /generate (cria ai_suggestion a partir do brief)

### Modified

- `backend/src/services/editorial/prompts.ts` — adicionados `buildBriefPrompt()` + `parseBriefResponse()` com schema Zod
- `backend/src/routes/index.ts` — registrado `editorialRoutes`
- `backend/src/jobs/index.ts` — cron job a cada 2h: detecta clusters + gera briefs para todas as contas ativas
- `backend/src/types/database.ts` — `ai_suggestions.article_id` passa a `string | null` em Row, Insert e Update

### Summary

Pipeline editorial completo: clustering por sobreposição de tags (BFS), trend_score multi-fatorial, geração automática de briefs com ângulos via AI, e rotas REST para gerenciamento incluindo geração de ai_suggestion a partir de um brief.

---

## [2026-03-04] EDT-001, EDT-002, EDT-003 — Tags, clusters e briefs editoriais

**Tasks:** EDT-001 · EDT-002 · EDT-003

### Added

- `supabase/migrations/025_content_tags.sql` (EDT-001) — tabela `content_tags` com UNIQUE(content_item_id, tag), índices em tag e item, RLS policy; comentário documenta plano futuro de pgvector
- `supabase/migrations/026_editorial_clusters.sql` (EDT-003) — tabelas `editorial_clusters`, `cluster_items` (M:N com relevance_score), `editorial_briefs` (com JSONB suggested_angles); estende `ai_suggestions` com `editorial_brief_id` e `source_content_ids[]`; RLS policies para todas
- `backend/src/services/editorial/prompts.ts` (EDT-002) — `buildTaggingPrompt()` + `parseTaggingResponse()` com validação Zod, normalização lowercase/trim e dedup
- `backend/src/services/editorial/tagger.ts` (EDT-002) — `ContentTagger.tagContentItem(id)` e `ContentTagger.tagUntaggedItems(accountId)`; circuit-breaker (falha de AI não bloqueia pipeline); idempotente via UNIQUE constraint

### Modified

- `backend/src/types/database.ts` — adicionados tipos para `content_tags`, `editorial_clusters`, `cluster_items`, `editorial_briefs`; `ai_suggestions` estendido com `editorial_brief_id` e `source_content_ids`
- `backend/src/jobs/index.ts` — cron job a cada 1h para tagging de itens não taggeados em todas as contas ativas

### Summary

Implementação da primeira camada da inteligência editorial (EDT epic): estrutura de banco de dados (tags + clusters + briefs), serviço de tagging automático com AI e job periódico de fallback.

---

## [2026-03-04] SRC-008 hotfix — timeline content_items separate query

**Task:** SRC-008 hotfix

### Files Modified

- `backend/src/routes/timeline.ts` — replaced `content_items!ai_suggestions_content_item_id_fkey` FK join (in both list and detail endpoints) with separate `content_items` queries; avoids PostgREST schema cache errors when the FK is newly added

### Summary

Fixed `"Could not find a relationship between 'ai_suggestions' and 'content_items' in the schema cache"` error. PostgREST may not immediately recognise a newly-added FK; the fix selects `content_item_id` as a plain column and fetches the corresponding `content_items` rows in a separate query, then merges them in code.

---

## [2026-03-04] ad-hoc - Fix auth guard on account stats route

**Agent:** gpt-5-codex
**Task:** ad-hoc

### Files Modified

- `backend/src/routes/stats.ts` - added `preHandler: [fastify.authenticate]` to `GET /api/v1/accounts/:accountId/stats`

### Summary

Fixed a route protection bug where `/api/v1/accounts/:accountId/stats` always returned `401 Unauthorized` because `request.user` was read without running the authentication preHandler first.

---

> **Agents:** Read `AGENTS.md §3` for the required format and rules before adding an entry.

---

## [2026-03-04] SRC-003, SRC-004, SRC-005, SRC-006 — Multi-source ingestion + AI pipeline migration

### Added

- `supabase/migrations/024_ai_suggestions_content_item.sql` — adds `content_item_id` (nullable FK) to `ai_suggestions`; backfill from existing `article_id`; adds `feed_url` and `last_scraped_at` to `newsletter_sources`
- `backend/src/services/ingest/transcript.ts` — fetches YouTube transcripts via the public timedtext API (no API key required); prefers user-selected language, falls back to first available track
- `backend/src/services/ingest/youtube-ingester.ts` — YouTube Data API v3 ingester; skips Shorts (< 60 s); upserts `content_items` with `source_type='youtube_video'` + rich metadata; updates `last_checked_at`
- `backend/src/services/ingest/x-feed-ingester.ts` — X feed ingester using `twitter-api-v2`; decrypts `oauth_access_token_enc`; handles quote-tweet context; upserts `content_items` with `source_type='x_post'`
- `backend/src/services/ingest/newsletter-ingester.ts` — newsletter/blog RSS ingester; reuses `scrapeRss()` unchanged; inserts directly into `content_items` with `source_type='newsletter'`; `full_content=null` fetched on demand at approval
- `backend/src/schemas/sources.schema.ts` — Zod schemas for YouTube, X feed, and newsletter sources (create + update variants)
- `backend/src/routes/sources.ts` — CRUD routes for all three source types under `/api/v1/accounts/:accountId/sources/{youtube,x-feeds,newsletters}`

### Modified

- `backend/src/routes/index.ts` — registered `sourcesRoutes`
- `backend/src/jobs/index.ts` — three new cron jobs: YouTube (every 6 h), X feeds (every 4 h offset), newsletters (every 12 h); each skips gracefully if config/keys are absent
- `backend/src/services/ai/suggest.ts` — added `processNewContentItems(xAccountId, batchSize)` that reads from `content_items WHERE is_processed=false`; sets both `content_item_id` and `article_id` (backward compat); auto_flow only for `news_article`; `processNewArticles()` kept as wrapper
- `backend/src/services/ai/auto-flow.ts` — resolves full content from `content_items.full_content` first, fallback to `scraped_articles.full_article_content`; caches in both tables; marks both `is_processed=true`
- `backend/src/routes/ai.ts` — approval route fetches content from `content_items` first (via `content_item_id`), fallback to `scraped_articles` (via `article_id`); marks both tables as `is_processed=true` on approve/reject
- `backend/src/routes/timeline.ts` — detail endpoint joins `content_items!ai_suggestions_content_item_id_fkey`; response includes `sourceType` and `sourceMetadata` for multi-source display
- `backend/src/types/database.ts` — added `content_item_id` to `ai_suggestions` Row/Insert/Update + FK relationship; added `feed_url` and `last_scraped_at` to `newsletter_sources`

---

## [2026-03-04] SRC-001, SRC-002 — content_items table + bridge trigger

### Added

- `supabase/migrations/018_content_items.sql` — `content_items` table with `UNIQUE(source_type, x_account_id, url)` constraint and optimised indices
- `supabase/migrations/019_youtube_sources.sql` — `youtube_sources` configuration table
- `supabase/migrations/020_x_feed_sources.sql` — `x_feed_sources` configuration table
- `supabase/migrations/021_newsletter_sources.sql` — `newsletter_sources` configuration table
- `supabase/migrations/022_content_items_rls.sql` — RLS policies (user isolation + service-role bypass) for all four new tables
- `supabase/migrations/023_bridge_articles_to_content_items.sql` — `BEFORE INSERT OR UPDATE` trigger on `scraped_articles` that upserts a corresponding `content_item` and writes back the FK; includes backfill for existing rows
- `backend/src/types/database.ts` — added `content_items`, `youtube_sources`, `x_feed_sources`, `newsletter_sources` types; updated `scraped_articles` with `content_item_id` column

---

## [2026-03-04] FEAT-001, FEAT-002 — X Premium switch + Language selector

**Agent:** claude-opus-4-6
**Tasks:** FEAT-001, FEAT-002

### Files Created

- `supabase/migrations/016_x_accounts_is_premium.sql` — adds `is_premium BOOLEAN DEFAULT false` to x_accounts
- `supabase/migrations/017_x_accounts_language.sql` — adds `language TEXT DEFAULT 'pt-BR'` to x_accounts

### Files Modified

- `backend/src/types/database.ts` — added `is_premium` and `language` to x_accounts Row/Insert/Update types
- `backend/src/routes/accounts.ts` — `PublicXAccount` type, `toPublicAccount()`, select strings, PATCH schema and updateData all extended with `is_premium` and `language`
- `backend/src/routes/posts.ts` — schema max raised to 25000; dynamic limit check (`is_premium ? 25000 : 280`) enforced after account fetch
- `backend/src/services/ai/prompts.ts` — `buildSystemPrompt(language)` and `buildAnalysisSystemPrompt(language)` now accept language param and inject explicit language instruction into AI prompt
- `backend/src/services/ai/suggest.ts` — fetches account `language` and passes to `buildAnalysisSystemPrompt`
- `backend/src/routes/ai.ts` — fetches account `language` on approval; passes to `buildSystemPrompt`
- `backend/src/services/ai/auto-flow.ts` — fetches account `language`; passes to `buildSystemPrompt`

---

## [2026-02-25 23:00 UTC] FLOW-001 through FLOW-005 — FLOW epic backend implementation

**Agent:** claude-opus-4-6
**Task:** FLOW-001, FLOW-002, FLOW-003, FLOW-004, FLOW-005
**Commit:** 3af2f63

### Files Created

- `supabase/migrations/014_news_sites_auto_flow.sql` — adds `auto_flow BOOLEAN NOT NULL DEFAULT false` to `news_sites`
- `supabase/migrations/015_ai_suggestions_nullable_text.sql` — makes `suggestion_text` nullable in `ai_suggestions`
- `backend/src/services/ai/auto-flow.ts` — new `AutoFlowService` class: full automatic pipeline (fetch content → generate tweet → generate summary → publish to X)

### Files Modified

- `backend/src/schemas/sites.schema.ts` — added `auto_flow` to create and update Zod schemas
- `backend/src/routes/sites.ts` — added `autoFlow` to `toPublicSite()` response, create payload, and update handler
- `backend/src/services/ai/prompts.ts` — added `buildAnalysisSystemPrompt()`, `parseAnalysisResponse()`, `buildFullContentUserPrompt()`, and `AnalysisResult` type
- `backend/src/services/ai/suggest.ts` — fully rewritten: analysis phase (title+summary only), creates pending suggestions with null text, auto-flow delegation
- `backend/src/routes/ai.ts` — refactored approval endpoint: fetches full content, generates tweet with publication rules, generates summary, marks article processed; rejection marks processed too
- `backend/src/types/database.ts` — added `auto_flow` to news_sites types; made `suggestion_text` nullable in ai_suggestions types

### Summary

Implemented the full FLOW epic backend (FLOW-001 through FLOW-005). The AI pipeline now separates analysis (cheap title+summary filtering) from publication (full-content tweet generation on approval). Sites can opt into auto-flow for fully automatic publishing. The approval endpoint now generates both the tweet and article summary using full article content with publication prompt rules.

---

## [2026-02-25 21:00 UTC] ad-hoc — Root CLAUDE.md + README update + PLANEJAMENTO deprecation

**Agent:** claude-sonnet-4-6
**Task:** ad-hoc
**Commit:** 3af2f63

### Files Created

- `CLAUDE.md` (root) — comprehensive AI context file with all business rules, news flow lifecycle (5 phases), data model (migrations 001–013), AI pipeline with prompt rules, API route map, file structure, workspace rules, and environment variables

### Files Modified

- `README.md` — updated features list, tech stack (DeepSeek, recharts), documentation table, AI agent guidelines; added CLAUDE.md as first reading step for agents
- `PLANEJAMENTO.md` — added deprecation notice at top with pointers to CLAUDE.md and docs/ARCHITECTURE.md; listed key differences from original planning

### Summary

Created the root `CLAUDE.md` file following the Claude Code convention (auto-loaded in every session). It consolidates all business rules — especially the critical full-article-content rule for approval — and is the authoritative context file for any AI agent working on this project. Updated README and deprecated the outdated PLANEJAMENTO.md.

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
