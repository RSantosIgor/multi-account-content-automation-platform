# CLAUDE.md — batchNews AI Context

> **Read this file first.** This is the authoritative context file for any AI agent working on batchNews.
> Every time the user defines a new business rule, it must be added here.

---

## Quick Navigation

- [Project Purpose](#1-project-purpose)
- [Current State](#2-current-state)
- [Business Rules](#3-business-rules)
- [News Flow Lifecycle](#4-news-flow-lifecycle--critical)
- [Data Model](#5-data-model)
- [AI Pipeline & Prompt Rules](#6-ai-pipeline--prompt-rules)
- [Architecture Principles](#7-architecture-principles)
- [API Route Map](#8-api-route-map)
- [File Structure](#9-file-structure)
- [Workspace Rules](#10-workspace-rules)
- [Environment Variables](#11-environment-variables)

---

## 1. Project Purpose

**batchNews** is a multi-tenant platform that automates social media content creation for X (Twitter):

1. Users register one or more **X accounts**
2. Each X account has **news sites** scraped periodically (RSS-first, HTML fallback)
3. Scraped articles are filtered and processed by **AI** to generate tweet suggestions
4. Users review suggestions on a **timeline** and publish directly to X
5. Custom **prompt rules** per account let users control AI writing style and content filters

---

## 2. Current State

### Implementation Status (as of 2026-03-19)

| Epic     | Status | Description                                                                                                                                  |
| -------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| SETUP    | DONE   | Monorepo, tooling, env setup                                                                                                                 |
| DB       | DONE   | All migrations (001–029), RLS policies                                                                                                       |
| CORE     | DONE   | Auth, JWT middleware, role-based access                                                                                                      |
| AUTH     | DONE   | Login, register, forgot-password, Supabase SSR                                                                                               |
| XACCOUNT | DONE   | X OAuth 2.0 PKCE, token encryption, account management                                                                                       |
| SITES    | DONE   | (Legacy — superseded by UNIFY epic)                                                                                                          |
| SCRAPER  | DONE   | RSS parser, Cheerio HTML, scraping utilities                                                                                                 |
| AI       | DONE   | OpenAI/Anthropic/DeepSeek providers, suggestion CRUD                                                                                         |
| TIMELINE | DONE   | Unified timeline, detail stepper (content→suggestion→post)                                                                                   |
| POSTS    | DONE   | Publish to X, post history, error tracking                                                                                                   |
| ADMIN    | DONE   | Admin panel, user role management                                                                                                            |
| UX       | DONE   | Dashboard redesign, account settings, prompt rules UI, breadcrumbs, stats, responsiveness audit, account overview redesign (UX-001–010)      |
| FLOW     | DONE   | AI analysis phase, tweet gen on approval, auto-flow, 4-phase stepper                                                                         |
| FEAT     | TODO   | X Premium, language selector, TanStack Query, smooth state                                                                                   |
| SRC      | DONE   | Multi-source ingestion: YouTube, X feeds, newsletters, unified content, force-run buttons (SRC-001–010)                                      |
| EDT      | DONE   | Editorial intelligence: tags, clusters, briefs, contextual gen, auto-generate per angle, frontend panel, dashboard integration (EDT-001–009) |
| UNIFY    | DONE   | Unified content pipeline: news_site_sources, auto_flow on all sources, drop legacy tables (UNIFY-001–010)                                    |
| INFRA    | TODO   | Deployment, CI/CD, monitoring, backup                                                                                                        |

### Key New Features (UX Epic, Feb 2026)

- **Article summaries**: bullet-point summaries generated on approval, displayed in timeline
- **Prompt rules**: per-account AI rules for analysis and publication phases
- **Dashboard redesign**: tabs for Pending / Published / Rejected with account selector
- **Account settings**: data view + prompt rule management
- **Detail page**: vertical stepper showing article → suggestion → post progression
- **Statistics**: daily posting charts with date range filters
- **Breadcrumb navigation**: on all deep pages
- **Rejection step**: rejected suggestions show a dedicated rejection card in the stepper

---

## 3. Business Rules

### 3.1 Multi-Tenancy

- Every resource is owned by a user via the `x_accounts.user_id` FK chain
- RLS policies enforce data isolation at the DB level (defense-in-depth)
- Users can only see/modify their own accounts, sites, articles, suggestions, posts
- Admins (`user_roles.role = 'admin'`) have global read access

### 3.2 X Account Management

- X accounts are connected via **OAuth 2.0 PKCE** — no client secrets in frontend
- `oauth_access_token_enc` and `oauth_refresh_token_enc` are AES-256-GCM encrypted at rest
- Tokens are **never returned by any API response** — used internally only
- Tokens are refreshed automatically before expiry when posting
- An account can be deactivated (`is_active = false`) without disconnecting

### 3.3 News Sites

- Each news site belongs to one X account
- `source_type` controls scraping method: `'rss'` | `'html'` | `'auto'`
- `auto` tries RSS first; falls back to Cheerio HTML if RSS fails
- RSS is preferred: it is legally safer and more reliable than HTML scraping
- HTML scraping respects `robots.txt`, adds 2s+ delay, uses realistic User-Agent
- On site creation, backend auto-detects RSS via `<link rel="alternate" type="application/rss+xml">`
- Articles are deduplicated by `UNIQUE(news_site_id, url)` — ON CONFLICT DO NOTHING

### 3.4 AI Suggestion Lifecycle

```
pending → approved → posted
        ↘ rejected
```

- `pending`: AI suggestion created, awaiting user review
- `approved`: user approved (or auto-flow approved); full content used for final tweet
- `rejected`: user rejected; no post will be published; shown in rejection stepper
- `posted`: published to X; has linked record in `posts` table

### 3.5 Content Security

- No `dangerouslySetInnerHTML` in frontend
- No direct Supabase DB queries from frontend — all access through backend API
- No `SUPABASE_SERVICE_ROLE_KEY` or `ENCRYPTION_KEY` in frontend code
- No JWT tokens in `localStorage` — Supabase SSR uses HTTPOnly cookies
- All backend routes (except `GET /health`) require `Authorization: Bearer <supabase_jwt>`

---

## 4. News Flow Lifecycle — CRITICAL

> This is the most important business rule. Read carefully before touching AI or scraping code.

### Phase 1 — Ingest (cheap)

- All source types (news sites, YouTube, X feeds, newsletters) ingest into `content_items`
- RSS or Cheerio fetches `title` + `summary` (max ~500 chars) + `url`
- Stored in `content_items`: `is_processed = false`
- **Does NOT fetch full content at this stage** (saves bandwidth and cost)

### Phase 2 — Analysis

- AI uses only `title + summary` (cheap, fast tokens) to decide if content is worth suggesting
- Uses **analysis prompt rules** (`prompt_rules.rule_type = 'analysis'`) for filtering
- If relevant → creates `ai_suggestions` record (`status: pending`, `suggestion_text: NULL`)
- If not relevant → marks `is_processed = true` and skips
- **`suggestion_text` is NULL at this stage** — the tweet is only generated on approval (Phase 4)

### Phase 3 — Tweet Generation (on approval)

- Triggered when user approves a pending suggestion (`PATCH /ai/suggestions/:id/status`)
- Fetches full content from URL (or reuses `content_items.full_content` cache)
- AI generates tweet using **publication prompt rules** + full content
- Generates bullet-point summary via `summarizer.ts`
- Saves tweet text + hashtags + summary in `ai_suggestions`
- Marks `content_items.is_processed = true`

### Phase 4 — Manual Approval

- User reviews suggestion on Timeline or Dashboard
- On approval:
  1. **MUST fetch full content** from `content_items.url` via `fetchArticleContent()` in `article-fetcher.ts`
  2. Cache result in `content_items.full_content` (avoid re-fetching on retry)
  3. Re-generate the tweet using the **full content body** (higher quality)
  4. Generate bullet-point summary via `generateArticleSummary()` in `summarizer.ts`
  5. Save summary in `ai_suggestions.article_summary` (JSONB: `{ bullets: string[] }`)
  6. Update `ai_suggestions.status = 'approved'`
- On rejection:
  1. Update `ai_suggestions.status = 'rejected'`
  2. Record `reviewed_at` and `reviewed_by`
  3. No post is created

> **Why full content on approval?** Initial ingestion uses only the RSS summary (cheap, fast).
> When the user decides to publish, quality matters — the AI should see the complete content
> to produce an accurate and engaging tweet. `full_content` is a cache: if already
> fetched, reuse it; if not, fetch from `url` and persist before calling AI.

### Phase 5 — Publication

- Backend calls `POST /2/tweets` via X API v2 using the approved account's decrypted token
- Creates record in `posts` table with `x_post_id`, `x_post_url`, `status = 'published'`
- Updates `ai_suggestions.status = 'posted'`

### Phase 6 — Auto-Flow

- A fully automatic path: Ingest → Analysis → Generate → Approve → Publish with no human review
- Also uses full content on the generation step (same rule as Phase 3)
- Configurable **per source** via `auto_flow` column on any `*_sources` table (opt-in)
- Implemented in `backend/src/services/ai/auto-flow.ts` (`AutoFlowService`)

---

## 5. Data Model

### Migrations Applied

| File                                       | Description                                                                                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `001_extensions.sql`                       | PostgreSQL extensions (uuid-ossp, pgcrypto)                                                                                                        |
| `002_user_profiles.sql`                    | User display name and avatar                                                                                                                       |
| `003_user_roles.sql`                       | admin / member roles                                                                                                                               |
| `004_x_accounts.sql`                       | X account table with encrypted token columns                                                                                                       |
| `005_news_sites.sql`                       | News site table with RSS/HTML config                                                                                                               |
| `006_scraped_articles.sql`                 | Scraped articles with deduplication constraint                                                                                                     |
| `007_ai_suggestions.sql`                   | AI suggestions with status lifecycle                                                                                                               |
| `008_posts.sql`                            | Published post history                                                                                                                             |
| `009_scraping_runs.sql`                    | Scraping run execution log                                                                                                                         |
| `010_oauth_state.sql`                      | Temporary PKCE code_verifier storage (10min TTL)                                                                                                   |
| `011_rls_policies.sql`                     | Row Level Security policies for all tables                                                                                                         |
| `012_article_summaries.sql`                | Added `scraped_articles.full_article_content` TEXT and `ai_suggestions.article_summary` JSONB                                                      |
| `013_prompt_rules.sql`                     | New `prompt_rules` table for per-account AI rules                                                                                                  |
| `014_news_sites_auto_flow.sql`             | Added `news_sites.auto_flow` BOOLEAN column                                                                                                        |
| `015_ai_suggestions_nullable_text.sql`     | Made `ai_suggestions.suggestion_text` nullable                                                                                                     |
| `016_x_accounts_is_premium.sql`            | Added `x_accounts.is_premium` BOOLEAN column                                                                                                       |
| `017_x_accounts_language.sql`              | Added `x_accounts.language` column                                                                                                                 |
| `018_content_items.sql`                    | New `content_items` unified content table (SRC-001)                                                                                                |
| `019_youtube_sources.sql`                  | New `youtube_sources` table (SRC-003)                                                                                                              |
| `020_x_feed_sources.sql`                   | New `x_feed_sources` table (SRC-004)                                                                                                               |
| `021_newsletter_sources.sql`               | New `newsletter_sources` table (SRC-005)                                                                                                           |
| `022_content_items_rls.sql`                | RLS policies for `content_items` and source tables                                                                                                 |
| `023_bridge_articles_to_content_items.sql` | Bridge `scraped_articles.content_item_id` FK                                                                                                       |
| `024_ai_suggestions_content_item.sql`      | Added `ai_suggestions.content_item_id` FK; `newsletter_sources.feed_url` + `last_scraped_at`                                                       |
| `025_content_tags.sql`                     | New `content_tags` table for AI-extracted thematic tags (EDT-001)                                                                                  |
| `026_editorial_clusters.sql`               | New `editorial_clusters`, `cluster_items`, `editorial_briefs`; extends `ai_suggestions` with `editorial_brief_id` + `source_content_ids` (EDT-003) |
| `027_ai_suggestions_nullable_article.sql`  | Made `ai_suggestions.scraped_article_id` nullable (prep for UNIFY)                                                                                 |
| `028_unify_news_site_sources.sql`          | New `news_site_sources` table, `auto_flow` on all source tables, backfill from `news_sites` (UNIFY-001)                                            |
| `029_drop_legacy_tables.sql`               | Drops `scraped_articles`, `scraping_runs`, `news_sites`, bridge trigger (UNIFY-009)                                                                |

### Key Tables

#### `content_items` (unified content layer)

| Column           | Type        | Notes                                                                             |
| ---------------- | ----------- | --------------------------------------------------------------------------------- |
| id               | uuid PK     |                                                                                   |
| x_account_id     | uuid FK     |                                                                                   |
| source_type      | text        | `news_article` / `youtube_video` / `x_post` / `newsletter`                        |
| source_table     | text        | `news_site_sources` / `youtube_sources` / `x_feed_sources` / `newsletter_sources` |
| source_record_id | uuid        | FK to the specific source row                                                     |
| url              | text        | UNIQUE with source_type + x_account_id                                            |
| title            | text        |                                                                                   |
| summary          | text        |                                                                                   |
| full_content     | text        | **Fetched on approval; cached for reuse. NULL until first approval.**             |
| metadata         | jsonb       | Source-specific data (siteName, channelTitle, etc.)                               |
| is_processed     | boolean     | true when AI has processed this item                                              |
| published_at     | timestamptz |                                                                                   |
| created_at       | timestamptz |                                                                                   |

#### `ai_suggestions`

| Column              | Type        | Notes                                               |
| ------------------- | ----------- | --------------------------------------------------- |
| id                  | uuid PK     |                                                     |
| content_item_id     | uuid FK     | Links to content_items                              |
| x_account_id        | uuid FK     |                                                     |
| suggestion_text     | text        | Tweet text (≤ 280 chars, nullable until generation) |
| hashtags            | text[]      |                                                     |
| status              | text        | `pending` / `approved` / `rejected` / `posted`      |
| ai_model_used       | text        | e.g. `gpt-4o-mini`, `claude-haiku-4-5`              |
| created_at          | timestamptz |                                                     |
| reviewed_at         | timestamptz |                                                     |
| reviewed_by         | uuid FK     |                                                     |
| **article_summary** | jsonb       | **`{ bullets: string[] }` — generated on approval** |
| editorial_brief_id  | uuid FK     | Links to editorial_briefs (if editorial suggestion) |
| source_content_ids  | uuid[]      | Multi-source references for editorial suggestions   |

#### `prompt_rules` (added in 013)

| Column       | Type        | Notes                                          |
| ------------ | ----------- | ---------------------------------------------- |
| id           | uuid PK     |                                                |
| x_account_id | uuid FK     | Which account owns this rule                   |
| rule_type    | text        | `'analysis'` or `'publication'`                |
| rule_name    | text        | Human-readable label                           |
| prompt_text  | text        | Instruction appended to the base AI prompt     |
| is_active    | boolean     | Can be toggled without deleting                |
| priority     | integer     | Lower number = higher priority (applied first) |
| created_at   | timestamptz |                                                |
| updated_at   | timestamptz |                                                |

### Entity Relationships

```
auth.users (Supabase managed)
    │
    ├──< user_profiles       (1:1)
    ├──< user_roles          (1:1)
    └──< x_accounts          (1:N)
              │
              ├──< news_site_sources    (1:N) ──< content_items (1:N)
              ├──< youtube_sources      (1:N) ──< content_items (1:N)
              ├──< x_feed_sources       (1:N) ──< content_items (1:N)
              ├──< newsletter_sources   (1:N) ──< content_items (1:N)
              │
              ├──< content_items        (1:N)
              │         └──< ai_suggestions  (1:N)
              │
              ├──< posts               (1:N)
              │         └── ai_suggestion_id (nullable FK)
              │
              └──< prompt_rules        (1:N)
```

---

## 6. AI Pipeline & Prompt Rules

### AI Provider Selection

Configured via `AI_PROVIDER` env var:

| Value       | SDK                   | Recommended model  |
| ----------- | --------------------- | ------------------ |
| `openai`    | `openai`              | `gpt-4o-mini`      |
| `anthropic` | `@anthropic-ai/sdk`   | `claude-haiku-4-5` |
| `deepseek`  | openai-compatible SDK | `deepseek-chat`    |

Provider interface (`backend/src/services/ai/provider.ts`):

```typescript
interface AiProvider {
  generateSuggestion(title: string, summary: string, accountId?: string): Promise<AiSuggestion>;
  generateRaw(systemPrompt: string, userContent: string): Promise<string>;
}
```

### Prompt Building

`backend/src/services/ai/prompt-builder.ts` provides two functions:

- `buildAnalysisPrompt(xAccountId, basePrompt)` — loads active `analysis` rules, appends to base
- `buildPublicationPrompt(xAccountId, basePrompt)` — loads active `publication` rules, appends to base

Rules are ordered by `priority ASC` and appended in sequence.

### Article Summary Generation

`backend/src/services/ai/summarizer.ts`:

- Input: article title + full content
- Output: `{ bullets: string[] }` (3–5 bullets, same language as article)
- Fallback: `{ bullets: [title] }` if AI fails

### Full Article Fetching

`backend/src/services/scraper/article-fetcher.ts`:

- Fetches URL, strips HTML with Cheerio
- Tries common selectors: `article`, `.article-content`, `.entry-content`, `main`
- Returns plain text content
- Called during approval flow before AI re-generation

### Circuit Breaker

All AI providers implement a circuit-breaker pattern: if the provider returns a fatal error (invalid API key, quota exhausted), further calls are blocked until the process restarts or the error clears. This prevents cascading failures.

---

## 7. Architecture Principles

1. **Frontend is UI-only** — no business logic, no direct DB calls, no scraping, no AI calls
2. **All backend calls go through `lib/api/client.ts`** — typed fetch wrapper with JWT injection
3. **Supabase = Auth + DB only** — no Edge Functions, no Storage, no Realtime
4. **RLS as defense-in-depth** — DB blocks cross-tenant access even if backend has bugs
5. **Stateless backend** — no sessions; auth state lives in Supabase JWT via HTTPOnly cookies
6. **Single responsibility per service** — each file does one thing
7. **Zod for all validation** — request bodies validated on backend; forms validated on frontend
8. **Never return OAuth tokens** from any API response — decrypt only in-memory during use

---

## 8. API Route Map

All routes prefixed with `/api/v1/` and require `Authorization: Bearer <jwt>` (except `/health`).

### Health

```
GET  /health
```

### X OAuth

```
GET  /api/v1/x/oauth/start              → Generates OAuth PKCE URL
GET  /api/v1/x/oauth/callback           → Exchanges code for tokens, stores encrypted
```

### Accounts

```
GET    /api/v1/accounts                         → List user's X accounts
DELETE /api/v1/accounts/:id                     → Disconnect X account
PATCH  /api/v1/accounts/:id                     → Update account (e.g., is_active)
GET    /api/v1/accounts/:accountId/stats        → Posting statistics with date range
```

### Prompt Rules

```
GET    /api/v1/accounts/:accountId/prompt-rules          → List rules (optional ?type=)
POST   /api/v1/accounts/:accountId/prompt-rules          → Create rule
PUT    /api/v1/accounts/:accountId/prompt-rules/:ruleId  → Update rule
DELETE /api/v1/accounts/:accountId/prompt-rules/:ruleId  → Delete rule
```

### Sources (all content types)

```
GET    /api/v1/accounts/:accountId/sources/news-sites                           → List news site sources
POST   /api/v1/accounts/:accountId/sources/news-sites                           → Create news site source (auto-detects RSS)
PUT    /api/v1/accounts/:accountId/sources/news-sites/:sourceId                 → Update news site source
DELETE /api/v1/accounts/:accountId/sources/news-sites/:sourceId                 → Delete news site source
POST   /api/v1/accounts/:accountId/sources/news-sites/:sourceId/run             → Force-run news site ingestion
POST   /api/v1/accounts/:accountId/sources/news-sites/:sourceId/test            → Scraping preview (no save)

GET    /api/v1/accounts/:accountId/sources/youtube                              → List YouTube sources
POST   /api/v1/accounts/:accountId/sources/youtube                              → Create YouTube source
PUT    /api/v1/accounts/:accountId/sources/youtube/:sourceId                    → Update YouTube source
DELETE /api/v1/accounts/:accountId/sources/youtube/:sourceId                    → Delete YouTube source
POST   /api/v1/accounts/:accountId/sources/youtube/:sourceId/run                → Force-run YouTube ingestion

GET    /api/v1/accounts/:accountId/sources/x-feeds                              → List X feed sources
POST   /api/v1/accounts/:accountId/sources/x-feeds                              → Create X feed source
PUT    /api/v1/accounts/:accountId/sources/x-feeds/:sourceId                    → Update X feed source
DELETE /api/v1/accounts/:accountId/sources/x-feeds/:sourceId                    → Delete X feed source
POST   /api/v1/accounts/:accountId/sources/x-feeds/:sourceId/run               → Force-run X feed ingestion

GET    /api/v1/accounts/:accountId/sources/newsletters                          → List newsletter sources
POST   /api/v1/accounts/:accountId/sources/newsletters                          → Create newsletter source
PUT    /api/v1/accounts/:accountId/sources/newsletters/:sourceId                → Update newsletter source
DELETE /api/v1/accounts/:accountId/sources/newsletters/:sourceId                → Delete newsletter source
```

### AI Suggestions

```
POST   /api/v1/ai/suggest/:contentItemId         → Generate suggestion for content item
PATCH  /api/v1/ai/suggestions/:id/status         → Approve / reject (triggers full-content fetch on approve)
```

### Timeline

```
GET    /api/v1/accounts/:accountId/timeline              → Paginated list (suggestions + posts)
GET    /api/v1/timeline/items/:id                        → Full detail (article + suggestion + post)
```

### Posts

```
POST   /api/v1/accounts/:accountId/posts                 → Publish to X
GET    /api/v1/accounts/:accountId/posts                 → Post history
```

### Admin (role = admin required)

```
GET    /api/v1/admin/users                               → List all users
PATCH  /api/v1/admin/users/:id/role                      → Change user role
```

---

## 9. File Structure

### Backend (`backend/src/`)

```
backend/src/
├── server.ts                     ← entry point: build app, register jobs, listen
├── app.ts                        ← Fastify instance + plugin registration
├── config.ts                     ← typed env config (Zod)
├── routes/
│   ├── index.ts                  ← registers all route modules
│   ├── accounts.ts               ← GET, DELETE, PATCH /accounts
│   ├── sites.ts                  ← CRUD + test + run history
│   ├── scrape.ts                 ← manual scrape triggers
│   ├── ai.ts                     ← suggest + approve/reject (triggers full-content + summary)
│   ├── posts.ts                  ← publish + history
│   ├── timeline.ts               ← paginated list + item detail
│   ├── prompt-rules.ts           ← CRUD for per-account prompt rules
│   ├── stats.ts                  ← daily stats with date range
│   ├── x-oauth.ts                ← PKCE start + callback
│   └── admin.ts                  ← admin user management
├── services/
│   ├── scraper/
│   │   ├── rss.ts                ← RSS/Atom feed parsing
│   │   ├── html.ts               ← Cheerio HTML scraping
│   │   ├── rss-detector.ts       ← auto-detect RSS feed URL
│   │   └── article-fetcher.ts    ← fetches + parses full article text from URL
│   ├── ingest/
│   │   ├── news-site-ingester.ts ← RSS/HTML → content_items for news sites
│   │   ├── youtube-ingester.ts   ← YouTube API → content_items
│   │   ├── x-feed-ingester.ts    ← X API → content_items
│   │   └── newsletter-ingester.ts← RSS → content_items for newsletters
│   ├── ai/
│   │   ├── provider.ts           ← AiProvider interface + factory
│   │   ├── openai.ts             ← OpenAI implementation (circuit-breaker)
│   │   ├── anthropic.ts          ← Anthropic implementation (circuit-breaker)
│   │   ├── deepseek.ts           ← DeepSeek implementation (circuit-breaker)
│   │   ├── suggest.ts            ← orchestrates analysis + suggestion creation
│   │   ├── auto-flow.ts          ← full auto pipeline: analyze → generate → publish
│   │   ├── summarizer.ts         ← generates bullet-point article summaries
│   │   ├── prompt-builder.ts     ← loads + combines base prompt with custom rules
│   │   └── prompts.ts            ← base prompt templates (analysis + publication)
│   └── x-api/
│       ├── client.ts             ← twitter-api-v2 wrapper (decrypt token, call API)
│       └── oauth.ts              ← PKCE generate/exchange/refresh helpers
├── jobs/
│   └── index.ts                  ← node-cron job registration (every 4h)
├── plugins/
│   ├── authenticate.ts           ← Supabase JWT verification hook
│   └── authorize.ts              ← role-based access hook
├── lib/
│   ├── supabase.ts               ← Supabase client (service role key)
│   └── crypto.ts                 ← AES-256-GCM encrypt/decrypt
├── schemas/
│   └── sources.schema.ts         ← Zod schemas for all source types
└── types/
    ├── database.ts               ← generated by Supabase CLI
    └── fastify.d.ts              ← Fastify type augmentations (request.user)
```

### Frontend (`frontend/`)

```
frontend/
├── app/
│   ├── (auth)/                   ← public routes
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   └── (app)/                    ← protected routes (requires Supabase session)
│       ├── layout.tsx            ← sticky sidebar + header
│       ├── dashboard/            ← Pending/Published/Rejected tabs + AccountSelector
│       ├── accounts/             ← Account list (former dashboard)
│       │   └── [accountId]/
│       │       ├── page.tsx      ← Account overview
│       │       ├── sources/      ← All content source management (tabs)
│       │       ├── timeline/
│       │       │   ├── page.tsx
│       │       │   └── [itemId]/ ← Detail page (article→suggestion→post stepper)
│       │       ├── settings/     ← Account data + Prompt Rules tabs
│       │       └── stats/        ← Daily chart + metrics cards
│       └── admin/                ← User management (admin only)
├── components/
│   ├── ui/                       ← shadcn/ui generated (DO NOT edit manually)
│   ├── layout/                   ← AppSidebar, AppHeader, Breadcrumb
│   ├── accounts/
│   │   └── settings/             ← AccountDataTab, PromptRulesTab, PromptRuleForm, PromptRuleList
│   ├── dashboard/                ← AccountSelector, PendingPostsSection, PublishedPostsSection, RejectedPostsSection
│   ├── sources/                  ← SourceTabs, NewsSiteSourceTable, YouTubeSourceTable, XFeedSourceTable, NewsletterSourceTable
│   ├── stats/                    ← DateRangeFilter, MetricsCards, PostingChart (recharts)
│   └── timeline/
│       ├── TimelineItem.tsx
│       ├── SuggestionCard.tsx    ← shows article_summary bullets; pending state for null text
│       ├── PostCard.tsx
│       └── detail/               ← DetailStepper (4 phases), AnalysisStep, OriginalArticleStep, SuggestionStep, PublicationStep, RejectionStep
└── lib/
    ├── api/client.ts             ← typed fetch wrapper for all backend calls (auto JWT)
    └── supabase/
        ├── client.ts             ← browser Supabase client
        └── server.ts             ← SSR Supabase client
```

---

## 10. Workspace Rules

### Before Making Any Change

1. Read the workspace `AGENTS.md` (frontend or backend)
2. Read `docs/ARCHITECTURE.md` for architectural context
3. Read the workspace `CHANGELOG.md` for recent changes
4. Check `docs/TASKS.md` for assigned task acceptance criteria

### After Every Change

1. Append an entry to the workspace `CHANGELOG.md` (prepend — newest first)
2. Update `docs/TASKS.md` task status if applicable
3. Update **this file** (`CLAUDE.md`) if new business rules were added

### Coding Standards

- **TypeScript strict mode** — no `any` types; use `unknown` + narrowing
- **Server Components by default** — `'use client'` only for interactivity/hooks
- **shadcn/ui** as base — never build raw HTML replacements for covered components
- **All backend calls through `lib/api/client.ts`** — never call `fetch()` directly in components
- **Forms**: `react-hook-form` + `zod` resolver
- **No `console.log`** in production code — use error boundaries and toast notifications

### Libraries

| Purpose       | Library                                  |
| ------------- | ---------------------------------------- |
| Framework     | `next` 16                                |
| Auth          | `@supabase/ssr`, `@supabase/supabase-js` |
| UI components | `shadcn/ui` (via CLI), `lucide-react`    |
| Styling       | `tailwindcss`                            |
| Forms         | `react-hook-form`, `@hookform/resolvers` |
| Validation    | `zod`                                    |
| Dates         | `date-fns`                               |
| Charts        | `recharts`                               |
| HTTP client   | `fetch` via `lib/api/client.ts`          |

---

## 11. Environment Variables

### Backend (`backend/.env`)

```bash
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Generate: node -e "require('crypto').randomBytes(32).toString('hex')"
ENCRYPTION_KEY=<64_hex_chars>

X_CLIENT_ID=<oauth2_client_id>
X_CLIENT_SECRET=<oauth2_client_secret>
X_CALLBACK_URL=http://localhost:3001/api/v1/x/oauth/callback

# AI Provider: 'openai' | 'anthropic' | 'deepseek'
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com

CRON_SECRET=<random_secret>
```

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Security:** `SUPABASE_SERVICE_ROLE_KEY` and `ENCRYPTION_KEY` must NEVER appear in frontend code.

---

## 12. Key Conventions

### Full Content Rule

> When AI generates the **final tweet** (on approval — manual or auto), it MUST use the full content
> text from `content_items.full_content`, not the RSS summary.
>
> - If `full_content` is already populated: reuse it (no extra HTTP request)
> - If `full_content` is NULL: call `fetchArticleContent(url)`, persist the result, then call AI
>
> This rule applies to: manual approval (`PATCH /ai/suggestions/:id/status`), auto-flow approval.

### Prompt Rule Application

> Publication prompt rules are applied **at generation time** (when building the prompt for the AI).
> Analysis prompt rules are applied at the **filtering/analysis phase** (FLOW-003, not yet implemented).
> Both rule types are stored in the same `prompt_rules` table, differentiated by `rule_type`.

### API Versioning

> All routes under `/api/v1/`. When breaking changes are needed, increment to `/api/v2/`.

### Pagination

> List endpoints support `?page=1&limit=20`. Response includes `{ data: [], pagination: { page, limit, total } }`.

---

_Last updated: 2026-03-19 (UNIFY epic completed — unified content pipeline)_
_Update this file whenever new business rules are defined._
