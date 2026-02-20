# batchNews — System Architecture

> This document is the single source of truth for architectural decisions.
> All tasks in `TASKS.md` reference this document.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Component Breakdown](#3-component-breakdown)
4. [Tech Stack & Rationale](#4-tech-stack--rationale)
5. [Database Design](#5-database-design)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Scraping Pipeline](#7-scraping-pipeline)
8. [AI Pipeline](#8-ai-pipeline)
9. [X OAuth Flow](#9-x-oauth-flow)
10. [Scheduled Jobs](#10-scheduled-jobs)
11. [Security Model](#11-security-model)
12. [API Design Conventions](#12-api-design-conventions)
13. [Folder Structure](#13-folder-structure)
14. [Naming Conventions](#14-naming-conventions)
15. [Environment Variables](#15-environment-variables)
16. [Testing Strategy](#16-testing-strategy)

---

## 1. System Overview

**batchNews** is a multi-tenant platform that automates social media content creation:

1. Users register one or more **X (Twitter) accounts**
2. Each X account has associated **news sites** for periodic content collection (RSS-first, HTML fallback)
3. Collected articles are processed by an **AI** to generate post suggestions
4. Users review suggestions on a **timeline** and publish directly to X

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 16)               │
│   App Router · shadcn/ui · Supabase SSR Auth         │
│   No direct DB access — all requests go to backend   │
└────────────────────────┬─────────────────────────────┘
                         │ HTTP REST (JWT Bearer)
┌────────────────────────▼─────────────────────────────┐
│                  BACKEND (Fastify + Node.js)          │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ REST Routes  │  │  Services    │  │  Cron Jobs │ │
│  │ (accounts,   │  │  (scraper,   │  │ (node-cron)│ │
│  │  sites, ai,  │  │   ai, x-api, │  │            │ │
│  │  posts, etc) │  │   crypto)    │  └────────────┘ │
│  └──────────────┘  └──────────────┘                  │
└────┬───────────────────┬──────────────┬──────────────┘
     │                   │              │
┌────▼──────┐    ┌───────▼─────┐  ┌────▼──────────┐
│ Supabase  │    │  X API v2   │  │  AI Provider  │
│ Auth + DB │    │ (OAuth 2.0) │  │(OpenAI/Claude)│
│(PostgreSQL│    └─────────────┘  └───────────────┘
│  + RLS)   │
└───────────┘
```

### Key Architectural Principles

- **Separation of concerns**: Frontend is UI-only. Backend owns all business logic.
- **Supabase as infrastructure**: Used exclusively for Auth and PostgreSQL. No Edge Functions, no Storage, no Realtime.
- **RLS as defense-in-depth**: Row Level Security protects data even if the backend is bypassed.
- **Stateless backend**: The Fastify server is stateless (no sessions); auth state lives in the Supabase JWT.
- **Single responsibility per service**: Each service file does one thing (scraper/rss.ts, scraper/html.ts, ai/suggest.ts, etc.).

---

## 3. Component Breakdown

### Frontend — `frontend/`

| Responsibility                  | Yes | No  |
| ------------------------------- | --- | --- |
| Render UI                       | ✓   |     |
| Handle user auth (Supabase SSR) | ✓   |     |
| Call backend REST API           | ✓   |     |
| Direct DB queries               |     | ✓   |
| Business logic                  |     | ✓   |
| Scraping / AI / X API calls     |     | ✓   |

### Backend — `backend/`

| Responsibility                           | Yes |
| ---------------------------------------- | --- |
| Validate & handle all API requests       | ✓   |
| Verify Supabase JWT on every request     | ✓   |
| Scraping (RSS + HTML)                    | ✓   |
| AI suggestion generation                 | ✓   |
| X OAuth 2.0 PKCE flow                    | ✓   |
| Posting to X API                         | ✓   |
| Token encryption/decryption              | ✓   |
| Scheduled cron jobs                      | ✓   |
| Interact with Supabase DB (service role) | ✓   |

### Database — Supabase PostgreSQL

- All data persistence
- Row Level Security on every table
- Supabase Auth manages `auth.users`

---

## 4. Tech Stack & Rationale

| Layer                 | Technology                            | Version         | Rationale                                                           |
| --------------------- | ------------------------------------- | --------------- | ------------------------------------------------------------------- |
| Frontend framework    | Next.js                               | 16 (App Router) | SSR, file-based routing, built-in optimizations                     |
| UI library            | shadcn/ui + Tailwind CSS              | latest          | Accessible, unstyled primitives, full ownership of code             |
| Backend framework     | Fastify                               | 5.x             | Fast, TypeScript-native, plugin ecosystem, auto Swagger docs        |
| Database              | Supabase (PostgreSQL)                 | latest          | Managed Postgres, built-in Auth, RLS, CLI tooling                   |
| Auth                  | Supabase Auth                         | —               | JWT-based, integrates with RLS, no custom auth to maintain          |
| Scraping (structured) | rss-parser                            | latest          | Reliable RSS/Atom parsing, lightweight                              |
| Scraping (HTML)       | cheerio                               | latest          | jQuery-like HTML parsing, runs in Node (no browser needed)          |
| AI                    | openai / @anthropic-ai/sdk            | latest          | Configurable via env var; both SDKs have compatible APIs            |
| X integration         | twitter-api-v2                        | latest          | Full X API v2 support, OAuth 2.0 PKCE, typed responses              |
| Cron scheduler        | node-cron                             | latest          | Simple, zero-dependency cron inside the Fastify process             |
| Validation            | zod                                   | latest          | TypeScript-first schema validation, shared between frontend/backend |
| Form handling         | react-hook-form + @hookform/resolvers | latest          | Performant forms with Zod integration                               |
| Package manager       | pnpm                                  | latest          | Faster than npm, native workspace support                           |

---

## 5. Database Design

### Entity Relationship (simplified)

```
auth.users (Supabase managed)
    │
    ├──< user_profiles       (1:1 — extended profile)
    ├──< user_roles          (1:1 — role assignment)
    └──< x_accounts          (1:N — registered X accounts)
              │
              ├──< news_sites           (1:N — per account)
              │         │
              │         └──< scraped_articles  (1:N)
              │                   │
              │                   └──< ai_suggestions  (1:N)
              │
              └──< posts               (1:N — published to X)
                        └── ai_suggestion_id (nullable FK)
```

### Table Reference

| Table              | Purpose                                                     |
| ------------------ | ----------------------------------------------------------- |
| `user_profiles`    | Display name, avatar (extends `auth.users`)                 |
| `user_roles`       | Role per user: `admin` or `member`                          |
| `x_accounts`       | Registered X accounts with encrypted OAuth tokens           |
| `news_sites`       | Sites to scrape, with RSS URL and/or HTML selector config   |
| `scraped_articles` | Articles collected; title + summary only (not full content) |
| `ai_suggestions`   | AI-generated post suggestions with lifecycle status         |
| `posts`            | Published posts history with X post ID                      |
| `scraping_runs`    | Execution log for every scraping run                        |

### Common Column Conventions

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

All tables have an `updated_at` trigger:

```sql
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON <table>
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### `news_sites.source_type` Values

| Value    | Behavior                                     |
| -------- | -------------------------------------------- |
| `'rss'`  | Always use `feed_url`                        |
| `'html'` | Always use `scraping_config` selectors       |
| `'auto'` | Try RSS first → fall back to HTML on failure |

### `ai_suggestions.status` Lifecycle

```
pending → approved → posted
        ↘ rejected
```

---

## 6. Authentication & Authorization

### How Authentication Works

```
1. User logs in via Supabase Auth (frontend)
   → receives access_token (JWT) + refresh_token

2. Frontend stores session via @supabase/ssr (HTTPOnly cookie)

3. Every API call to Fastify includes:
   Authorization: Bearer <supabase_access_token>

4. Fastify verifyJWT plugin:
   → calls Supabase to validate the JWT
   → extracts user.id and attaches to request context

5. Route handlers use request.user.id for all DB queries

6. Supabase RLS policies enforce data isolation at DB level
   (defense-in-depth: even if backend has a bug, the DB blocks it)
```

### Role-Based Authorization

```
Supabase JWT custom claim: app_metadata.role = 'admin' | 'member'

Fastify middleware:
  fastify.authenticate   → verifies JWT (all protected routes)
  fastify.authorize()    → checks role claim (admin-only routes)
```

### Route Protection

| Route pattern             | Frontend                  | Backend                   |
| ------------------------- | ------------------------- | ------------------------- |
| `/(auth)/*`               | Public                    | —                         |
| `/(app)/*`                | Requires Supabase session | —                         |
| `/api/*` (except /health) | —                         | Requires valid JWT        |
| `/api/admin/*`            | —                         | Requires JWT + role=admin |

---

## 7. Scraping Pipeline

### Decision Tree

```
When a news_site is due for scraping:

  source_type = 'rss'  ──→ fetch feed_url → rss-parser → articles
  source_type = 'html' ──→ fetch url → cheerio → articles
  source_type = 'auto' ──→ try RSS first
                             ├─ success → articles
                             └─ fail → try HTML
                                          ├─ success → articles
                                          └─ fail → log error, stop
```

### RSS Auto-Detection (on site registration)

When a user adds a site, the backend:

1. Fetches the site URL
2. Searches for `<link rel="alternate" type="application/rss+xml">`
3. If found → sets `feed_url` and `source_type = 'rss'`
4. If not found → sets `source_type = 'html'`, prompts user to configure selectors

### Deduplication

`scraped_articles` has a `UNIQUE(news_site_id, url)` constraint.
On conflict → `ON CONFLICT DO NOTHING` (PostgreSQL upsert).

### Article Storage Policy

- Store: `title`, `summary` (max ~500 chars), `url`, `published_at`
- Do NOT store: full article body (saves storage and reduces AI token cost)

---

## 8. AI Pipeline

```
1. Scraping run completes → new articles in scraped_articles
   (is_processed = false)

2. ScraperRunner calls AiService.processNewArticles(x_account_id)

3. For each unprocessed article:
   a. Build prompt: title + summary → target: 280-char post + hashtags
   b. Call AI provider (OpenAI or Anthropic based on AI_PROVIDER env var)
   c. Parse response → extract post text + hashtags array
   d. Save to ai_suggestions (status: 'pending')
   e. Mark scraped_articles.is_processed = true

4. User sees suggestions in Timeline
```

### AI Provider Abstraction

```typescript
// backend/src/services/ai/provider.ts
interface AiProvider {
  generateSuggestion(title: string, summary: string): Promise<AiSuggestion>;
}

// Implementations: OpenAiProvider, AnthropicProvider
// Selected at runtime via AI_PROVIDER env var
```

---

## 9. X OAuth Flow

The X API requires **OAuth 2.0 with PKCE** for user-context actions (posting on behalf of users).

```
Frontend                    Backend (Fastify)              X API
   │                               │                          │
   │  GET /api/x/oauth/start       │                          │
   │──────────────────────────────>│                          │
   │                               │ Generate:                │
   │                               │  - code_verifier         │
   │                               │  - code_challenge        │
   │                               │ Store code_verifier      │
   │                               │ in DB (temp, 10min TTL)  │
   │  Redirect to X auth URL       │                          │
   │<──────────────────────────────│                          │
   │                               │                          │
   │  [User authorizes on X]       │                          │
   │──────────────────────────────────────────────────────────>
   │                               │                          │
   │  Redirect to /api/x/callback?code=...                    │
   │──────────────────────────────>│                          │
   │                               │ POST /2/oauth2/token     │
   │                               │ with code + code_verifier│
   │                               │─────────────────────────>│
   │                               │  access_token +          │
   │                               │  refresh_token           │
   │                               │<─────────────────────────│
   │                               │ encrypt(access_token)    │
   │                               │ encrypt(refresh_token)   │
   │                               │ save to x_accounts       │
   │  Redirect to /dashboard       │                          │
   │<──────────────────────────────│                          │
```

### Token Storage

```
Plain token  →  AES-256-GCM encrypt  →  stored in x_accounts.oauth_access_token_enc
                (ENCRYPTION_KEY env)
```

Tokens are **never returned by any API endpoint**. They are only used internally by the backend when posting to X.

---

## 10. Scheduled Jobs

Jobs run inside the Fastify process using `node-cron`. No external scheduler needed.

```typescript
// backend/src/jobs/index.ts
import cron from 'node-cron';
import { ScraperRunner } from '../services/scraper/runner';

export function registerJobs() {
  // Every 4 hours — scrape all active news sites
  cron.schedule('0 */4 * * *', () => ScraperRunner.runAll());
}
```

Called once at server startup:

```typescript
// backend/src/server.ts
registerJobs();
await fastify.listen({ port: 3001 });
```

> **Note:** If the backend restarts, the cron resets. This is acceptable for this use case.
> For production at scale, consider migrating to a dedicated job queue (BullMQ + Redis).

---

## 11. Security Model

### Layers of Security

| Layer            | Mechanism                 | Protects against          |
| ---------------- | ------------------------- | ------------------------- |
| Transport        | HTTPS (production)        | MITM                      |
| Auth             | Supabase JWT              | Unauthenticated access    |
| Authorization    | Fastify role middleware   | Privilege escalation      |
| Data isolation   | Supabase RLS              | Cross-tenant data leakage |
| Token storage    | AES-256-GCM at-rest       | DB compromise             |
| Input validation | Zod schemas on all routes | Injection, malformed data |

### Sensitive Data Rules

- OAuth tokens: encrypted before DB insert, decrypted only in-memory during API calls
- `ENCRYPTION_KEY`: only in environment variables, never in code or DB
- Tokens never appear in logs (`redactKeys` Fastify plugin)
- Tokens never returned by any API response

### PKCE State

`code_verifier` is stored temporarily in a dedicated `oauth_state` table (with `expires_at` = now + 10 minutes) and deleted after the callback completes.

---

## 12. API Design Conventions

### Base URL

```
Backend:  http://localhost:3001
Frontend: http://localhost:3000
```

### Authentication

All routes except `GET /health` require:

```
Authorization: Bearer <supabase_access_token>
```

### Response Format

**Success:**

```json
{
  "data": { ... },
  "message": "Optional human-readable message"
}
```

**Error:**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Descriptive error message"
}
```

### HTTP Status Codes

| Code | When                                       |
| ---- | ------------------------------------------ |
| 200  | Successful GET / PATCH                     |
| 201  | Successful POST (resource created)         |
| 204  | Successful DELETE                          |
| 400  | Validation error (Zod)                     |
| 401  | Missing or invalid JWT                     |
| 403  | Authenticated but insufficient permissions |
| 404  | Resource not found                         |
| 409  | Conflict (duplicate, etc.)                 |
| 500  | Unexpected server error                    |

### Route Versioning

All API routes are prefixed with `/api/v1/` to allow future versioning.

### Pagination

List endpoints support:

```
GET /api/v1/accounts/:id/timeline?page=1&limit=20
```

Response includes:

```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}
```

---

## 13. Folder Structure

```
batchNews/                        ← monorepo root
├── frontend/                     ← Next.js application
│   ├── app/
│   │   ├── (auth)/               ← public routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   └── (app)/                ← protected routes
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       ├── accounts/
│   │       │   └── [accountId]/
│   │       │       ├── page.tsx
│   │       │       ├── sites/
│   │       │       ├── timeline/
│   │       │       └── settings/
│   │       └── admin/
│   ├── components/
│   │   ├── ui/                   ← shadcn/ui generated components
│   │   ├── layout/               ← AppSidebar, AppHeader, AppNav
│   │   ├── accounts/             ← AccountCard, ConnectXButton
│   │   ├── sites/                ← SiteForm, SiteTable, ScraperPreview
│   │   └── timeline/             ← TimelineItem, SuggestionCard, PostCard
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts         ← typed fetch wrapper for all backend calls
│   │   └── supabase/
│   │       ├── client.ts         ← browser Supabase client
│   │       └── server.ts         ← server-side Supabase client (SSR)
│   ├── middleware.ts              ← Next.js route protection
│   ├── types/
│   │   └── api.ts                ← shared response types
│   ├── next.config.ts
│   └── package.json
│
├── backend/                      ← Fastify API server
│   ├── src/
│   │   ├── server.ts             ← entry point: build app, register jobs, listen
│   │   ├── app.ts                ← Fastify instance + plugin registration
│   │   ├── routes/
│   │   │   ├── index.ts          ← registers all route modules
│   │   │   ├── accounts.ts
│   │   │   ├── sites.ts
│   │   │   ├── scrape.ts
│   │   │   ├── ai.ts
│   │   │   ├── posts.ts
│   │   │   ├── timeline.ts
│   │   │   └── x-oauth.ts
│   │   ├── services/
│   │   │   ├── scraper/
│   │   │   │   ├── rss.ts        ← RSS/Atom feed fetching + parsing
│   │   │   │   ├── html.ts       ← Cheerio-based HTML scraping
│   │   │   │   └── runner.ts     ← orchestrates sites, deduplication, storage
│   │   │   ├── ai/
│   │   │   │   ├── provider.ts   ← AiProvider interface + factory
│   │   │   │   ├── openai.ts     ← OpenAI implementation
│   │   │   │   ├── anthropic.ts  ← Anthropic implementation
│   │   │   │   └── prompts.ts    ← prompt templates
│   │   │   └── x-api/
│   │   │       ├── client.ts     ← twitter-api-v2 wrapper
│   │   │       └── oauth.ts      ← PKCE helpers (generate, exchange, refresh)
│   │   ├── jobs/
│   │   │   └── index.ts          ← node-cron job registration
│   │   ├── plugins/
│   │   │   ├── authenticate.ts   ← JWT verification hook
│   │   │   └── authorize.ts      ← role-based access hook
│   │   ├── lib/
│   │   │   ├── supabase.ts       ← Supabase client (service role key)
│   │   │   └── crypto.ts         ← AES-256-GCM encrypt/decrypt
│   │   ├── schemas/
│   │   │   ├── accounts.schema.ts
│   │   │   ├── sites.schema.ts
│   │   │   └── posts.schema.ts   ← Zod schemas for request validation
│   │   ├── types/
│   │   │   ├── database.ts       ← generated by Supabase CLI
│   │   │   └── fastify.d.ts      ← Fastify type augmentations (request.user)
│   │   └── config.ts             ← typed env var config (using zod)
│   └── package.json
│
├── supabase/                     ← Supabase config (auth + DB only)
│   ├── config.toml
│   └── migrations/
│       ├── 001_extensions.sql
│       ├── 002_user_profiles.sql
│       ├── 003_user_roles.sql
│       ├── 004_x_accounts.sql
│       ├── 005_news_sites.sql
│       ├── 006_scraped_articles.sql
│       ├── 007_ai_suggestions.sql
│       ├── 008_posts.sql
│       ├── 009_scraping_runs.sql
│       ├── 010_oauth_state.sql
│       └── 011_rls_policies.sql
│
├── docs/
│   ├── ARCHITECTURE.md           ← this file
│   └── TASKS.md                  ← epics and tasks for development
│
├── package.json                  ← pnpm workspace root
└── pnpm-workspace.yaml
```

---

## 14. Naming Conventions

### Files & Directories

| Type             | Convention            | Example                          |
| ---------------- | --------------------- | -------------------------------- |
| Files            | `kebab-case`          | `x-oauth.ts`, `scraping-runs.ts` |
| React components | `PascalCase`          | `SuggestionCard.tsx`             |
| Directories      | `kebab-case`          | `x-api/`, `news-sites/`          |
| SQL migrations   | `NNN_description.sql` | `004_x_accounts.sql`             |

### Code

| Type                         | Convention             | Example                        |
| ---------------------------- | ---------------------- | ------------------------------ |
| Variables / functions        | `camelCase`            | `getXAccount`, `fetchFeed`     |
| Classes / interfaces / types | `PascalCase`           | `AiProvider`, `ScrapedArticle` |
| Constants                    | `SCREAMING_SNAKE_CASE` | `MAX_ARTICLES_PER_RUN`         |
| Enums                        | `PascalCase` members   | `SuggestionStatus.Pending`     |
| React components             | `PascalCase`           | `TimelineItem`                 |
| Custom hooks                 | `use` prefix           | `useXAccounts`                 |

### Database

| Type         | Convention             | Example                            |
| ------------ | ---------------------- | ---------------------------------- |
| Tables       | `snake_case` (plural)  | `x_accounts`, `news_sites`         |
| Columns      | `snake_case`           | `oauth_access_token_enc`           |
| Indexes      | `idx_<table>_<column>` | `idx_x_accounts_user_id`           |
| RLS policies | descriptive string     | `"members can see own x_accounts"` |

### API Routes

- Lowercase, hyphenated: `/api/v1/x-accounts`, `/api/v1/news-sites`
- Resources in plural: `/api/v1/accounts`, `/api/v1/sites`
- Nested resources: `/api/v1/accounts/:accountId/sites`

---

## 15. Environment Variables

### Backend (`backend/.env`)

```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Token encryption (generate: node -e "require('crypto').randomBytes(32).toString('hex')")
ENCRYPTION_KEY=<64_hex_chars>

# X (Twitter) API
X_CLIENT_ID=<oauth2_client_id>
X_CLIENT_SECRET=<oauth2_client_secret>
X_CALLBACK_URL=http://localhost:3001/api/v1/x/oauth/callback

# AI Provider
AI_PROVIDER=openai         # or 'anthropic'
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Cron secret (for manual trigger via API)
CRON_SECRET=<random_secret>
```

### Frontend (`frontend/.env.local`)

```bash
# Supabase (public keys only — safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

> **Security Rule:** Never put `SUPABASE_SERVICE_ROLE_KEY` or `ENCRYPTION_KEY` in the frontend. These must only exist in the backend.

---

## 16. Testing Strategy

### 16.1 Test Pyramid

```
        ┌───────────────┐
        │   E2E Tests   │  ← out of scope for v1
        ├───────────────┤
        │  Integration  │  ← Fastify route tests (backend)
        │    Tests      │     Component tests (frontend)
        ├───────────────┤
        │  Unit Tests   │  ← services, utilities, helpers
        └───────────────┘
```

Unit tests are the foundation. Integration tests cover the critical paths. E2E tests are deferred to a later phase.

---

### 16.2 Tools

| Layer               | Tool                                   | Purpose                     |
| ------------------- | -------------------------------------- | --------------------------- |
| Backend unit        | `vitest`                               | Services, utilities, crypto |
| Backend integration | `vitest` + Fastify `inject()`          | Route handler tests         |
| Frontend unit       | `vitest` + `@testing-library/react`    | Component tests             |
| Mocking             | `vitest` built-in (`vi.mock`, `vi.fn`) | External API mocking        |
| Coverage            | `@vitest/coverage-v8`                  | Coverage reports            |

---

### 16.3 File Location Convention

Tests are **colocated** with the source file they test:

```
backend/src/
├── lib/
│   ├── crypto.ts
│   └── crypto.test.ts          ← unit test for crypto.ts
├── services/
│   ├── scraper/
│   │   ├── rss.ts
│   │   ├── rss.test.ts         ← unit test for rss.ts
│   │   ├── html.ts
│   │   └── html.test.ts        ← unit test for html.ts
│   └── ai/
│       ├── openai.ts
│       └── openai.test.ts      ← unit test (mocked OpenAI client)
└── routes/
    └── accounts.test.ts        ← integration test via fastify.inject()

frontend/src/
└── components/
    ├── auth/
    │   ├── LoginForm.tsx
    │   └── LoginForm.test.tsx  ← component test
    └── timeline/
        ├── SuggestionCard.tsx
        └── SuggestionCard.test.tsx
```

---

### 16.4 What to Test

#### Backend — Unit Tests (services & utilities)

| Target                             | What to assert                                                    |
| ---------------------------------- | ----------------------------------------------------------------- |
| `lib/crypto.ts`                    | encrypt/decrypt roundtrip; unique IVs; wrong key fails            |
| `services/scraper/rss.ts`          | parses valid feed; handles empty feed; handles fetch error        |
| `services/scraper/html.ts`         | extracts articles with given selectors; handles missing selectors |
| `services/scraper/rss-detector.ts` | finds RSS link in HTML; returns null when absent                  |
| `services/ai/openai.ts`            | calls OpenAI with correct prompt; parses JSON response            |
| `services/ai/anthropic.ts`         | same as above for Anthropic                                       |
| `services/ai/suggest.ts`           | processes unprocessed articles; marks `is_processed = true`       |

#### Backend — Integration Tests (routes)

Use Fastify's built-in `inject()` method — no real HTTP, no network, no Supabase needed.

```typescript
// Example: routes/accounts.test.ts
import { buildApp } from '../app';

describe('GET /api/v1/accounts', () => {
  it('returns 401 when no JWT', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/api/v1/accounts' });
    expect(res.statusCode).toBe(401);
  });

  it('returns accounts list for authenticated user', async () => {
    // Mock fastify.authenticate to inject a test user
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/accounts',
      headers: { authorization: 'Bearer <test-token>' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty('data');
  });
});
```

#### Frontend — Component Tests

Use `@testing-library/react` to test components in isolation. Focus on user interactions, not implementation details.

```typescript
// Example: components/auth/LoginForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

it('shows error when email is invalid', async () => {
  render(<LoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
});
```

---

### 16.5 What NOT to Test

- **shadcn/ui components** — they have their own tests; treat them as black boxes
- **Database migrations** — verified by running `supabase db push` against a real project
- **The Supabase client itself** — mock it; don't test the library
- **Server Components that are pure data pass-throughs** — test the child components instead
- **Type safety** — TypeScript handles this at compile time, not at runtime

---

### 16.6 Mocking External Services

All external dependencies must be mocked in tests. Never make real network calls in tests.

```typescript
// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

// Mock the OpenAI SDK
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: '{"text":"Test post","hashtags":["#test"]}' } }],
        }),
      },
    },
  })),
}));

// Mock the X API client
vi.mock('twitter-api-v2', () => ({
  TwitterApi: vi.fn().mockImplementation(() => ({
    v2: { tweet: vi.fn().mockResolvedValue({ data: { id: '123', text: 'Test' } }) },
  })),
}));
```

---

### 16.7 Coverage Targets

| Area                                 | Minimum Coverage |
| ------------------------------------ | ---------------- |
| `lib/` (crypto, auth helpers)        | 90%              |
| `services/` (scrapers, AI, X client) | 70%              |
| `routes/` (integration tests)        | 60%              |
| Frontend components                  | 50%              |

Run coverage with:

```bash
pnpm --filter backend test -- --coverage
pnpm --filter frontend test -- --coverage
```

---

_Last updated: 2026-02-19_
