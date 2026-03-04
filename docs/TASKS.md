# batchNews — Epics & Tasks

> **How to use this document:**
> Each task is self-contained. An AI agent can be given a single task block and have
> everything needed to implement it. Before starting any task, the agent should read
> `docs/ARCHITECTURE.md` for conventions, folder structure, and tech stack decisions.
>
> **Task ID format:** `<EPIC>-<NNN>` (e.g., `SETUP-001`)
> **Status values:** `TODO` · `IN PROGRESS` · `DONE`

---

## Task Overview

Quick reference for all tasks. Use the **Workspace** column to route tasks to the correct agent.

| Task ID                                                           | Title                                          | Workspace | Priority | Status |
| ----------------------------------------------------------------- | ---------------------------------------------- | --------- | -------- | ------ |
| [SETUP-001](#setup-001--initialize-monorepo)                      | Initialize Monorepo                            | Both      | Critical | DONE   |
| [SETUP-002](#setup-002--scaffold-fastify-backend)                 | Scaffold Fastify Backend                       | Backend   | Critical | DONE   |
| [SETUP-003](#setup-003--scaffold-nextjs-frontend)                 | Scaffold Next.js Frontend                      | Frontend  | Critical | DONE   |
| [SETUP-004](#setup-004--configure-supabase-cli--project)          | Configure Supabase CLI & Project               | Both      | Critical | DONE   |
| [SETUP-005](#setup-005--development-tooling)                      | Development Tooling                            | Both      | High     | DONE   |
| [DB-001](#db-001--bootstrap-extensions--helpers)                  | Bootstrap Extensions & Helpers                 | Database  | Critical | DONE   |
| [DB-002](#db-002--user-profiles--roles)                           | User Profiles & Roles                          | Database  | Critical | DONE   |
| [DB-003](#db-003--x-accounts)                                     | X Accounts                                     | Database  | Critical | DONE   |
| [DB-004](#db-004--news-sites-articles-suggestions-posts-runs)     | News Sites, Articles, Suggestions, Posts, Runs | Database  | Critical | DONE   |
| [DB-005](#db-005--rls-policies)                                   | RLS Policies                                   | Database  | Critical | DONE   |
| [DB-006](#db-006--generate-typescript-types)                      | Generate TypeScript Types                      | Backend   | High     | DONE   |
| [CORE-001](#core-001--authentication-plugin-fastify)              | Authentication Plugin (Fastify)                | Backend   | Critical | DONE   |
| [CORE-002](#core-002--authorization-plugin-fastify)               | Authorization Plugin (Fastify)                 | Backend   | High     | DONE   |
| [CORE-003](#core-003--crypto-service)                             | Crypto Service                                 | Backend   | Critical | DONE   |
| [CORE-004](#core-004--supabase-service-client)                    | Supabase Service Client                        | Backend   | Critical | DONE   |
| [CORE-005](#core-005--standard-error-handling)                    | Standard Error Handling                        | Backend   | High     | DONE   |
| [AUTH-001](#auth-001--login-page)                                 | Login Page                                     | Frontend  | Critical | DONE   |
| [AUTH-002](#auth-002--registration-page)                          | Registration Page                              | Frontend  | High     | DONE   |
| [AUTH-003](#auth-003--password-recovery-page)                     | Password Recovery Page                         | Frontend  | Medium   | DONE   |
| [AUTH-004](#auth-004--app-layout--sidebar)                        | App Layout & Sidebar                           | Frontend  | High     | DONE   |
| [XACCOUNT-001](#xaccount-001--x-oauth-pkce-service-backend)       | X OAuth PKCE Service                           | Backend   | Critical | DONE   |
| [XACCOUNT-002](#xaccount-002--x-account-crud-routes-backend)      | X Account CRUD Routes                          | Backend   | Critical | DONE   |
| [XACCOUNT-003](#xaccount-003--x-accounts-dashboard-frontend)      | X Accounts Dashboard                           | Frontend  | High     | DONE   |
| [SITES-001](#sites-001--rss-auto-detection-service-backend)       | RSS Auto-Detection Service                     | Backend   | High     | DONE   |
| [SITES-002](#sites-002--news-sites-crud-routes-backend)           | News Sites CRUD Routes                         | Backend   | Critical | DONE   |
| [SITES-003](#sites-003--news-sites-ui-frontend)                   | News Sites UI                                  | Frontend  | High     | DONE   |
| [SCRAPER-001](#scraper-001--rss-scraper-service)                  | RSS Scraper Service                            | Backend   | Critical | DONE   |
| [SCRAPER-002](#scraper-002--html-scraper-service)                 | HTML Scraper Service                           | Backend   | High     | DONE   |
| [SCRAPER-003](#scraper-003--scraper-runner--orchestrator)         | Scraper Runner & Orchestrator                  | Backend   | Critical | DONE   |
| [SCRAPER-004](#scraper-004--scraping-routes-backend)              | Scraping Routes                                | Backend   | High     | DONE   |
| [SCRAPER-005](#scraper-005--cron-job-scheduler)                   | Cron Job Scheduler                             | Backend   | Critical | DONE   |
| [AI-001](#ai-001--ai-provider-abstraction)                        | AI Provider Abstraction                        | Backend   | Critical | DONE   |
| [AI-002](#ai-002--prompt-templates)                               | Prompt Templates                               | Backend   | High     | DONE   |
| [AI-003](#ai-003--ai-processing-pipeline)                         | AI Processing Pipeline                         | Backend   | Critical | DONE   |
| [AI-004](#ai-004--ai-suggestion-routes-backend)                   | AI Suggestion Routes                           | Backend   | High     | DONE   |
| [TIMELINE-001](#timeline-001--timeline-api-route-backend)         | Timeline API Route                             | Backend   | Critical | DONE   |
| [TIMELINE-002](#timeline-002--timeline-page-frontend)             | Timeline Page                                  | Frontend  | Critical | DONE   |
| [TIMELINE-003](#timeline-003--timeline-filters-frontend)          | Timeline Filters                               | Frontend  | Medium   | DONE   |
| [POSTS-001](#posts-001--x-posting-service-backend)                | X Posting Service                              | Backend   | Critical | DONE   |
| [POSTS-002](#posts-002--post-routes-backend)                      | Post Routes                                    | Backend   | Critical | DONE   |
| [POSTS-003](#posts-003--publish-action-frontend)                  | Publish Action                                 | Frontend  | Critical | DONE   |
| [ADMIN-001](#admin-001--admin-layout--guard)                      | Admin Layout & Guard                           | Both      | Medium   | DONE   |
| [ADMIN-002](#admin-002--user-management-page)                     | User Management Page                           | Both      | Medium   | DONE   |
| [UX-001](#ux-001--breadcrumb-navigation)                          | Breadcrumb Navigation                          | Frontend  | Medium   | DONE   |
| [UX-002](#ux-002--full-article-summary-generation)                | Full Article Summary Generation                | Both      | High     | DONE   |
| [UX-003](#ux-003--dashboard-reorganization)                       | Dashboard Reorganization                       | Frontend  | High     | DONE   |
| [UX-004](#ux-004--account-settings-page)                          | Account Settings Page                          | Both      | High     | DONE   |
| [UX-005](#ux-005--ai-prompt-rules-system)                         | AI Prompt Rules System                         | Both      | Critical | DONE   |
| [UX-006](#ux-006--article-detail-page)                            | Article Detail Page                            | Both      | High     | DONE   |
| [UX-007](#ux-007--dashboard-redesign)                             | Dashboard Redesign                             | Frontend  | Critical | DONE   |
| [UX-008](#ux-008--statistics-dashboard)                           | Statistics Dashboard                           | Both      | High     | DONE   |
| [FLOW-001](#flow-001--db--auto_flow-em-news_sites)                | DB — auto_flow em news_sites                   | Database  | Critical | DONE   |
| [FLOW-002](#flow-002--db--suggestion_text-nullable)               | DB — suggestion_text nullable                  | Database  | Critical | DONE   |
| [FLOW-003](#flow-003--backend--fase-de-análise-elegibilidade)     | Backend — Fase de Análise (Elegibilidade)      | Backend   | Critical | DONE   |
| [FLOW-004](#flow-004--backend--geração-do-post-na-aprovação)      | Backend — Geração do Post na Aprovação         | Backend   | Critical | DONE   |
| [FLOW-005](#flow-005--backend--fluxo-automático-por-site)         | Backend — Fluxo Automático por Site            | Backend   | High     | DONE   |
| [FLOW-006](#flow-006--frontend--suggestioncard-estado-pending)    | Frontend — SuggestionCard Estado Pending       | Frontend  | High     | DONE   |
| [FLOW-007](#flow-007--frontend--siteform--toggle-auto_flow)       | Frontend — SiteForm Toggle auto_flow           | Frontend  | High     | DONE   |
| [FLOW-008](#flow-008--frontend--detailstepper-4-fases)            | Frontend — DetailStepper 4 Fases               | Frontend  | Medium   | DONE   |
| [FEAT-001](#feat-001--x-premium-switch--limite-de-caracteres)     | X Premium Switch + Limite de Caracteres        | Both      | High     | DONE   |
| [FEAT-002](#feat-002--seletor-de-idioma-por-conta)                | Seletor de Idioma por Conta                    | Both      | High     | DONE   |
| [FEAT-003](#feat-003--tanstack-query--gerenciamento-de-estado)    | TanStack Query — Gerenciamento de Estado       | Frontend  | Critical | DONE   |
| [FEAT-004](#feat-004--timeline--publicação-sem-reload)            | Timeline — Publicação sem Reload               | Frontend  | High     | DONE   |
| [FEAT-005](#feat-005--detail-page--estado-suave)                  | Detail Page — Estado Suave                     | Frontend  | High     | DONE   |
| [FEAT-006](#feat-006--processar-artigo-inline-na-detail-page)     | Processar Artigo Inline na Detail Page         | Both      | High     | DONE   |
| [SRC-001](#src-001--tabela-content_items--camada-unificada)       | Tabela content_items + Camada Unificada        | Database  | Critical | TODO   |
| [SRC-002](#src-002--bridge-scraped_articles--content_items)       | Bridge scraped_articles → content_items        | Backend   | Critical | TODO   |
| [SRC-003](#src-003--youtube-channel-ingestion)                    | YouTube Channel Ingestion                      | Backend   | High     | TODO   |
| [SRC-004](#src-004--x-feed-ingestion)                             | X Feed Ingestion                               | Backend   | High     | TODO   |
| [SRC-005](#src-005--newsletter--blog-rss-ingestion)               | Newsletter / Blog RSS Ingestion                | Backend   | Medium   | TODO   |
| [SRC-006](#src-006--ai-pipeline-migração-para-content_items)      | AI Pipeline — Migração para content_items      | Backend   | Critical | TODO   |
| [SRC-007](#src-007--frontend--gerenciamento-de-fontes)            | Frontend — Gerenciamento de Fontes             | Frontend  | High     | TODO   |
| [SRC-008](#src-008--frontend--timeline-multi-source)              | Frontend — Timeline Multi-Source               | Frontend  | High     | TODO   |
| [EDT-001](#edt-001--tabelas-de-tags-e-embeddings)                 | Tabelas de Tags e Embeddings                   | Database  | Critical | TODO   |
| [EDT-002](#edt-002--serviço-de-tagging-automático)                | Serviço de Tagging Automático                  | Backend   | Critical | TODO   |
| [EDT-003](#edt-003--tabelas-de-clusters-e-briefs)                 | Tabelas de Clusters e Briefs                   | Database  | Critical | TODO   |
| [EDT-004](#edt-004--serviço-de-clustering-temporal)               | Serviço de Clustering Temporal                 | Backend   | Critical | TODO   |
| [EDT-005](#edt-005--geração-de-editorial-briefs)                  | Geração de Editorial Briefs                    | Backend   | High     | TODO   |
| [EDT-006](#edt-006--geração-contextual-de-sugestões)              | Geração Contextual de Sugestões                | Backend   | Critical | TODO   |
| [EDT-007](#edt-007--frontend--painel-editorial)                   | Frontend — Painel Editorial                    | Frontend  | High     | TODO   |
| [EDT-008](#edt-008--frontend--sugestões-contextuais-no-dashboard) | Frontend — Sugestões Contextuais no Dashboard  | Frontend  | High     | TODO   |
| [INFRA-001](#infra-001--docker-setup-backend)                     | Docker Setup                                   | Backend   | Medium   | TODO   |
| [INFRA-002](#infra-002--testing-setup)                            | Testing Setup                                  | Both      | Medium   | TODO   |
| [INFRA-003](#infra-003--readmemd)                                 | README.md                                      | Both      | Medium   | TODO   |

**Workspace legend:** `Backend` = Fastify API · `Frontend` = Next.js UI · `Database` = SQL migrations in `supabase/migrations/` · `Both` = touches both workspaces or root config

---

## Epic Index

| Epic                                                            | ID Prefix | Description                                                  |
| --------------------------------------------------------------- | --------- | ------------------------------------------------------------ |
| [Foundation & Setup](#epic-setup-foundation--setup)             | SETUP     | Monorepo, tooling, project scaffolding                       |
| [Database & Migrations](#epic-db-database--migrations)          | DB        | All SQL migrations and RLS policies                          |
| [Core Backend Services](#epic-core-core-backend-services)       | CORE      | Fastify setup, auth plugins, shared utilities                |
| [Authentication (Frontend)](#epic-auth-authentication-frontend) | AUTH      | Login, register, route protection                            |
| [X Account Management](#epic-xaccount-x-account-management)     | XACCOUNT  | OAuth flow, account CRUD                                     |
| [News Sites Management](#epic-sites-news-sites-management)      | SITES     | Site CRUD, RSS detection                                     |
| [Scraping Engine](#epic-scraper-scraping-engine)                | SCRAPER   | RSS + HTML scrapers, scheduler                               |
| [AI Integration](#epic-ai-ai-integration)                       | AI        | Provider abstraction, suggestion generation                  |
| [Timeline](#epic-timeline-timeline)                             | TIMELINE  | Unified feed of suggestions and posts                        |
| [X Posting](#epic-posts-x-posting)                              | POSTS     | Publish to X, post history                                   |
| [Admin Panel](#epic-admin-admin-panel)                          | ADMIN     | User management, role assignment                             |
| [User Experience](#epic-ux-user-experience)                     | UX        | UI improvements, breadcrumbs, settings                       |
| [News Flow Redesign](#epic-flow--news-flow-redesign)            | FLOW      | Realinhamento do ciclo de vida da notícia                    |
| [Multi-Source Ingestion](#epic-src-multi-source-ingestion)      | SRC       | YouTube, X feeds, newsletters, unified content               |
| [Editorial Intelligence](#epic-edt-editorial-intelligence)      | EDT       | Topic clustering, editorial briefs, context-aware generation |
| [Infrastructure & Quality](#epic-infra-infrastructure--quality) | INFRA     | Docker, README, testing setup                                |

---

## EPIC SETUP — Foundation & Setup

---

### SETUP-001 — Initialize Monorepo

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Critical |
| Dependencies | none     |

**Goal:** Create the repository structure with pnpm workspaces.

**Deliverables:**

- `package.json` (root) — workspace config
- `pnpm-workspace.yaml`
- `.gitignore` (covers Node, Next.js, .env files)
- `.nvmrc` (Node version: 20)
- `README.md` (minimal placeholder, see INFRA-003 for full README)

**Implementation:**

```json
// package.json (root)
{
  "name": "batchnews",
  "private": true,
  "scripts": {
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "dev": "concurrently \"pnpm dev:frontend\" \"pnpm dev:backend\""
  }
}
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'frontend'
  - 'backend'
```

**Acceptance Criteria:**

- [ ] Root `package.json` with `private: true` and workspaces
- [ ] `pnpm-workspace.yaml` listing frontend and backend
- [ ] `.gitignore` covers: `node_modules`, `.env*`, `.next`, `dist`, `build`
- [ ] Running `pnpm install` from root installs all workspace dependencies

---

### SETUP-002 — Scaffold Fastify Backend

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | Critical  |
| Dependencies | SETUP-001 |

**Goal:** Create the Fastify backend project with TypeScript, folder structure, and initial server.

**Deliverables:**

- `backend/package.json`
- `backend/tsconfig.json`
- `backend/src/server.ts` — entry point
- `backend/src/app.ts` — Fastify instance factory
- `backend/src/config.ts` — typed env validation with Zod
- `backend/.env.example`

**Implementation Notes:**

- Use `tsx` for development (`tsx watch src/server.ts`)
- Use `tsc` for production build to `dist/`
- `config.ts` should parse and validate all env vars with Zod at startup — fail fast if required vars are missing
- Register `@fastify/cors` allowing the frontend URL from config
- Register `@fastify/helmet` for security headers
- Register `pino-pretty` for development logs only

```typescript
// backend/src/config.ts
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ENCRYPTION_KEY: z.string().length(64),
  X_CLIENT_ID: z.string().min(1),
  X_CLIENT_SECRET: z.string().min(1),
  X_CALLBACK_URL: z.string().url(),
  AI_PROVIDER: z.enum(['openai', 'anthropic']),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(1),
});

export const config = schema.parse(process.env);
export type Config = z.infer<typeof schema>;
```

**Acceptance Criteria:**

- [ ] `pnpm dev` in `/backend` starts server on port 3001
- [ ] `GET /health` returns `{ status: 'ok', timestamp: <ISO string> }`
- [ ] App fails to start if required env vars are missing (Zod error message)
- [ ] TypeScript strict mode enabled
- [ ] No `any` types in initial scaffold

---

### SETUP-003 — Scaffold Next.js Frontend

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | Critical  |
| Dependencies | SETUP-001 |

**Goal:** Create the Next.js frontend with TypeScript, shadcn/ui, and base layout.

**Deliverables:**

- `frontend/package.json`
- `frontend/next.config.ts`
- `frontend/tsconfig.json`
- `frontend/app/layout.tsx` — root layout with Tailwind and Toaster
- `frontend/app/(auth)/layout.tsx` — centered auth layout
- `frontend/app/(app)/layout.tsx` — app layout with sidebar placeholder
- `frontend/.env.local.example`
- `frontend/lib/supabase/client.ts` — browser Supabase client
- `frontend/lib/supabase/server.ts` — SSR Supabase client
- `frontend/lib/api/client.ts` — typed fetch wrapper for backend calls
- `frontend/middleware.ts` — auth route protection

**Implementation Notes:**

```typescript
// frontend/lib/api/client.ts
// All backend calls go through this function.
// It automatically attaches the Supabase JWT to Authorization header.
export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  // Get session from Supabase, attach Bearer token, call NEXT_PUBLIC_API_URL + path
}
```

```typescript
// frontend/middleware.ts
// Redirect unauthenticated users from /(app) to /login
// Redirect authenticated users from /(auth) to /dashboard
```

**Acceptance Criteria:**

- [ ] `pnpm dev` in `/frontend` starts on port 3000
- [ ] shadcn/ui initialized (`npx shadcn@latest init`)
- [ ] `Button`, `Card`, `Input` components generated from shadcn/ui
- [ ] `/login` renders without errors (even if non-functional)
- [ ] Middleware redirects unauthenticated users to `/login`

---

### SETUP-004 — Configure Supabase CLI & Project

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | Critical  |
| Dependencies | SETUP-001 |

**Goal:** Initialize the Supabase project structure for database migrations.

**Deliverables:**

- `supabase/config.toml`
- `supabase/migrations/` (empty directory with `.gitkeep`)
- `.github/` or root documentation on running `supabase db push`

**Implementation Notes:**

- Run `supabase init` from the repo root
- Supabase is used for Auth and PostgreSQL **only** — no Edge Functions, no Storage
- Ensure `config.toml` has `[auth]` settings appropriate for email/password auth
- Add `supabase` CLI commands to root `package.json` scripts:
  ```json
  "db:push": "supabase db push",
  "db:types": "supabase gen types typescript --local > backend/src/types/database.ts"
  ```

**Acceptance Criteria:**

- [ ] `supabase/config.toml` exists and is valid
- [ ] `pnpm db:types` command works (generates types after migrations are applied)

---

### SETUP-005 — Development Tooling

| Field        | Value                |
| ------------ | -------------------- |
| Status       | DONE                 |
| Priority     | High                 |
| Dependencies | SETUP-002, SETUP-003 |

**Goal:** Configure ESLint, Prettier, and Husky for consistent code quality.

**Deliverables:**

- `eslint.config.mjs` (root — applies to both workspaces)
- `.prettierrc`
- `.prettierignore`
- `husky/` with pre-commit hook running lint + format check
- `lint-staged.config.mjs`

**Acceptance Criteria:**

- [ ] `pnpm lint` works from root (runs ESLint on both workspaces)
- [ ] `pnpm format` runs Prettier on all files
- [ ] Pre-commit hook prevents commits with lint errors
- [ ] Prettier config: 2-space indent, single quotes, trailing comma ES5

---

## EPIC DB — Database & Migrations

> **Convention:** All migration files are in `supabase/migrations/`.
> File naming: `NNN_description.sql` (e.g., `001_extensions.sql`).
> Every table must have `id`, `created_at`, and an `updated_at` trigger (see ARCHITECTURE.md §5).

---

### DB-001 — Bootstrap Extensions & Helpers

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | Critical  |
| Dependencies | SETUP-004 |

**Goal:** Enable required PostgreSQL extensions and shared helpers.

**File:** `supabase/migrations/001_extensions.sql`

```sql
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";  -- for updated_at trigger

-- Helper: auto-update updated_at column
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Acceptance Criteria:**

- [ ] Migration runs without errors on a fresh Supabase project
- [ ] `gen_random_uuid()` works
- [ ] `moddatetime` extension is available

---

### DB-002 — User Profiles & Roles

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Critical |
| Dependencies | DB-001   |

**Goal:** Create `user_profiles` and `user_roles` tables with RLS.

**File:** `supabase/migrations/002_user_profiles.sql`, `supabase/migrations/003_user_roles.sql`

**Implementation Notes:**

- `user_profiles.id` is a FK to `auth.users(id)` with `ON DELETE CASCADE`
- Add a trigger on `auth.users` to auto-create a profile row on signup
- `user_roles.role` default is `'member'`
- RLS: users can read their own profile; only `service_role` can write to `user_roles`

**Acceptance Criteria:**

- [ ] New user signup automatically creates a `user_profiles` row
- [ ] `user_roles` row must be created manually by admin/service
- [ ] Users cannot escalate their own role via RLS

---

### DB-003 — X Accounts

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Critical |
| Dependencies | DB-002   |

**Goal:** Create `x_accounts` table with RLS and `oauth_state` helper table.

**Files:** `supabase/migrations/004_x_accounts.sql`, `supabase/migrations/010_oauth_state.sql`

**Notes:**

- Encrypted token columns are `TEXT` (not BYTEA) — stored as hex strings
- `oauth_state` table: `id UUID PK`, `user_id UUID FK`, `code_verifier TEXT`, `expires_at TIMESTAMPTZ`
- RLS on `x_accounts`: user can CRUD only their own rows

**Acceptance Criteria:**

- [ ] Users can only SELECT/INSERT/UPDATE/DELETE their own `x_accounts` rows
- [ ] `oauth_state` rows expire after 10 minutes (enforced by `expires_at`, cleanup via periodic backend call or DB rule)

---

### DB-004 — News Sites, Articles, Suggestions, Posts, Runs

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Critical |
| Dependencies | DB-003   |

**Goal:** Create remaining tables: `news_sites`, `scraped_articles`, `ai_suggestions`, `posts`, `scraping_runs`.

**Files:**

- `supabase/migrations/005_news_sites.sql`
- `supabase/migrations/006_scraped_articles.sql`
- `supabase/migrations/007_ai_suggestions.sql`
- `supabase/migrations/008_posts.sql`
- `supabase/migrations/009_scraping_runs.sql`

**Key constraints:**

- `scraped_articles`: `UNIQUE(news_site_id, url)`
- `news_sites.source_type`: `CHECK (source_type IN ('rss', 'html', 'auto'))`
- `ai_suggestions.status`: `CHECK (status IN ('pending', 'approved', 'rejected', 'posted'))`
- `posts.status`: `CHECK (status IN ('published', 'failed'))`

**Acceptance Criteria:**

- [ ] All tables created without errors
- [ ] All FK constraints are correct and cascade-delete is configured
- [ ] `UNIQUE` constraints are in place

---

### DB-005 — RLS Policies

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Critical |
| Dependencies | DB-004   |

**Goal:** Apply all Row Level Security policies.

**File:** `supabase/migrations/011_rls_policies.sql`

**Policy summary:**

| Table              | Who can SELECT                 | Who can INSERT/UPDATE/DELETE                 |
| ------------------ | ------------------------------ | -------------------------------------------- |
| `x_accounts`       | owner (`user_id = auth.uid()`) | owner                                        |
| `news_sites`       | owner (via `x_accounts`)       | owner                                        |
| `scraped_articles` | owner (via `news_sites`)       | service_role only                            |
| `ai_suggestions`   | owner (via `x_accounts`)       | service_role (insert); owner (update status) |
| `posts`            | owner (via `x_accounts`)       | service_role only                            |
| `scraping_runs`    | owner (via `news_sites`)       | service_role only                            |

Enable RLS with `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` on every table.

**Acceptance Criteria:**

- [ ] User A cannot read User B's data (verified by test query with different JWTs)
- [ ] Service role key bypasses RLS (for backend operations)
- [ ] RLS is enabled on all tables listed above

---

### DB-006 — Generate TypeScript Types

| Field        | Value  |
| ------------ | ------ |
| Status       | DONE   |
| Priority     | High   |
| Dependencies | DB-005 |

**Goal:** Generate TypeScript types from the Supabase schema.

**File:** `backend/src/types/database.ts`

**Command:** `pnpm db:types` (defined in SETUP-004)

**Acceptance Criteria:**

- [ ] `database.ts` is generated without errors
- [ ] Types reflect all tables and columns
- [ ] File is committed to the repo (re-run when schema changes)

---

## EPIC CORE — Core Backend Services

---

### CORE-001 — Authentication Plugin (Fastify)

| Field        | Value             |
| ------------ | ----------------- |
| Status       | DONE              |
| Priority     | Critical          |
| Dependencies | SETUP-002, DB-002 |

**Goal:** Create a Fastify plugin that verifies Supabase JWTs and populates `request.user`.

**File:** `backend/src/plugins/authenticate.ts`

**Implementation Notes:**

```typescript
// Decorate fastify with authenticate hook
// Verify the JWT using Supabase client: supabase.auth.getUser(token)
// On success: request.user = { id: string, email: string, role: string }
// On failure: reply 401

// Type augmentation
declare module 'fastify' {
  interface FastifyRequest {
    user: { id: string; email: string; role: 'admin' | 'member' };
  }
}
```

Apply to routes:

```typescript
fastify.get('/api/v1/accounts', { preHandler: [fastify.authenticate] }, handler);
```

**Acceptance Criteria:**

- [ ] Valid JWT → `request.user` populated, handler called
- [ ] Missing JWT → 401 response
- [ ] Expired JWT → 401 response
- [ ] Malformed JWT → 401 response
- [ ] Unit tests in `backend/src/plugins/authenticate.test.ts` cover all four cases above using `buildTestApp()` and `fastify.inject()`

---

### CORE-002 — Authorization Plugin (Fastify)

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | High     |
| Dependencies | CORE-001 |

**Goal:** Create a role-based authorization hook for admin-only routes.

**File:** `backend/src/plugins/authorize.ts`

```typescript
// Usage: { preHandler: [fastify.authenticate, fastify.authorize('admin')] }
// Checks request.user.role === required role
// Returns 403 if insufficient
```

**Acceptance Criteria:**

- [ ] Admin user can access admin routes
- [ ] Member user receives 403 on admin routes
- [ ] Unauthenticated user receives 401 (from authenticate, before authorize runs)

---

### CORE-003 — Crypto Service

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | Critical  |
| Dependencies | SETUP-002 |

**Goal:** Implement AES-256-GCM encrypt/decrypt for OAuth token storage.

**File:** `backend/src/lib/crypto.ts`

**Implementation:** See ARCHITECTURE.md §11 for the exact implementation using Node's built-in `crypto` module. No external dependencies.

**Acceptance Criteria:**

- [ ] `encrypt(plaintext)` → hex string
- [ ] `decrypt(encrypt(plaintext))` === plaintext
- [ ] Each call to `encrypt` produces a different ciphertext (random IV)
- [ ] Unit tests in `backend/src/lib/crypto.test.ts` (Vitest)

---

### CORE-004 — Supabase Service Client

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | Critical  |
| Dependencies | SETUP-002 |

**Goal:** Create the backend Supabase client using the service role key.

**File:** `backend/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { config } from '../config';

export const supabase = createClient<Database>(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
);
```

**Notes:**

- Service role key bypasses RLS — use only in backend
- This is the single Supabase client instance for the entire backend
- Validate JWT in `plugins/authenticate.ts` using `supabase.auth.getUser(token)` — this does NOT bypass RLS, it only verifies the token

**Acceptance Criteria:**

- [ ] Singleton pattern — one instance exported
- [ ] Fully typed with generated `Database` type

---

### CORE-005 — Standard Error Handling

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | High      |
| Dependencies | SETUP-002 |

**Goal:** Configure Fastify global error handler for consistent error responses.

**File:** `backend/src/app.ts` (error handler registration)

**Standard error format:**

```json
{ "statusCode": 400, "error": "Bad Request", "message": "..." }
```

- Zod validation errors → 400 with field-level details
- Unhandled errors in production → generic 500 (no stack traces)
- Unhandled errors in development → 500 with stack trace

**Acceptance Criteria:**

- [ ] Zod parse errors return 400 with `message` describing the invalid field
- [ ] `throw new Error()` in a route returns 500 without exposing stack in production
- [ ] All responses follow the standard format from ARCHITECTURE.md §12

---

## EPIC AUTH — Authentication (Frontend)

---

### AUTH-001 — Login Page

| Field        | Value               |
| ------------ | ------------------- |
| Status       | DONE                |
| Priority     | Critical            |
| Dependencies | SETUP-003, CORE-001 |

**Goal:** Build the login page using Supabase Auth email/password.

**Files:**

- `frontend/app/(auth)/login/page.tsx`
- `frontend/components/auth/LoginForm.tsx`

**UI:** shadcn/ui `Card`, `Form`, `Input`, `Button`, `Label`. On error, display inline error message. On success, redirect to `/dashboard`.

**Acceptance Criteria:**

- [ ] Valid credentials → redirect to `/dashboard`
- [ ] Invalid credentials → inline error message
- [ ] Loading state on submit button
- [ ] Link to `/register` and `/forgot-password`

---

### AUTH-002 — Registration Page

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | High     |
| Dependencies | AUTH-001 |

**Files:**

- `frontend/app/(auth)/register/page.tsx`
- `frontend/components/auth/RegisterForm.tsx`

**Notes:** After successful registration, Supabase sends a confirmation email. Show a success message. The `user_profiles` row is auto-created by the DB trigger (DB-002).

**Acceptance Criteria:**

- [ ] Form validates: valid email, password ≥ 8 chars, password confirmation match
- [ ] Success → show "Check your email" message
- [ ] Error → inline message

---

### AUTH-003 — Password Recovery Page

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Medium   |
| Dependencies | AUTH-001 |

**Files:**

- `frontend/app/(auth)/forgot-password/page.tsx`
- `frontend/app/(auth)/reset-password/page.tsx`

**Notes:** Uses `supabase.auth.resetPasswordForEmail()` and `supabase.auth.updateUser()` for the reset flow.

**Acceptance Criteria:**

- [ ] Request form sends reset email
- [ ] Reset page allows setting a new password
- [ ] Success redirects to `/login`

---

### AUTH-004 — App Layout & Sidebar

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | High      |
| Dependencies | SETUP-003 |

**Goal:** Build the authenticated app shell: sidebar navigation + header.

**Files:**

- `frontend/app/(app)/layout.tsx`
- `frontend/components/layout/AppSidebar.tsx`
- `frontend/components/layout/AppHeader.tsx`

**Sidebar links:**

- Dashboard (list of X accounts)
- Admin (only if role = admin)

**Header:** user avatar, display name, logout button.

**Acceptance Criteria:**

- [ ] Sidebar links navigate correctly
- [ ] Logout calls `supabase.auth.signOut()` and redirects to `/login`
- [ ] Admin link only visible to admin users
- [ ] Responsive: sidebar collapses on mobile (shadcn/ui `Sheet`)

---

## EPIC XACCOUNT — X Account Management

---

### XACCOUNT-001 — X OAuth PKCE Service (Backend)

| Field        | Value                      |
| ------------ | -------------------------- |
| Status       | DONE                       |
| Priority     | Critical                   |
| Dependencies | CORE-001, CORE-003, DB-003 |

**Goal:** Implement the full X OAuth 2.0 PKCE flow in the backend.

**Files:**

- `backend/src/services/x-api/oauth.ts` — PKCE helpers
- `backend/src/routes/x-oauth.ts` — `GET /api/v1/x/oauth/start` and `GET /api/v1/x/oauth/callback`

**Flow (see ARCHITECTURE.md §9):**

1. `GET /start` — generate `code_verifier` + `code_challenge`, save `code_verifier` to `oauth_state` table (TTL 10 min), return X authorization URL
2. `GET /callback?code=&state=` — retrieve `code_verifier`, exchange code for tokens, encrypt tokens, save to `x_accounts`, delete `oauth_state` row, redirect to frontend

**Scopes required:** `tweet.read tweet.write users.read offline.access`

**Acceptance Criteria:**

- [ ] `GET /start` returns a valid X authorization URL
- [ ] `GET /callback` saves encrypted tokens to `x_accounts`
- [ ] `oauth_state` row is deleted after successful callback
- [ ] Stale `oauth_state` rows (expired) are rejected with 400

---

### XACCOUNT-002 — X Account CRUD Routes (Backend)

| Field        | Value        |
| ------------ | ------------ |
| Status       | DONE         |
| Priority     | Critical     |
| Dependencies | XACCOUNT-001 |

**File:** `backend/src/routes/accounts.ts`

**Endpoints:**

```
GET    /api/v1/accounts              → list user's X accounts (no tokens in response)
DELETE /api/v1/accounts/:id          → remove account (revoke X token + delete row)
GET    /api/v1/accounts/:id          → get single account details
```

**Notes:**

- Never return `oauth_access_token_enc` or `oauth_refresh_token_enc` in responses
- On DELETE: call X API to revoke the token before deleting from DB

**Acceptance Criteria:**

- [ ] GET returns list without token fields
- [ ] DELETE revokes X token and removes DB row
- [ ] User cannot access another user's accounts (returns 404)

---

### XACCOUNT-003 — X Accounts Dashboard (Frontend)

| Field        | Value                  |
| ------------ | ---------------------- |
| Status       | DONE                   |
| Priority     | High                   |
| Dependencies | XACCOUNT-002, AUTH-004 |

**Files:**

- `frontend/app/(app)/dashboard/page.tsx`
- `frontend/components/accounts/AccountCard.tsx`
- `frontend/components/accounts/ConnectXButton.tsx`

**UI:**

- Grid of `AccountCard` components (avatar, username, # of sites, # of posts)
- "Connect X Account" button → calls `GET /api/v1/x/oauth/start` → redirects to X

**Acceptance Criteria:**

- [ ] Shows all connected X accounts
- [ ] "Connect X Account" button starts the OAuth flow
- [ ] Empty state with call-to-action if no accounts
- [ ] Each card links to `/accounts/[accountId]`

---

## EPIC SITES — News Sites Management

---

### SITES-001 — RSS Auto-Detection Service (Backend)

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | High     |
| Dependencies | CORE-004 |

**File:** `backend/src/services/scraper/rss-detector.ts`

**Logic:**

1. Fetch the site URL (with a 10s timeout)
2. Parse HTML with `cheerio`
3. Find `<link rel="alternate" type="application/rss+xml">` or `type="application/atom+xml"`
4. Return `{ feedUrl: string | null }`

**Acceptance Criteria:**

- [ ] Returns `feedUrl` for sites with RSS tags in their `<head>`
- [ ] Returns `null` for sites without RSS
- [ ] Handles fetch timeout gracefully (return `null`, no throw)

---

### SITES-002 — News Sites CRUD Routes (Backend)

| Field        | Value               |
| ------------ | ------------------- |
| Status       | DONE                |
| Priority     | Critical            |
| Dependencies | SITES-001, CORE-001 |

**File:** `backend/src/routes/sites.ts`

**Endpoints:**

```
GET    /api/v1/accounts/:accountId/sites           → list sites
POST   /api/v1/accounts/:accountId/sites           → create site
PUT    /api/v1/accounts/:accountId/sites/:siteId   → update site
DELETE /api/v1/accounts/:accountId/sites/:siteId   → delete site
POST   /api/v1/accounts/:accountId/sites/:siteId/test → test scraper (preview only, no DB save)
```

**On POST (create):** automatically call `rss-detector.ts` to attempt RSS discovery. Set `source_type` and `feed_url` accordingly.

**Zod schema for body:**

```typescript
z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  scraping_interval_hours: z.number().int().min(1).max(168).default(4),
  scraping_config: z.object({ ... }).optional(),
})
```

**Acceptance Criteria:**

- [ ] POST auto-detects RSS and sets `source_type`
- [ ] Test endpoint returns up to 5 article previews without saving to DB
- [ ] User cannot manage sites belonging to another user's X account

---

### SITES-003 — News Sites UI (Frontend)

| Field        | Value               |
| ------------ | ------------------- |
| Status       | DONE                |
| Priority     | High                |
| Dependencies | SITES-002, AUTH-004 |

**Files:**

- `frontend/app/(app)/accounts/[accountId]/sites/page.tsx`
- `frontend/app/(app)/accounts/[accountId]/sites/new/page.tsx`
- `frontend/app/(app)/accounts/[accountId]/sites/[siteId]/page.tsx`
- `frontend/components/sites/SiteTable.tsx`
- `frontend/components/sites/SiteForm.tsx`
- `frontend/components/sites/ScraperPreview.tsx`

**SiteForm notes:**

- After entering URL, call the test endpoint to show RSS detection result
- Show `ScraperPreview` component with fetched articles before saving
- Toggle `is_active` via `Switch` component

**Acceptance Criteria:**

- [ ] Table lists all sites with: name, URL, source_type badge, last scraped, status toggle
- [ ] Add/edit form shows RSS detection feedback automatically
- [ ] Preview panel shows up to 5 articles before saving
- [ ] Deleting a site shows a confirmation `AlertDialog`

---

## EPIC SCRAPER — Scraping Engine

---

### SCRAPER-001 — RSS Scraper Service

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Critical |
| Dependencies | CORE-004 |

**File:** `backend/src/services/scraper/rss.ts`

**Function signature:**

```typescript
export async function scrapeRss(
  feedUrl: string,
  maxArticles?: number,
): Promise<ScrapedArticleInput[]>;
```

**Notes:**

- Use `rss-parser` library
- Return: `{ url, title, summary, published_at }`
- `summary`: use `content:encoded` stripped of HTML, truncated to 500 chars, or `description` field
- `maxArticles` defaults to `MAX_ARTICLES_PER_RUN = 20`

**Acceptance Criteria:**

- [ ] Returns array of `ScrapedArticleInput` for a valid RSS URL
- [ ] Handles invalid/unreachable URL gracefully (returns `[]`, logs error)
- [ ] Summary is plain text (no HTML tags), max 500 chars
- [ ] Unit tests in `backend/src/services/scraper/rss.test.ts`: parses a fixture RSS feed string; returns `[]` on network error (mocked `fetch`); strips HTML from summary

---

### SCRAPER-002 — HTML Scraper Service

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | High     |
| Dependencies | CORE-004 |

**File:** `backend/src/services/scraper/html.ts`

**Function signature:**

```typescript
export async function scrapeHtml(
  siteUrl: string,
  config: ScrapingConfig,
  maxArticles?: number,
): Promise<ScrapedArticleInput[]>;
```

**ScrapingConfig type:**

```typescript
interface ScrapingConfig {
  article_selector: string;
  title_selector: string;
  summary_selector: string;
  link_selector: string;
}
```

**Notes:**

- Use `cheerio`
- Add `2000ms` delay before each request
- Set a realistic `User-Agent` header
- Resolve relative URLs to absolute using the `siteUrl` base

**Acceptance Criteria:**

- [ ] Returns articles based on provided CSS selectors
- [ ] Handles selector mismatch gracefully (returns `[]`)
- [ ] User-Agent header is set
- [ ] Relative URLs are resolved to absolute
- [ ] Unit tests in `backend/src/services/scraper/html.test.ts`: parses a fixture HTML string with `cheerio` directly (no real HTTP); returns `[]` when selectors produce no matches; resolves relative `href` to absolute URL

---

### SCRAPER-003 — Scraper Runner & Orchestrator

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Status       | DONE                               |
| Priority     | Critical                           |
| Dependencies | SCRAPER-001, SCRAPER-002, CORE-004 |

**File:** `backend/src/services/scraper/runner.ts`

**Responsibilities:**

1. Query all active `news_sites` (or a single site by ID)
2. For each site, call the appropriate scraper (`rss.ts` or `html.ts`)
3. Insert articles with `ON CONFLICT (news_site_id, url) DO NOTHING`
4. Log execution in `scraping_runs`
5. Call `AiService.processNewArticles(x_account_id)` after storing articles

**Function signatures:**

```typescript
export class ScraperRunner {
  static async runAll(): Promise<void>;
  static async runSite(siteId: string): Promise<ScrapingRunResult>;
}
```

**Acceptance Criteria:**

- [ ] Only processes `is_active = true` sites
- [ ] Creates a `scraping_runs` row with `started_at`, `finished_at`, `status`, `articles_found`
- [ ] Failure on one site does not stop processing of other sites
- [ ] Logs are written at info/error level (Fastify pino logger)

---

### SCRAPER-004 — Scraping Routes (Backend)

| Field        | Value       |
| ------------ | ----------- |
| Status       | DONE        |
| Priority     | High        |
| Dependencies | SCRAPER-003 |

**File:** `backend/src/routes/scrape.ts`

**Endpoints:**

```
POST /api/v1/scrape/run              → run all active sites (admin or cron secret)
POST /api/v1/scrape/run/:siteId      → run specific site (owner auth)
GET  /api/v1/accounts/:id/sites/:siteId/runs  → list run history
```

**Notes:**

- `POST /run` is protected by either admin role OR `x-cron-secret` header matching `CRON_SECRET` env var
- `POST /run/:siteId` verifies the requesting user owns the site

**Acceptance Criteria:**

- [ ] Cron secret in header allows triggering run without JWT
- [ ] Returns `{ articlesFound: number, status: string }` from a run
- [ ] Run history returns paginated `scraping_runs` rows

---

### SCRAPER-005 — Cron Job Scheduler

| Field        | Value                  |
| ------------ | ---------------------- |
| Status       | DONE                   |
| Priority     | Critical               |
| Dependencies | SCRAPER-003, SETUP-002 |

**File:** `backend/src/jobs/index.ts`

```typescript
import cron from 'node-cron';
import { ScraperRunner } from '../services/scraper/runner';

export function registerJobs(logger: FastifyBaseLogger) {
  cron.schedule('0 */4 * * *', async () => {
    logger.info('Cron: starting scheduled scraping run');
    await ScraperRunner.runAll();
  });
  logger.info('Cron jobs registered');
}
```

Called in `backend/src/server.ts` before `fastify.listen()`.

**Acceptance Criteria:**

- [ ] `registerJobs()` called at server startup
- [ ] Job fires at the correct cron expression
- [ ] Exceptions inside the job are caught and logged (do not crash the server)

---

## EPIC AI — AI Integration

---

### AI-001 — AI Provider Abstraction

| Field        | Value               |
| ------------ | ------------------- |
| Status       | DONE                |
| Priority     | Critical            |
| Dependencies | CORE-004, SETUP-002 |

**Files:**

- `backend/src/services/ai/provider.ts` — interface + factory function
- `backend/src/services/ai/openai.ts` — OpenAI implementation
- `backend/src/services/ai/anthropic.ts` — Anthropic implementation

**Interface:**

```typescript
export interface AiProvider {
  generateSuggestion(title: string, summary: string): Promise<{ text: string; hashtags: string[] }>;
}

export function createAiProvider(): AiProvider {
  // Returns OpenAiProvider or AnthropicProvider based on config.AI_PROVIDER
}
```

**Model defaults:**

- OpenAI: `gpt-4o-mini`
- Anthropic: `claude-haiku-4-5-20251001`

**Acceptance Criteria:**

- [ ] Factory returns the correct provider based on `AI_PROVIDER` env var
- [ ] Both implementations fulfill the same interface
- [ ] Generated `text` is always ≤ 280 characters
- [ ] Generated `hashtags` is always a `string[]`
- [ ] Unit tests in `backend/src/services/ai/openai.test.ts` and `anthropic.test.ts`: mock the respective SDK client; assert the prompt is called with correct arguments; assert malformed JSON from the AI is handled gracefully (returns error, does not throw)

---

### AI-002 — Prompt Templates

| Field        | Value  |
| ------------ | ------ |
| Status       | DONE   |
| Priority     | High   |
| Dependencies | AI-001 |

**File:** `backend/src/services/ai/prompts.ts`

**System prompt (example):**

```
You are a social media expert specializing in news content.
Given a news article title and summary, generate a compelling post for X (Twitter).

Rules:
- The post must be ≤ 280 characters (including hashtags)
- Write in the same language as the article
- End with 2-3 relevant hashtags
- Be engaging and informative
- Do not use emojis unless the brand voice calls for it

Respond ONLY with valid JSON: { "text": "...", "hashtags": ["...", "..."] }
```

**Acceptance Criteria:**

- [ ] Prompt is a pure function with no side effects
- [ ] Response parser handles malformed JSON from AI (returns error, does not throw)
- [ ] Output always fits the `AiSuggestion` shape

---

### AI-003 — AI Processing Pipeline

| Field        | Value          |
| ------------ | -------------- |
| Status       | DONE           |
| Priority     | Critical       |
| Dependencies | AI-001, AI-002 |

**File:** `backend/src/services/ai/suggest.ts`

**Responsibilities:**

1. Query `scraped_articles WHERE is_processed = false AND news_site_id IN (sites of x_account_id)`
2. For each article, call `aiProvider.generateSuggestion()`
3. Save result to `ai_suggestions` (status: `'pending'`)
4. Set `scraped_articles.is_processed = true`
5. Process articles in batches of 5 (avoid rate limits)

Called by `ScraperRunner` after articles are saved.

**Acceptance Criteria:**

- [ ] Unprocessed articles get suggestions created
- [ ] `is_processed` is set to `true` after suggestion is saved
- [ ] AI errors for one article do not stop processing of others
- [ ] Batch processing with configurable size

---

### AI-004 — AI Suggestion Routes (Backend)

| Field        | Value  |
| ------------ | ------ |
| Status       | DONE   |
| Priority     | High   |
| Dependencies | AI-003 |

**File:** `backend/src/routes/ai.ts`

**Endpoints:**

```
POST  /api/v1/ai/suggest/:articleId   → manually trigger suggestion for one article
PATCH /api/v1/suggestions/:id/status  → update status (approved/rejected)
```

**PATCH body:**

```typescript
z.object({ status: z.enum(['approved', 'rejected']) });
```

**Acceptance Criteria:**

- [ ] Manual trigger creates and returns a new suggestion
- [ ] Status update sets `reviewed_at` and `reviewed_by`
- [ ] User can only update suggestions linked to their X accounts

---

## EPIC TIMELINE — Timeline

---

### TIMELINE-001 — Timeline API Route (Backend)

| Field        | Value             |
| ------------ | ----------------- |
| Status       | DONE              |
| Priority     | Critical          |
| Dependencies | AI-004, POSTS-002 |

**File:** `backend/src/routes/timeline.ts`

**Endpoint:**

```
GET /api/v1/accounts/:accountId/timeline?page=1&limit=20&status=pending&site_id=&from=&to=
```

**Response:** Merged list of `ai_suggestions` and `posts`, sorted by `created_at DESC`.

Each item includes a `type` discriminator: `'suggestion'` | `'post'`.

**Acceptance Criteria:**

- [ ] Returns merged, sorted list of suggestions and posts
- [ ] Supports filtering by `status`, `site_id`, `from`, `to`
- [ ] Supports pagination (`page`, `limit`)
- [ ] Response includes `pagination` metadata

---

### TIMELINE-002 — Timeline Page (Frontend)

| Field        | Value                  |
| ------------ | ---------------------- |
| Status       | DONE                   |
| Priority     | Critical               |
| Dependencies | TIMELINE-001, AUTH-004 |

**Files:**

- `frontend/app/(app)/accounts/[accountId]/timeline/page.tsx`
- `frontend/components/timeline/TimelineItem.tsx` — router: renders `SuggestionCard` or `PostCard`
- `frontend/components/timeline/SuggestionCard.tsx`
- `frontend/components/timeline/PostCard.tsx`

**SuggestionCard UI:**

- Shows article title + site name as context
- Editable text area (pre-filled with `suggestion_text`)
- Character counter (280 max) — red when over limit
- Actions: Approve & Publish, Edit & Publish, Reject
- Status badge

**PostCard UI:**

- Shows published content
- Link to X post (`x_post_url`)
- Published date

**Acceptance Criteria:**

- [ ] Timeline loads and displays items with infinite scroll or pagination
- [ ] SuggestionCard allows inline editing before publishing
- [ ] Character counter updates in real-time
- [ ] Status changes are reflected immediately (optimistic update)

---

### TIMELINE-003 — Timeline Filters (Frontend)

| Field        | Value        |
| ------------ | ------------ |
| Status       | DONE         |
| Priority     | Medium       |
| Dependencies | TIMELINE-002 |

**File:** `frontend/components/timeline/TimelineFilters.tsx`

**Filters:**

- Status: All / Pending / Approved / Rejected / Posted
- Source site: dropdown of the account's sites
- Date range: from / to (shadcn/ui `DatePicker`)

**Acceptance Criteria:**

- [ ] Selecting a filter re-fetches timeline with filter params
- [ ] Active filters are shown as removable badges
- [ ] "Clear filters" button resets to defaults

---

## EPIC POSTS — X Posting

---

### POSTS-001 — X Posting Service (Backend)

| Field        | Value        |
| ------------ | ------------ |
| Status       | DONE         |
| Priority     | Critical     |
| Dependencies | XACCOUNT-001 |

**File:** `backend/src/services/x-api/client.ts`

**Responsibilities:**

1. Decrypt `oauth_access_token_enc` from `x_accounts`
2. Check if token is expired → refresh if needed (using `oauth_refresh_token_enc`)
3. Call `POST /2/tweets` via `twitter-api-v2`
4. On `401` during post → attempt token refresh once, then retry

```typescript
export class XApiClient {
  constructor(private xAccount: XAccount) {}
  async postTweet(text: string): Promise<{ tweetId: string; tweetUrl: string }>;
}
```

**Acceptance Criteria:**

- [ ] Successfully posts a tweet and returns the post ID + URL
- [ ] Automatically refreshes expired tokens
- [ ] Updated tokens are saved back to the DB (re-encrypted)
- [ ] Tokens never appear in logs
- [ ] Unit tests in `backend/src/services/x-api/client.test.ts`: mock `twitter-api-v2` and the Supabase client; assert that a successful tweet returns `tweetId` and `tweetUrl`; assert that a `401` response triggers one token refresh and retry; assert that the refreshed token is re-encrypted before being saved

---

### POSTS-002 — Post Routes (Backend)

| Field        | Value             |
| ------------ | ----------------- |
| Status       | DONE              |
| Priority     | Critical          |
| Dependencies | POSTS-001, AI-004 |

**File:** `backend/src/routes/posts.ts`

**Endpoints:**

```
POST /api/v1/accounts/:accountId/posts        → publish to X
GET  /api/v1/accounts/:accountId/posts        → list post history
```

**POST body:**

```typescript
z.object({
  suggestion_id: z.string().uuid().optional(),
  content: z.string().min(1).max(280),
});
```

**On POST:**

1. Verify user owns the `accountId`
2. Create `XApiClient` for the account
3. Call `postTweet(content)`
4. Save to `posts` table
5. If `suggestion_id` provided → update `ai_suggestions.status = 'posted'`

**Acceptance Criteria:**

- [ ] Returns the saved `post` object with `x_post_id` and `x_post_url`
- [ ] On X API error → save `posts` row with `status = 'failed'` + `error_message`
- [ ] User cannot post to another user's X account

---

### POSTS-003 — Publish Action (Frontend)

| Field        | Value                   |
| ------------ | ----------------------- |
| Status       | DONE                    |
| Priority     | Critical                |
| Dependencies | POSTS-002, TIMELINE-002 |

**File:** `frontend/components/timeline/PublishDialog.tsx`

**Flow:**

1. User clicks "Publish" on a `SuggestionCard`
2. `PublishDialog` opens with the editable text (final chance to edit)
3. Character counter shown
4. Confirm → call `POST /api/v1/accounts/:accountId/posts`
5. On success → toast notification + optimistic update of timeline item

**Acceptance Criteria:**

- [ ] Dialog shows final preview of the text
- [ ] "Publish" button disabled if text > 280 chars
- [ ] Success shows toast: "Post published successfully"
- [ ] Error shows toast: "Failed to publish: [error message]"
- [ ] Loading state during the API call

---

## EPIC ADMIN — Admin Panel

---

### ADMIN-001 — Admin Layout & Guard

| Field        | Value              |
| ------------ | ------------------ |
| Status       | DONE               |
| Priority     | Medium             |
| Dependencies | AUTH-004, CORE-002 |

**Files:**

- `frontend/app/(app)/admin/layout.tsx`
- Backend: `CORE-002` already handles role check at API level

**Notes:**

- Frontend layout checks `user.role === 'admin'` — redirects to `/dashboard` if not
- This is UI-only protection; the backend middleware is the real gate

**Acceptance Criteria:**

- [ ] Non-admin users are redirected away from `/admin/*`
- [ ] Admin sidebar section only visible to admins (AUTH-004)

---

### ADMIN-002 — User Management Page

| Field        | Value     |
| ------------ | --------- |
| Status       | DONE      |
| Priority     | Medium    |
| Dependencies | ADMIN-001 |

**Files:**

- `frontend/app/(app)/admin/users/page.tsx`
- Backend: `GET /api/v1/admin/users` and `PATCH /api/v1/admin/users/:id/role`

**UI:**

- Table: email, display name, role, created at
- Dropdown per row to change role (`admin` / `member`)
- Confirmation dialog before role change

**Acceptance Criteria:**

- [ ] Lists all users with their current role
- [ ] Role change updates immediately in the table
- [ ] Admin cannot remove their own admin role

---

## EPIC UX — User Experience

---

### UX-001 — Breadcrumb Navigation

| Field        | Value    |
| ------------ | -------- |
| Status       | TODO     |
| Priority     | Medium   |
| Dependencies | AUTH-004 |

**Goal:** Add breadcrumb navigation to all pages that are not direct sidebar routes.

**Deliverables:**

- `frontend/components/layout/Breadcrumb.tsx`
- Breadcrumb component integrated in all non-sidebar pages

**Implementation Notes:**

- Use shadcn/ui Breadcrumb component
- Breadcrumbs should be dynamically generated based on current route
- Format: Home > Parent Page > Current Page
- Exclude direct sidebar routes (Dashboard, Admin, etc.)

**Acceptance Criteria:**

- [ ] Breadcrumb appears on all non-sidebar pages
- [ ] Each breadcrumb item is clickable and navigates correctly
- [ ] Active page is not clickable
- [ ] Responsive design works on mobile

---

### UX-002 — Full Article Summary Generation

| Field        | Value               |
| ------------ | ------------------- |
| Status       | TODO                |
| Priority     | High                |
| Dependencies | SCRAPER-003, AI-003 |

**Goal:** Store full article URL and generate bullet-point summaries when articles are approved for publication.

**Deliverables:**

- `scraped_articles` table: add `full_article_url` column
- `ai_suggestions` table: add `article_summary` JSONB column for bullet points
- `backend/src/services/scraper/article-fetcher.ts` — fetch and parse full article
- `backend/src/services/ai/summarizer.ts` — generate bullet-point summary

**Implementation Notes:**

Migration:

```sql
ALTER TABLE scraped_articles ADD COLUMN full_article_url TEXT;
ALTER TABLE ai_suggestions ADD COLUMN article_summary JSONB;
```

When article is approved:

1. Fetch full article content from `full_article_url`
2. Send to AI with prompt: "Generate a bullet-point summary (3-5 points) of this article"
3. Store result in `article_summary` as `{ bullets: string[] }`

**Acceptance Criteria:**

- [ ] Scraper stores full article URL when available
- [ ] On approval, full article is fetched and parsed
- [ ] AI generates 3-5 bullet points in Portuguese/article language
- [ ] Summary is stored in `article_summary` column
- [ ] Frontend displays bullet points in article detail view

---

### UX-003 — Dashboard Reorganization

| Field        | Value        |
| ------------ | ------------ |
| Status       | TODO         |
| Priority     | High         |
| Dependencies | XACCOUNT-003 |

**Goal:** Move current dashboard to a new "Accounts" route and prepare for dashboard redesign.

**Deliverables:**

- `frontend/app/(app)/accounts/page.tsx` — move current dashboard here
- Update sidebar to show both Dashboard and Accounts routes
- Redirect logic from `/dashboard` to new home

**Implementation Notes:**

- Current `/dashboard` shows list of X accounts → move to `/accounts`
- Sidebar structure:
  - Dashboard (new, will be home after UX-007)
  - Accounts (current dashboard content)
  - Admin (if admin role)

**Acceptance Criteria:**

- [ ] `/accounts` shows the list of connected X accounts (current dashboard)
- [ ] Sidebar shows "Accounts" link below "Dashboard"
- [ ] All links and navigation updated to use new routes
- [ ] No broken links or 404s

---

### UX-004 — Account Settings Page

| Field        | Value        |
| ------------ | ------------ |
| Status       | TODO         |
| Priority     | High         |
| Dependencies | XACCOUNT-003 |

**Goal:** Create account settings page with tabs for account data and prompt configuration.

**Deliverables:**

- `frontend/app/(app)/accounts/[accountId]/settings/page.tsx`
- `frontend/components/accounts/settings/AccountDataTab.tsx`
- `frontend/components/accounts/settings/PromptRulesTab.tsx`
- `backend/src/routes/accounts.ts` — add `PATCH /api/v1/accounts/:id` endpoint

**Implementation Notes:**

- Use shadcn/ui Tabs component
- Tab 1: Account Data
  - Display name (editable)
  - X username (read-only)
  - Connected date (read-only)
  - Disconnect button
- Tab 2: Prompt Rules (see UX-005)

**Acceptance Criteria:**

- [ ] Settings page accessible from account card or account detail page
- [ ] Account data can be viewed and edited
- [ ] Changes persist to database
- [ ] Success/error toasts on save
- [ ] Navigation between tabs works smoothly

---

### UX-005 — AI Prompt Rules System

| Field        | Value          |
| ------------ | -------------- |
| Status       | TODO           |
| Priority     | Critical       |
| Dependencies | AI-003, UX-004 |

**Goal:** Allow users to configure custom AI prompts for analysis and publication.

**Deliverables:**

- Database migration: create `prompt_rules` table
- `backend/src/routes/prompt-rules.ts` — CRUD endpoints
- `frontend/components/accounts/settings/PromptRuleForm.tsx`
- `backend/src/services/ai/prompt-builder.ts` — combine rules with base prompts

**Implementation Notes:**

Migration:

```sql
CREATE TABLE prompt_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id UUID NOT NULL REFERENCES x_accounts(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('analysis', 'publication')),
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prompt_rules_account ON prompt_rules(x_account_id);
```

Rule Types:

- `analysis`: Used to decide if article should be suggested or discarded
- `publication`: Used to generate the final X post text

When processing articles:

1. Load all active `analysis` rules for the account (ordered by priority)
2. Append rules to base analysis prompt
3. AI decides: suggest or discard
4. If suggested, load `publication` rules and generate post

**Acceptance Criteria:**

- [ ] Users can create, edit, delete, and toggle prompt rules
- [ ] Rules are ordered by priority
- [ ] Analysis rules filter which articles become suggestions
- [ ] Publication rules influence the generated post text
- [ ] Rules are applied in the AI processing pipeline
- [ ] Frontend shows rule type badge and priority

---

### UX-006 — Article Detail Page

| Field        | Value                           |
| ------------ | ------------------------------- |
| Status       | TODO                            |
| Priority     | High                            |
| Dependencies | TIMELINE-002, UX-002, POSTS-002 |

**Goal:** Create a detailed view for each article/suggestion/post with vertical stepper showing progression.

**Deliverables:**

- `frontend/app/(app)/accounts/[accountId]/timeline/[itemId]/page.tsx`
- `frontend/components/timeline/detail/DetailStepper.tsx`
- `frontend/components/timeline/detail/OriginalArticleStep.tsx`
- `frontend/components/timeline/detail/SuggestionStep.tsx`
- `frontend/components/timeline/detail/PublicationStep.tsx`
- `backend/src/routes/timeline.ts` — add `GET /api/v1/timeline/items/:id` endpoint

**Implementation Notes:**

Vertical Stepper steps:

1. **Original Article**
   - Article title, source site, published date
   - Full article URL (link)
   - Summary (bullet points from UX-002)
   - Scraped date

2. **AI Suggestion** (if exists)
   - Suggestion text
   - Hashtags
   - Generated timestamp
   - Status badge (pending/approved/rejected)
   - If processed: show AI output and timestamp
   - If not processed: show "Process Article" button with custom prompt field

3. **Publication** (if exists)
   - Published text
   - Published timestamp
   - X post URL (external link)
   - Status (published/failed)
   - If failed: error message

**Acceptance Criteria:**

- [ ] Stepper shows completed steps in green, pending in gray
- [ ] Each step displays all relevant information
- [ ] "Process Article" button triggers AI processing with optional custom prompt
- [ ] X post link opens in new tab
- [ ] Page is responsive and works on mobile
- [ ] Back button returns to timeline

---

### UX-007 — Dashboard Redesign

| Field        | Value                           |
| ------------ | ------------------------------- |
| Status       | TODO                            |
| Priority     | Critical                        |
| Dependencies | UX-003, TIMELINE-002, POSTS-002 |

**Goal:** Redesign dashboard as the main landing page showing posts awaiting approval and recently published posts.

**Deliverables:**

- `frontend/app/(app)/dashboard/page.tsx` — completely rewritten
- `frontend/components/dashboard/AccountSelector.tsx`
- `frontend/components/dashboard/PendingPostsSection.tsx`
- `frontend/components/dashboard/PublishedPostsSection.tsx`
- `frontend/components/dashboard/RejectedPostsToggle.tsx`
- Backend: reuse existing timeline/posts endpoints with filters

**Implementation Notes:**

Dashboard sections:

1. **Header**
   - Account selector dropdown (switch between user's accounts)
   - Selected account name and avatar

2. **Pending Approval** (default view)
   - Grid/list of suggestions with status = 'pending'
   - Quick actions: Approve, Reject, View Detail
   - Empty state if no pending items

3. **Published** (toggle tab)
   - Grid/list of posts with status = 'published'
   - Shows published date and X post link

4. **Rejected** (optional toggle)
   - Hidden by default
   - Shows rejected suggestions with reason (if any)

First screen after login:

- Redirect from `/login` to `/dashboard` (already done)
- If user has no accounts, show onboarding CTA to connect X account
- If user has accounts, default to first account

**Acceptance Criteria:**

- [ ] Dashboard is the first screen after login
- [ ] Account selector allows switching between user's accounts
- [ ] Pending posts section shows all items awaiting approval
- [ ] Published posts section shows recent posts with links
- [ ] Rejected posts can be toggled on/off
- [ ] Quick actions work (approve, reject, view detail)
- [ ] Empty states have helpful CTAs
- [ ] Responsive design for mobile and tablet

---

### UX-008 — Statistics Dashboard

| Field        | Value             |
| ------------ | ----------------- |
| Status       | TODO              |
| Priority     | High              |
| Dependencies | POSTS-002, UX-007 |

**Goal:** Create a statistics page showing posting activity over time with charts and metrics.

**Deliverables:**

- `frontend/app/(app)/accounts/[accountId]/stats/page.tsx`
- `frontend/components/stats/PostingChart.tsx`
- `frontend/components/stats/MetricsCards.tsx`
- `backend/src/routes/stats.ts` — statistics aggregation endpoints
- Add "Statistics" link to sidebar

**Implementation Notes:**

Endpoint:

```
GET /api/v1/accounts/:accountId/stats?from=&to=
```

Response:

```typescript
{
  dailyPosts: { date: string, count: number }[],
  metrics: {
    avgPerDay: number,
    avgPerWeek: number,
    avgPerMonth: number,
    totalPosts: number
  }
}
```

UI Components:

1. **Date Range Filter**
   - Presets: Last 7 days, Last 30 days, Last 90 days, Custom range
   - shadcn/ui DatePicker for custom range

2. **Metrics Cards** (top row)
   - Total posts in period
   - Average per day
   - Average per week
   - Average per month

3. **Posting Chart** (main)
   - Use Recharts or similar charting library
   - Bar/line chart showing posts per day
   - X-axis: dates, Y-axis: post count

**Acceptance Criteria:**

- [ ] Stats page accessible from sidebar under account context
- [ ] Date range filter works and updates chart
- [ ] Metrics cards display accurate averages
- [ ] Chart renders correctly with data
- [ ] Empty state when no posts in selected period
- [ ] Chart is responsive and works on mobile
- [ ] Data is fetched efficiently (use aggregation, not full post list)

---

## EPIC FLOW — News Flow Redesign

> **Contexto:** O fluxo atual está incorreto. O `processNewArticles()` usa as `publication` rules para gerar o tweet **logo após o scrape**, misturando as fases de análise e publicação. O redesenho separa o ciclo em 4 fases distintas com responsabilidades claras.
>
> **Fluxo correto:**
>
> ```
> Scrape → Análise (rules: analysis) → Revisão Manual → Aprovação → Publicação (rules: publication)
>                                                ↑ auto_flow=true: pula revisão manual
> ```

---

### FLOW-001 — DB — auto_flow em news_sites

| Field        | Value    |
| ------------ | -------- |
| Status       | TODO     |
| Priority     | Critical |
| Dependencies | DB-004   |

**Goal:** Adicionar coluna `auto_flow` à tabela `news_sites`. Quando `true`, artigos elegíveis passam diretamente da fase de análise para publicação, sem revisão manual.

**Migration:** `supabase/migrations/014_news_sites_auto_flow.sql`

```sql
ALTER TABLE public.news_sites
  ADD COLUMN auto_flow BOOLEAN NOT NULL DEFAULT false;
```

**Acceptance Criteria:**

- [ ] Migration roda sem erros
- [ ] Coluna `auto_flow` disponível na tabela `news_sites`
- [ ] `DEFAULT false` → sites existentes mantêm comportamento manual
- [ ] Tipos TypeScript regenerados (`pnpm db:types`)

---

### FLOW-002 — DB — suggestion_text nullable

| Field        | Value    |
| ------------ | -------- |
| Status       | TODO     |
| Priority     | Critical |
| Dependencies | DB-004   |

**Goal:** Tornar `ai_suggestions.suggestion_text` nullable. Na fase de análise, apenas a elegibilidade é determinada — o texto do tweet só é gerado na aprovação (FLOW-004). O campo precisa aceitar `NULL` durante o estado `pending`.

**Migration:** `supabase/migrations/015_ai_suggestions_nullable_text.sql`

```sql
ALTER TABLE public.ai_suggestions
  ALTER COLUMN suggestion_text DROP NOT NULL;
```

**Acceptance Criteria:**

- [ ] Migration roda sem erros
- [ ] `ai_suggestions` aceita `INSERT` com `suggestion_text = NULL`
- [ ] Restrição `CHECK (status IN (...))` permanece intacta
- [ ] Tipos TypeScript regenerados

---

### FLOW-003 — Backend — Fase de Análise (Elegibilidade)

| Field        | Value                      |
| ------------ | -------------------------- |
| Status       | TODO                       |
| Priority     | Critical                   |
| Dependencies | FLOW-001, FLOW-002, AI-003 |

**Goal:** Substituir o comportamento atual de `processNewArticles()`. Em vez de gerar o tweet imediatamente com `publication` rules, usar `analysis` rules para decidir se o artigo é elegível. Somente artigos elegíveis criam um registro `ai_suggestion`.

**Problema atual:** `suggest.ts` chama `buildPublicationPrompt` no `processNewArticles()` — errado. Deve chamar `buildAnalysisPrompt`.

**Arquivos a modificar:**

- `backend/src/services/ai/suggest.ts` — refatorar `processNewArticles()`
- `backend/src/services/ai/prompts.ts` — adicionar `buildAnalysisSystemPrompt()` e `parseAnalysisResponse()`

**Novo prompt de análise:**

```
System: Você é um editor de conteúdo. Avalie se o artigo a seguir é adequado para ser publicado
como post no X (Twitter) para esta conta, seguindo as regras definidas.
Responda SOMENTE com JSON: { "eligible": true|false, "reason": "..." }

[+ analysis rules do usuário via buildAnalysisPrompt()]
```

**Novo comportamento de `processNewArticles()`:**

```typescript
// Para cada artigo não processado:
// 1. Chamar AI com buildAnalysisPrompt() (NÃO buildPublicationPrompt)
// 2. Parsear resposta: { eligible: boolean, reason: string }
// 3a. Se eligible=true:
//     - Criar ai_suggestion(status='pending', suggestion_text=NULL)
//     - NÃO marcar is_processed=true ainda (o texto ainda não foi gerado)
//     - Se site.auto_flow=true → delegar para FLOW-005
// 3b. Se eligible=false:
//     - Marcar scraped_articles.is_processed=true (descartado silenciosamente)
//     - Não criar ai_suggestion
```

**Acceptance Criteria:**

- [ ] `processNewArticles()` usa `buildAnalysisPrompt` (não `buildPublicationPrompt`)
- [ ] Artigos não elegíveis têm `is_processed=true` e nenhuma `ai_suggestion` criada
- [ ] Artigos elegíveis criam `ai_suggestion(status='pending', suggestion_text=NULL)`
- [ ] Erros em um artigo não param o processamento dos demais
- [ ] Sem `auto_flow`: artigo fica em `pending` aguardando revisão manual
- [ ] Com `auto_flow=true`: delega para o serviço de publicação (FLOW-005)

---

### FLOW-004 — Backend — Geração do Post na Aprovação

| Field        | Value                      |
| ------------ | -------------------------- |
| Status       | TODO                       |
| Priority     | Critical                   |
| Dependencies | FLOW-002, FLOW-003, AI-003 |

**Goal:** Quando o usuário aprova uma sugestão (`PATCH /api/v1/suggestions/:id/status` com `status='approved'`), a IA deve usar as `publication` rules para gerar o texto do tweet e o `article_summary`. Somente **então** o `suggestion_text` é preenchido.

**Arquivo a modificar:** `backend/src/routes/ai.ts`

**Comportamento atual (errado):** O endpoint de aprovação apenas atualiza o status e chama `generateArticleSummary`. O tweet já existia desde o scrape.

**Comportamento novo (correto):**

```typescript
// PATCH /api/v1/suggestions/:id/status { status: 'approved' }
// 1. Buscar suggestion + article (incluindo article.url e article.full_article_content)
// 2. Obter conteúdo completo do artigo:
//    a. Se article.full_article_content != null → usar diretamente
//    b. Se null → chamar fetchArticleContent(article.url) → salvar em scraped_articles.full_article_content
// 3. Chamar AI com buildPublicationPrompt() passando o conteúdo completo (não o resumo RSS)
//    → gera tweet text + hashtags baseado no artigo inteiro
// 4. Chamar generateArticleSummary() com o conteúdo completo → gera bullets do artigo
// 5. UPDATE ai_suggestions SET
//      status = 'approved',
//      suggestion_text = <tweet gerado>,
//      hashtags = <hashtags geradas>,
//      article_summary = <bullets>,
//      reviewed_at = now(),
//      reviewed_by = user_id
// 6. Marcar scraped_articles.is_processed = true
```

> **Observação importante — Conteúdo completo vs. resumo RSS:**
> Durante a fase de análise (FLOW-003), a IA usa apenas o título + resumo do RSS (rápido, barato).
> Na geração do post (aprovação manual ou automática), a IA **deve** usar o artigo completo
> para produzir um tweet de qualidade. O campo `scraped_articles.full_article_content` serve como
> cache: se já foi buscado, reutilizar. Se não, buscar de `scraped_articles.url` via
> `fetchArticleContent()` (serviço definido em UX-002 / `article-fetcher.ts`) e persisti-lo antes
> de chamar a IA. Isso garante que o tweet reflete o conteúdo real do artigo, não só o teaser do RSS.

**Acceptance Criteria:**

- [ ] Aprovação busca o artigo completo via `fetchArticleContent()` se não em cache
- [ ] Conteúdo completo é persistido em `scraped_articles.full_article_content`
- [ ] `buildPublicationPrompt` recebe conteúdo completo do artigo (não resumo RSS)
- [ ] `suggestion_text` preenchido com tweet gerado (≤ 280 chars)
- [ ] `article_summary` gerado com bullets (3-5 pontos) a partir do conteúdo completo
- [ ] `is_processed = true` marcado no artigo
- [ ] Rejeição apenas atualiza status — nenhuma chamada de IA

---

### FLOW-005 — Backend — Fluxo Automático por Site

| Field        | Value                         |
| ------------ | ----------------------------- |
| Status       | TODO                          |
| Priority     | High                          |
| Dependencies | FLOW-003, FLOW-004, POSTS-002 |

**Goal:** Quando `news_sites.auto_flow = true`, artigos aprovados pela fase de análise são processados e publicados automaticamente, sem revisão manual.

**Arquivo a modificar:** `backend/src/services/ai/suggest.ts`

**Lógica de auto_flow:**

```typescript
// Após análise confirmar elegibilidade (FLOW-003):
if (site.auto_flow) {
  // 1. Buscar conteúdo completo do artigo:
  //    a. Se article.full_article_content != null → usar diretamente
  //    b. Se null → fetchArticleContent(article.url) → salvar em scraped_articles.full_article_content
  // 2. Chamar buildPublicationPrompt() passando o conteúdo completo → gerar tweet
  // 3. Atualizar ai_suggestion(suggestion_text, status='approved')
  // 4. Marcar is_processed=true
  // 5. Chamar XApiClient.postTweet() → publicar
  // 6. Salvar post em posts(status='published' ou 'failed')
  // 7. Atualizar ai_suggestion(status='posted')
}
```

> **Observação:** Igual à aprovação manual (FLOW-004), o auto_flow deve usar o conteúdo completo
> do artigo para gerar o tweet, não o resumo do RSS. Usar a mesma lógica de cache
> (`full_article_content`) para evitar buscar o artigo duas vezes.

**Acceptance Criteria:**

- [ ] Sites com `auto_flow=true` publicam sem intervenção manual
- [ ] Sites com `auto_flow=false` (padrão) mantêm revisão manual
- [ ] Falha na publicação cria `posts(status='failed')` — não lança exceção
- [ ] Suggestion fica com `status='posted'` após publicação bem-sucedida
- [ ] Logs claros diferenciando fluxo manual vs. automático

---

### FLOW-006 — Frontend — SuggestionCard Estado Pending

| Field        | Value              |
| ------------ | ------------------ |
| Status       | TODO               |
| Priority     | High               |
| Dependencies | FLOW-003, FLOW-004 |

**Goal:** Atualizar `SuggestionCard` para refletir o novo estado `pending`: neste estado, o tweet ainda **não foi gerado**. O card deve exibir as informações do **artigo** (título, site, data) e botões de Aprovar / Rejeitar — sem o textarea de edição de tweet.

**Arquivo a modificar:** `frontend/components/timeline/SuggestionCard.tsx`

**Lógica condicional:**

```tsx
// Se suggestion_text === null → fase de elegibilidade (sem tweet)
//   Mostrar: título do artigo, site, data, resumo (se disponível)
//   Ações: [Aprovar] [Rejeitar] [Ver Detalhes]

// Se suggestion_text !== null → tweet gerado (aprovado/revisão final)
//   Mostrar: textarea com tweet, contador de chars, hashtags
//   Ações: [Publicar] [Rejeitar] [Ver Detalhes]
```

**Acceptance Criteria:**

- [ ] `suggestion_text = null` → exibe info do artigo, sem textarea
- [ ] `suggestion_text` preenchido → exibe textarea editável com tweet
- [ ] Ação "Aprovar" em pending dispara geração do tweet (FLOW-004) e recarrega
- [ ] PendingPostsSection do dashboard reflete o novo estado corretamente
- [ ] DetailStepper reflete a ausência de tweet no estado pending

---

### FLOW-007 — Frontend — SiteForm Toggle auto_flow

| Field        | Value               |
| ------------ | ------------------- |
| Status       | TODO                |
| Priority     | High                |
| Dependencies | FLOW-001, SITES-003 |

**Goal:** Adicionar campo `auto_flow` no formulário de criação/edição de sites (`SiteForm`).

**Arquivo a modificar:** `frontend/components/sites/SiteForm.tsx`

**UI:**

```tsx
<div className="flex items-center justify-between rounded-lg border p-4">
  <div>
    <Label>Fluxo Automático</Label>
    <p className="text-muted-foreground text-sm">
      Artigos elegíveis são publicados automaticamente, sem revisão manual.
    </p>
  </div>
  <Switch checked={autoFlow} onCheckedChange={setAutoFlow} />
</div>
```

**Acceptance Criteria:**

- [ ] Toggle visível no formulário de criação e edição de site
- [ ] Valor salvo corretamente via API (`auto_flow: boolean`)
- [ ] Valor carregado corretamente ao editar site existente
- [ ] Tooltip/descrição explica o comportamento do fluxo automático

---

### FLOW-008 — Frontend — DetailStepper 4 Fases

| Field        | Value                      |
| ------------ | -------------------------- |
| Status       | TODO                       |
| Priority     | Medium                     |
| Dependencies | FLOW-003, FLOW-004, UX-006 |

**Goal:** Atualizar o `DetailStepper` para refletir as 4 fases do novo fluxo. Adicionar o step de **Análise de Elegibilidade** entre "Artigo Original" e "Sugestão".

**Arquivo a modificar:** `frontend/components/timeline/detail/DetailStepper.tsx`

**Novo layout do stepper:**

```
Step 1 — Artigo Original
  └─ título, site, data, URL, resumo

Step 2 — Análise de Elegibilidade  ← NOVO
  └─ Status: Elegível / Não Elegível
  └─ (se elegível) data da análise

Step 3 — Revisão
  └─ Status: Pendente / Aprovado / Rejeitado
  └─ (se aprovado) tweet gerado pelo AI
  └─ (se rejeitado) → substitui step 4 com RejectionStep (já implementado)

Step 4 — Publicação
  └─ Status: Publicado / Falhou
  └─ link para o post no X
```

**Acceptance Criteria:**

- [ ] Step 2 "Análise" aparece entre Artigo e Revisão
- [ ] Step 2 mostra resultado da análise (elegível/descartado)
- [ ] Artigos não elegíveis terminam no step 2 (sem step 3 ou 4)
- [ ] Artigos rejeitados pelo usuário mostram RejectionStep no step 3
- [ ] Auto_flow: step 3 marcado como "aprovado automaticamente"
- [ ] Visual diferenciado: verde (concluído), dourado (atual), vermelho (rejeitado), cinza (pendente)

---

_Last updated: 2026-02-25_

---

## EPIC FEAT — New Features (2026-03-03)

---

### FEAT-001 — X Premium Switch + Limite de Caracteres

| Field        | Value                |
| ------------ | -------------------- |
| Status       | DONE                 |
| Priority     | High                 |
| Dependencies | XACCOUNT-002, UX-004 |

**Goal:** Adicionar campo `is_premium` à conta X. Contas premium têm suporte a posts longos: o limite de caracteres sobe de 280 para 25.000. O switch aparece na aba "Dados da Conta" das configurações.

**Arquivos a modificar/criar:**

- `supabase/migrations/016_x_accounts_is_premium.sql` — migration
- `backend/src/routes/accounts.ts` — expor e aceitar `is_premium` via PATCH
- `backend/src/routes/posts.ts` — validar `content` com limite dinâmico (280 vs 25.000)
- `frontend/components/accounts/settings/AccountDataTab.tsx` — Switch "Conta Premium"
- `frontend/components/timeline/PublishDialog.tsx` — receber `isPremium` e ajustar limite de caracteres
- `frontend/components/timeline/SuggestionCard.tsx` — passar `isPremium` para `PublishDialog`
- `frontend/components/dashboard/PendingPostsSection.tsx` — buscar e repassar `isPremium`

**Migration:**

```sql
ALTER TABLE public.x_accounts
  ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false;
```

**Backend — `PublicXAccount` type:**

```typescript
type PublicXAccount = {
  // ...campos existentes
  isPremium: boolean;
};
```

**Backend — PATCH `/api/v1/accounts/:id`:**

```typescript
const updateSchema = z.object({
  is_active: z.boolean().optional(),
  is_premium: z.boolean().optional(),
});
```

**Backend — POST `/api/v1/accounts/:accountId/posts` (validação dinâmica):**

```typescript
// Buscar account → verificar is_premium → ajustar limite
const maxChars = account.is_premium ? 25000 : 280;
const createPostSchema = z.object({
  suggestion_id: z.string().uuid().optional(),
  content: z.string().min(1).max(maxChars),
});
```

**Frontend — AccountDataTab (novo switch):**

```tsx
<div className="flex items-center justify-between rounded-lg border border-white/10 p-4">
  <div className="space-y-0.5">
    <Label htmlFor="premium-switch" className="text-base">
      Conta Premium
    </Label>
    <div className="text-muted-foreground text-sm">
      {isPremium ? 'Posts podem ter até 25.000 caracteres' : 'Limite padrão de 280 caracteres'}
    </div>
  </div>
  <Switch
    id="premium-switch"
    checked={isPremium}
    onCheckedChange={handleTogglePremium}
    disabled={isSaving}
  />
</div>
```

**Frontend — PublishDialog:**

```tsx
type PublishDialogProps = {
  // ...props existentes
  isPremium?: boolean; // ← NOVO
};

const charLimit = isPremium ? 25000 : 280;
const overLimit = characters > charLimit;
// Atualizar display: {characters}/{charLimit}
```

**Acceptance Criteria:**

- [ ] Migration adiciona `is_premium BOOLEAN DEFAULT false` sem erros
- [ ] `GET /api/v1/accounts/:id` retorna `isPremium`
- [ ] `PATCH /api/v1/accounts/:id` aceita `is_premium: boolean`
- [ ] Switch "Conta Premium" visível em Configurações → Dados da Conta
- [ ] Toggle salva via PATCH e atualiza UI imediatamente
- [ ] `PublishDialog` exibe limite correto (280 ou 25.000) baseado em `isPremium`
- [ ] Backend valida `content.length` com limite dinâmico (impede bypass via API direta)
- [ ] Tipos TypeScript regenerados após migration

---

### FEAT-002 — Seletor de Idioma por Conta

| Field        | Value                        |
| ------------ | ---------------------------- |
| Status       | DONE                         |
| Priority     | High                         |
| Dependencies | XACCOUNT-002, UX-004, UX-005 |

**Goal:** Adicionar campo `language` à conta X. Todas as publicações geradas pela IA serão no idioma configurado. O seletor aparece na aba "Dados da Conta" das configurações. A instrução de idioma é injetada no system prompt da IA.

**Arquivos a modificar/criar:**

- `supabase/migrations/017_x_accounts_language.sql` — migration
- `backend/src/routes/accounts.ts` — expor e aceitar `language` via PATCH
- `backend/src/services/ai/prompts.ts` — `buildSystemPrompt(language?)` inclui instrução de idioma
- `backend/src/services/ai/prompt-builder.ts` — passar `language` do account ao construir prompts
- `backend/src/services/ai/suggest.ts` — buscar `language` da conta e repassar ao prompt builder
- `backend/src/routes/ai.ts` — buscar `language` da conta ao gerar tweet na aprovação
- `backend/src/services/ai/auto-flow.ts` — buscar `language` ao rodar auto-flow
- `frontend/components/accounts/settings/AccountDataTab.tsx` — Select de idioma

**Migration:**

```sql
ALTER TABLE public.x_accounts
  ADD COLUMN language TEXT NOT NULL DEFAULT 'pt-BR';
```

**Idiomas suportados (frontend Select):**

```typescript
const LANGUAGES = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'fr-FR', label: 'Français' },
  { value: 'de-DE', label: 'Deutsch' },
];
```

**Backend — `buildSystemPrompt(language)` em `prompts.ts`:**

```typescript
export function buildSystemPrompt(language = 'pt-BR'): string {
  return [
    'You are a social media content editor...',
    // ...regras existentes
    '',
    `IMPORTANT: Generate all content in the following language: ${language}`,
    'Ensure the tone and vocabulary are appropriate for native speakers of that language.',
  ].join('\n');
}
```

**Fluxo de propagação do `language`:**

```
x_accounts.language
  ↓
suggest.ts → buildAnalysisPrompt(xAccountId, buildAnalysisSystemPrompt(language))
  ↓
ai.ts (aprovação) → buildPublicationPrompt(xAccountId, buildSystemPrompt(language))
  ↓
auto-flow.ts → buildPublicationPrompt(xAccountId, buildSystemPrompt(language))
```

**Acceptance Criteria:**

- [ ] Migration adiciona `language TEXT DEFAULT 'pt-BR'` sem erros
- [ ] `GET /api/v1/accounts/:id` retorna `language`
- [ ] `PATCH /api/v1/accounts/:id` aceita `language: string`
- [ ] Select de idioma visível em Configurações → Dados da Conta
- [ ] Seleção salva via PATCH e atualiza UI imediatamente
- [ ] `buildSystemPrompt()` inclui instrução de idioma no prompt enviado à IA
- [ ] Tweets gerados após configurar idioma respeitam o idioma selecionado
- [ ] Tipos TypeScript regenerados após migration

---

### FEAT-003 — TanStack Query — Gerenciamento de Estado

| Field        | Value    |
| ------------ | -------- |
| Status       | DONE     |
| Priority     | Critical |
| Dependencies | AUTH-004 |

**Goal:** Instalar e configurar `@tanstack/react-query` como camada de gerenciamento de estado de servidor em toda a aplicação. Esta task é pré-requisito para FEAT-004, FEAT-005 e FEAT-006. Não migra componentes existentes — apenas scaffolding.

**Pacotes:**

```bash
pnpm add @tanstack/react-query
pnpm add -D @tanstack/react-query-devtools
```

**Arquivos a criar:**

- `frontend/components/providers/QueryProvider.tsx` — wrapper com `QueryClient`

**Arquivo a modificar:**

- `frontend/app/layout.tsx` — envolver com `QueryProvider`

**`QueryProvider.tsx`:**

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Query key factory (criar `frontend/lib/query-keys.ts`):**

```typescript
export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    detail: (id: string) => ['accounts', id] as const,
  },
  timeline: {
    list: (accountId: string, params?: Record<string, unknown>) =>
      ['timeline', accountId, params] as const,
    item: (itemId: string) => ['timeline', 'item', itemId] as const,
  },
  suggestions: {
    detail: (id: string) => ['suggestions', id] as const,
  },
  pendingPosts: {
    list: (accountId: string) => ['pendingPosts', accountId] as const,
  },
};
```

**Acceptance Criteria:**

- [ ] `@tanstack/react-query` instalado em `frontend/package.json`
- [ ] `QueryProvider` criado em `frontend/components/providers/QueryProvider.tsx`
- [ ] Root layout envolto com `QueryProvider`
- [ ] `frontend/lib/query-keys.ts` criado com key factory
- [ ] Devtools visíveis em desenvolvimento (canto inferior direito)
- [ ] Aplicação continua funcionando normalmente (sem regressões)

---

### FEAT-004 — Timeline — Publicação sem Reload

| Field        | Value               |
| ------------ | ------------------- |
| Status       | DONE                |
| Priority     | High                |
| Dependencies | FEAT-003, POSTS-003 |

**Goal:** Substituir `window.location.reload()` por invalidação de query TanStack após publicar ou rejeitar. A timeline deve atualizar suavemente sem piscar ou perder o scroll.

**Problema atual:** `SuggestionCard` chama `window.location.reload()` após aprovação com tweet gerado e após rejeição. A `PendingPostsSection` usa `useEffect + useState` para fetch manual.

**Arquivos a modificar:**

- `frontend/components/dashboard/PendingPostsSection.tsx` — migrar fetch para `useQuery`
- `frontend/components/timeline/SuggestionCard.tsx` — migrar ações para `useMutation` + `queryClient.invalidateQueries`
- `frontend/components/timeline/PublishDialog.tsx` — `onSuccess` invalida query em vez de recarregar

**`PendingPostsSection` com useQuery:**

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

// Substituir useEffect/useState por:
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.pendingPosts.list(accountId),
  queryFn: () =>
    apiClient<PendingPostsResponse>(
      `/api/v1/accounts/${accountId}/timeline?status=pending&limit=10`,
    ),
  enabled: !!accountId,
});
```

**`SuggestionCard` com useMutation:**

```tsx
const queryClient = useQueryClient();

const updateStatusMutation = useMutation({
  mutationFn: (status: 'approved' | 'rejected') =>
    apiClient<{ data: SuggestionResponse }>(`/api/v1/suggestions/${suggestion.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  onSuccess: (response, status) => {
    if (status === 'approved' && response.data.suggestionText) {
      setText(response.data.suggestionText);
      setLocalStatus('approved');
    } else if (status === 'rejected') {
      // Invalida a lista em vez de recarregar
      void queryClient.invalidateQueries({ queryKey: queryKeys.pendingPosts.list(accountId) });
    }
    toast.success(status === 'approved' ? 'Sugestão aprovada' : 'Sugestão rejeitada');
  },
  onError: (err) => {
    const msg = err instanceof ApiError ? err.message : 'Falha ao atualizar status';
    toast.error(msg);
  },
});
```

**`PublishDialog` após publicar:**

```tsx
onSuccess: () => {
  toast.success('Post publicado com sucesso!');
  onOpenChange(false);
  // Invalida lista de pendentes (remove card da lista)
  void queryClient.invalidateQueries({ queryKey: queryKeys.pendingPosts.list(accountId) });
  onSuccess?.();
},
```

**Acceptance Criteria:**

- [ ] `PendingPostsSection` usa `useQuery` do TanStack — sem `useState` + `useEffect` para fetch
- [ ] Rejeição remove o card da lista sem `window.location.reload()`
- [ ] Publicação remove o card da lista sem `window.location.reload()`
- [ ] Aprovação (geração de tweet) atualiza o card inline — mostra textarea com tweet
- [ ] Loading state durante operações usa skeleton/spinner existente
- [ ] Sem regressões na timeline da conta

---

### FEAT-005 — Detail Page — Estado Suave

| Field        | Value            |
| ------------ | ---------------- |
| Status       | DONE             |
| Priority     | High             |
| Dependencies | FEAT-003, UX-006 |

**Goal:** Migrar a página de detalhes de um item da timeline (`/accounts/:accountId/timeline/:itemId`) para usar TanStack Query. As ações de aprovação e rejeição na `SuggestionStep` devem atualizar o estado da página inline, sem reload.

**Problema atual:** `TimelineItemDetailPage` usa `useEffect + useState` para fetch. `SuggestionStep` exibe "Recarregue a página para ver o resultado" após processar artigo.

**Arquivos a modificar:**

- `frontend/app/(app)/accounts/[accountId]/timeline/[itemId]/page.tsx` — migrar fetch para `useQuery`
- `frontend/components/timeline/detail/SuggestionStep.tsx` — usar `useMutation` + `queryClient.invalidateQueries`

**`TimelineItemDetailPage` com useQuery:**

```tsx
// Aguardar params com use() do React ou manter useEffect apenas para params
const {
  data: itemData,
  isLoading,
  error,
} = useQuery({
  queryKey: queryKeys.timeline.item(itemId),
  queryFn: () => apiClient<ItemDetailResponse>(`/api/v1/timeline/items/${itemId}`),
  enabled: !!itemId,
});
```

**`SuggestionStep` — aprovação/rejeição com invalidação:**

```tsx
const queryClient = useQueryClient();

const updateStatusMutation = useMutation({
  mutationFn: (status: 'approved' | 'rejected') =>
    apiClient(`/api/v1/suggestions/${suggestion.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  onSuccess: () => {
    // Invalida a query da detail page → re-fetch automático → estado atualizado
    void queryClient.invalidateQueries({ queryKey: queryKeys.timeline.item(itemId) });
    toast.success('Status atualizado');
  },
});
```

**Acceptance Criteria:**

- [ ] `TimelineItemDetailPage` usa `useQuery` para buscar dados do item
- [ ] Aprovação de sugestão na detail page atualiza stepper sem reload
- [ ] Rejeição atualiza stepper para estado "Rejeitado" sem reload
- [ ] Loading skeleton aparece durante re-fetch após ação
- [ ] Error state tratado corretamente
- [ ] Sem regressões no DetailStepper ou steps existentes

---

### FEAT-006 — Processar Artigo Inline na Detail Page

| Field        | Value            |
| ------------ | ---------------- |
| Status       | DONE             |
| Priority     | High             |
| Dependencies | FEAT-005, AI-004 |

**Goal:** Na página de detalhes de uma notícia sem sugestão, o botão "Processar Artigo" deve: (1) chamar a IA para análise + aprovação automática e geração do tweet, (2) atualizar o stepper inline mostrando a sugestão gerada com um botão "Publicar", sem reload de página.

**Contexto atual:** O botão "Processar Artigo" existe em `SuggestionStep` mas mostra um toast pedindo reload. O botão não existe quando `!hasSuggestion` (Step 1 atual sem sugestão).

**Fluxo desejado:**

```
1. Usuário abre detail page de artigo sem sugestão
2. Step 1 (Artigo Original) mostra botão "Processar Artigo"
3. Clicar → POST /api/v1/ai/suggest/:articleId
   → cria ai_suggestion(status='pending', suggestion_text=NULL)
4. Imediatamente após → PATCH /api/v1/suggestions/:id/status { status: 'approved' }
   → gera tweet com conteúdo completo do artigo
5. Query do item é invalidada → stepper re-fetcha dados atualizados
6. Step 3 agora mostra o tweet gerado + botão "Publicar"
7. Usuário pode publicar diretamente sem sair da página
```

**Arquivos a modificar:**

- `frontend/components/timeline/detail/OriginalArticleStep.tsx` — adicionar botão "Processar Artigo" (apenas quando `!hasSuggestion`)
- `frontend/components/timeline/detail/SuggestionStep.tsx` — remover toast "Recarregue a página", usar invalidação de query
- `frontend/components/timeline/detail/DetailStepper.tsx` — repassar `hasSuggestion` e callbacks para `OriginalArticleStep`

**`OriginalArticleStep` com botão:**

```tsx
type OriginalArticleStepProps = {
  article: Article;
  accountId: string;
  hasSuggestion: boolean; // ← NOVO
  onProcessed?: () => void; // ← NOVO: callback para invalidar query
};

// Renderização condicional do botão:
{
  !hasSuggestion && (
    <Button onClick={handleProcessArticle} disabled={isProcessing} size="sm" className="mt-4 gap-2">
      <Sparkles className="h-4 w-4" />
      {isProcessing ? 'Processando...' : 'Processar Artigo'}
    </Button>
  );
}
```

**`handleProcessArticle` em `OriginalArticleStep`:**

```tsx
const queryClient = useQueryClient();

async function handleProcessArticle() {
  setIsProcessing(true);
  try {
    // Passo 1: criar sugestão (análise)
    const suggestRes = await apiClient<{ data: { id: string } }>(
      `/api/v1/ai/suggest/${article.id}`,
      { method: 'POST' },
    );

    // Passo 2: aprovar imediatamente (gera tweet)
    await apiClient(`/api/v1/suggestions/${suggestRes.data.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    });

    // Passo 3: invalidar query → stepper atualiza com tweet gerado
    void queryClient.invalidateQueries({ queryKey: queryKeys.timeline.item(itemId) });
    toast.success('Artigo processado! Tweet gerado com sucesso.');
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : 'Falha ao processar artigo';
    toast.error(msg);
  } finally {
    setIsProcessing(false);
  }
}
```

**`SuggestionStep` — adicionar botão "Publicar" para sugestões aprovadas:**

```tsx
// Quando suggestion.status === 'approved' && suggestion.suggestionText:
{
  suggestion.status === 'approved' && suggestion.suggestionText && (
    <>
      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        accountId={accountId}
        suggestionId={suggestion.id}
        initialContent={suggestion.suggestionText}
        isPremium={isPremium}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: queryKeys.timeline.item(itemId) })
        }
      />
      <Button onClick={() => setPublishDialogOpen(true)} size="sm" className="gap-2">
        Publicar no X
      </Button>
    </>
  );
}
```

**Acceptance Criteria:**

- [ ] Botão "Processar Artigo" visível em Step 1 quando `!hasSuggestion`
- [ ] Clicar chama POST suggest → PATCH approve em sequência
- [ ] Após processamento, stepper atualiza inline sem reload
- [ ] Step 3 mostra tweet gerado + botão "Publicar no X"
- [ ] Clicar "Publicar no X" abre `PublishDialog` com o tweet pré-preenchido
- [ ] Publicação bem-sucedida atualiza Step 4 inline (mostra PublicationStep)
- [ ] Erros em qualquer etapa são exibidos via toast — sem crash
- [ ] `SuggestionStep` remove referências a `window.location.reload()` e toast de "recarregue"

---

## EPIC SRC — Multi-Source Ingestion (2026-03-03)

> **Objetivo:** Expandir o sistema para ingerir conteúdo de múltiplas fontes além de sites de notícias.
> Todas as fontes alimentam uma tabela unificada `content_items`, preservando o fluxo atual
> de `scraped_articles` como caso particular. O pipeline existente continua funcionando durante
> a migração — nenhuma breaking change até SRC-006.

### Arquitetura Geral

```
                    ┌──────────────┐
                    │  news_sites  │ (RSS/HTML — já existente)
                    └──────┬───────┘
                           │ scrape
                    ┌──────▼───────┐
                    │scraped_articles│ ← bridge trigger/view
                    └──────┬───────┘           │
                           │                   ▼
   ┌──────────────┐  ┌────▼─────┐   ┌────────────────┐
   │youtube_sources│→ │          │   │                │
   └──────────────┘  │ content  │   │  ai_suggestions │
   ┌──────────────┐  │  _items  │──▶│  (referencia    │
   │ x_feed_sources│→│          │   │  content_item_id│
   └──────────────┘  │(unificado│   │  ao invés de    │
   ┌──────────────┐  │)         │   │  article_id)    │
   │newsletter_   │→ │          │   └────────────────┘
   │  sources     │  └──────────┘
   └──────────────┘
```

### Modelo de Dados — Novas Tabelas

```sql
-- Tabela unificada de conteúdo (centro do novo modelo)
content_items (
  id              uuid PK DEFAULT gen_random_uuid(),
  x_account_id    uuid FK → x_accounts(id) ON DELETE CASCADE,
  source_type     text NOT NULL,  -- 'news_article' | 'youtube_video' | 'x_post' | 'newsletter'
  source_table    text NOT NULL,  -- 'scraped_articles' | 'youtube_sources' | 'x_feed_sources' | 'newsletter_sources'
  source_record_id uuid,          -- FK lógico para o registro na tabela de origem
  url             text NOT NULL,
  title           text NOT NULL,
  summary         text,           -- resumo curto (RSS excerpt, video description, tweet text)
  full_content    text,           -- conteúdo completo (article body, transcript, thread text)
  language        text,           -- 'pt-BR', 'en', etc. (detectado ou configurado)
  metadata        jsonb,          -- dados específicos da fonte (duration, views, retweets, etc.)
  is_processed    boolean NOT NULL DEFAULT false,
  published_at    timestamptz,
  ingested_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_type, x_account_id, url)
);

-- Fontes YouTube por conta
youtube_sources (
  id              uuid PK DEFAULT gen_random_uuid(),
  x_account_id    uuid FK → x_accounts(id) ON DELETE CASCADE,
  channel_id      text NOT NULL,       -- YouTube channel ID (UCxxxx)
  channel_name    text NOT NULL,
  channel_url     text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  auto_flow       boolean NOT NULL DEFAULT false,
  check_interval_hours integer NOT NULL DEFAULT 6,
  min_video_duration_sec integer DEFAULT 60,   -- ignorar shorts/teasers
  transcription_method text DEFAULT 'captions', -- 'captions' | 'whisper' | 'summary_only'
  last_checked_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(x_account_id, channel_id)
);

-- Feeds X (contas/listas/buscas) por conta
x_feed_sources (
  id              uuid PK DEFAULT gen_random_uuid(),
  x_account_id    uuid FK → x_accounts(id) ON DELETE CASCADE,
  feed_type       text NOT NULL,     -- 'user_timeline' | 'list' | 'search'
  target_username text,              -- para user_timeline
  list_id         text,              -- para list
  search_query    text,              -- para search
  name            text NOT NULL,     -- label amigável
  is_active       boolean NOT NULL DEFAULT true,
  auto_flow       boolean NOT NULL DEFAULT false,
  check_interval_hours integer NOT NULL DEFAULT 4,
  min_likes       integer DEFAULT 0, -- filtro de engajamento mínimo
  min_retweets    integer DEFAULT 0,
  last_checked_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Fontes de newsletter/blog (RSS dedicado, separado de news_sites)
newsletter_sources (
  id              uuid PK DEFAULT gen_random_uuid(),
  x_account_id    uuid FK → x_accounts(id) ON DELETE CASCADE,
  name            text NOT NULL,
  feed_url        text NOT NULL,
  website_url     text,
  is_active       boolean NOT NULL DEFAULT true,
  auto_flow       boolean NOT NULL DEFAULT false,
  check_interval_hours integer NOT NULL DEFAULT 12,
  last_checked_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(x_account_id, feed_url)
);
```

### Pipeline de Ingestão por Tipo de Fonte

**News Articles (existente):**

```
RSS/HTML scrape → scraped_articles → bridge trigger → content_items(source_type='news_article')
```

**YouTube:**

```
YouTube Data API v3 (list videos) → filtrar por duração/data
  → Para cada vídeo novo:
    1. Tentar YouTube captions API (legendas automáticas)
    2. Se não disponível e transcription_method='whisper': Whisper API
    3. Se 'summary_only': usar título + descrição como summary
    → INSERT content_items(source_type='youtube_video', summary=description, full_content=transcript)
```

**X Feed:**

```
X API v2 (user timeline / list / search) → filtrar por engajamento
  → Para cada tweet/thread novo:
    1. Se thread: concatenar todos os tweets
    2. Se quote tweet: incluir tweet original
    3. Extrair mídia, links citados
    → INSERT content_items(source_type='x_post', summary=tweet_text, full_content=thread_or_tweet)
```

**Newsletter/Blog:**

```
RSS parser (reutiliza rss.ts existente) → para cada item:
    → INSERT content_items(source_type='newsletter', summary=rss_excerpt)
    → full_content fetched on approval (mesmo padrão de news_article)
```

---

### SRC-001 — Tabela `content_items` + Camada Unificada

| Field        | Value    |
| ------------ | -------- |
| Status       | TODO     |
| Priority     | Critical |
| Dependencies | DB-004   |

**Goal:** Criar a tabela `content_items` como repositório central de conteúdo de todas as fontes. Criar também as tabelas de configuração das novas fontes (`youtube_sources`, `x_feed_sources`, `newsletter_sources`).

**Arquivos a criar:**

- `supabase/migrations/018_content_items.sql` — tabela content_items + índices
- `supabase/migrations/019_youtube_sources.sql` — tabela youtube_sources
- `supabase/migrations/020_x_feed_sources.sql` — tabela x_feed_sources
- `supabase/migrations/021_newsletter_sources.sql` — tabela newsletter_sources
- `supabase/migrations/022_content_items_rls.sql` — RLS policies para todas as novas tabelas

**Migration 018 — content_items:**

```sql
CREATE TABLE public.content_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id    uuid NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  source_type     text NOT NULL CHECK (source_type IN ('news_article','youtube_video','x_post','newsletter')),
  source_table    text NOT NULL,
  source_record_id uuid,
  url             text NOT NULL,
  title           text NOT NULL,
  summary         text,
  full_content    text,
  language        text,
  metadata        jsonb DEFAULT '{}',
  is_processed    boolean NOT NULL DEFAULT false,
  published_at    timestamptz,
  ingested_at     timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_type, x_account_id, url)
);

CREATE INDEX idx_content_items_account ON public.content_items(x_account_id);
CREATE INDEX idx_content_items_unprocessed ON public.content_items(x_account_id, is_processed) WHERE NOT is_processed;
CREATE INDEX idx_content_items_source ON public.content_items(source_type, source_table);
```

**Migration 022 — RLS:**

```sql
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own content_items"
  ON public.content_items FOR SELECT
  USING (x_account_id IN (SELECT id FROM public.x_accounts WHERE user_id = auth.uid()));

-- Repetir padrão para youtube_sources, x_feed_sources, newsletter_sources
```

**Acceptance Criteria:**

- [ ] Tabela `content_items` criada com todos os campos e constraints
- [ ] Tabelas `youtube_sources`, `x_feed_sources`, `newsletter_sources` criadas
- [ ] UNIQUE constraint impede duplicatas por `(source_type, x_account_id, url)`
- [ ] Índices otimizam queries de conteúdo não processado
- [ ] RLS policies isolam dados por usuário via chain `x_accounts.user_id`
- [ ] `database.ts` regenerado com novos tipos

---

### SRC-002 — Bridge `scraped_articles` → `content_items`

| Field        | Value    |
| ------------ | -------- |
| Status       | TODO     |
| Priority     | Critical |
| Dependencies | SRC-001  |

**Goal:** Criar a ponte entre o sistema legado (`scraped_articles`) e o novo (`content_items`). Cada artigo raspado gera automaticamente um `content_item`. O pipeline AI antigo continua funcionando normalmente durante a transição.

**Estratégia:** Adicionar coluna `content_item_id` em `scraped_articles` e popular via trigger SQL. O trigger roda no INSERT de `scraped_articles` e cria o `content_item` correspondente.

**Arquivos a criar/modificar:**

- `supabase/migrations/023_bridge_articles_to_content_items.sql` — trigger + backfill
- `backend/src/services/scraper/runner.ts` — (sem mudanças necessárias se trigger funcionar)

**Migration 023:**

```sql
-- Coluna de referência na tabela legada
ALTER TABLE public.scraped_articles
  ADD COLUMN content_item_id uuid REFERENCES public.content_items(id);

-- Função trigger: cada artigo novo gera um content_item
CREATE OR REPLACE FUNCTION bridge_article_to_content_item()
RETURNS TRIGGER AS $$
DECLARE
  ci_id uuid;
  account_id uuid;
BEGIN
  -- Buscar x_account_id via news_site
  SELECT ns.x_account_id INTO account_id
  FROM public.news_sites ns WHERE ns.id = NEW.news_site_id;

  -- Inserir content_item (ON CONFLICT para idempotência)
  INSERT INTO public.content_items (
    x_account_id, source_type, source_table, source_record_id,
    url, title, summary, full_content,
    is_processed, published_at, ingested_at
  ) VALUES (
    account_id, 'news_article', 'scraped_articles', NEW.id,
    NEW.url, NEW.title, NEW.summary, NEW.full_article_content,
    NEW.is_processed, NEW.published_at, COALESCE(NEW.scraped_at, now())
  )
  ON CONFLICT (source_type, x_account_id, url) DO UPDATE
    SET full_content = EXCLUDED.full_content,
        is_processed = EXCLUDED.is_processed,
        updated_at = now()
  RETURNING id INTO ci_id;

  -- Atualizar referência no scraped_article
  NEW.content_item_id := ci_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bridge_article
  BEFORE INSERT OR UPDATE ON public.scraped_articles
  FOR EACH ROW EXECUTE FUNCTION bridge_article_to_content_item();

-- Backfill: popular content_items para artigos existentes
INSERT INTO public.content_items (
  x_account_id, source_type, source_table, source_record_id,
  url, title, summary, full_content, is_processed, published_at, ingested_at
)
SELECT
  ns.x_account_id, 'news_article', 'scraped_articles', sa.id,
  sa.url, sa.title, sa.summary, sa.full_article_content,
  sa.is_processed, sa.published_at, COALESCE(sa.scraped_at, sa.created_at)
FROM public.scraped_articles sa
JOIN public.news_sites ns ON ns.id = sa.news_site_id
ON CONFLICT (source_type, x_account_id, url) DO NOTHING;

-- Backfill: atualizar referências nos scraped_articles existentes
UPDATE public.scraped_articles sa
SET content_item_id = ci.id
FROM public.content_items ci
WHERE ci.source_type = 'news_article'
  AND ci.source_record_id = sa.id
  AND sa.content_item_id IS NULL;
```

**Acceptance Criteria:**

- [ ] Todo INSERT em `scraped_articles` gera automaticamente um `content_item` via trigger
- [ ] UPDATE em `scraped_articles` (ex: `full_article_content`, `is_processed`) sincroniza com `content_item`
- [ ] Backfill popula `content_items` para todos os artigos já existentes
- [ ] `scraped_articles.content_item_id` aponta para o `content_item` correspondente
- [ ] Pipeline de scraping existente funciona sem modificações (trigger é transparente)
- [ ] Nenhuma breaking change no fluxo AI atual (`ai_suggestions.article_id` continua válido)

---

### SRC-003 — YouTube Channel Ingestion

| Field        | Value   |
| ------------ | ------- |
| Status       | TODO    |
| Priority     | High    |
| Dependencies | SRC-001 |

**Goal:** Permitir que usuários adicionem canais do YouTube como fontes de conteúdo. O sistema verifica periodicamente novos vídeos, obtém transcrições/legendas, e insere como `content_items`.

**Arquivos a criar/modificar:**

- `backend/src/services/ingest/youtube-ingester.ts` — serviço de ingestão YouTube
- `backend/src/services/ingest/transcript.ts` — obtenção de transcrições (YouTube captions API)
- `backend/src/routes/sources.ts` — CRUD para todas as fontes (YouTube, X, Newsletter)
- `backend/src/schemas/sources.schema.ts` — validação Zod para fontes
- `backend/src/jobs/index.ts` — registrar cron job de ingestão

**Pipeline:**

```
1. Cron job (a cada N horas por source)
2. YouTube Data API v3: GET /search?channelId=X&order=date&publishedAfter=lastChecked
3. Para cada vídeo novo:
   a. Verificar duração ≥ min_video_duration_sec (ignorar Shorts se configurado)
   b. Tentar obter legendas via YouTube captions (innertube ou timedtext API)
   c. Se legendas indisponíveis + method='whisper': usar Whisper API (OpenAI)
   d. Se method='summary_only': usar title + description como summary, sem full_content
   e. INSERT content_items(
        source_type='youtube_video',
        summary=video.description (truncado 500 chars),
        full_content=transcript_text,
        metadata={videoId, duration, viewCount, channelTitle, thumbnailUrl}
      )
4. Atualizar youtube_sources.last_checked_at
```

**Considerações de custo:**

- YouTube Data API v3: quota de 10.000 unidades/dia (search = 100 unidades, logo ~100 buscas/dia)
- Captions: gratuito se auto-geradas estiverem disponíveis
- Whisper API (opcional): $0.006/min de áudio — usar apenas quando necessário
- Recomendação: começar com `captions` como padrão, `whisper` como opt-in

**Env vars necessárias:**

```bash
YOUTUBE_API_KEY=AIza...          # YouTube Data API v3 key
OPENAI_API_KEY=sk-...            # Já existente (usado para Whisper se habilitado)
```

**Acceptance Criteria:**

- [ ] Usuário pode adicionar canal YouTube via URL ou channel ID
- [ ] Sistema valida que o canal existe via YouTube Data API
- [ ] Cron job verifica novos vídeos respeitando `check_interval_hours`
- [ ] Vídeos curtos são filtrados por `min_video_duration_sec`
- [ ] Transcrições são obtidas via YouTube captions (método padrão)
- [ ] Fallback para Whisper API funciona quando configurado
- [ ] `content_items` criados com `source_type='youtube_video'` e metadata rica
- [ ] Deduplicação por URL do vídeo (UNIQUE constraint)
- [ ] Erros de API não interrompem o processamento de outros vídeos
- [ ] `last_checked_at` atualizado após cada execução

---

### SRC-004 — X Feed Ingestion

| Field        | Value                 |
| ------------ | --------------------- |
| Status       | TODO                  |
| Priority     | High                  |
| Dependencies | SRC-001, XACCOUNT-001 |

**Goal:** Permitir monitoramento de contas, listas e buscas no X como fontes de conteúdo. Tweets relevantes são ingeridos como `content_items` para alimentar o pipeline editorial.

**Arquivos a criar/modificar:**

- `backend/src/services/ingest/x-feed-ingester.ts` — serviço de ingestão X
- `backend/src/routes/sources.ts` — (mesmo arquivo de SRC-003, adicionar rotas X feed)
- `backend/src/schemas/sources.schema.ts` — (adicionar schemas X feed)

**Pipeline:**

```
1. Cron job (a cada N horas por source)
2. Baseado em feed_type:
   a. 'user_timeline': GET /2/users/:id/tweets (últimos tweets do user)
   b. 'list':          GET /2/lists/:id/tweets (tweets de uma lista)
   c. 'search':        GET /2/tweets/search/recent?query=X
3. Para cada tweet novo:
   a. Filtrar por min_likes e min_retweets (engajamento mínimo)
   b. Se é thread (conversation_id): buscar thread completa
   c. Se é quote tweet: incluir contexto do tweet original
   d. INSERT content_items(
        source_type='x_post',
        title=tweet_text (truncado 100 chars),
        summary=tweet_text,
        full_content=thread_text_completo (se thread) ou tweet_text,
        metadata={tweetId, authorUsername, likes, retweets, isThread, quotedTweetId, mediaUrls}
      )
4. Atualizar x_feed_sources.last_checked_at
```

**Considerações:**

- X API v2 Basic: 10.000 tweets leitura/mês — monitorar uso
- X API v2 Pro: 1M tweets leitura/mês — necessário para uso intenso
- Rate limits: usar exponential backoff
- Tokens: reutilizar `oauth_access_token_enc` do `x_accounts` (já tem read scope)

**Acceptance Criteria:**

- [ ] Usuário pode criar feed do tipo `user_timeline`, `list` ou `search`
- [ ] Validação: username existe, lista existe, query não está vazia
- [ ] Cron job respeita `check_interval_hours` por feed
- [ ] Filtro de engajamento mínimo (likes, retweets) funciona
- [ ] Threads são capturadas completas (não apenas o primeiro tweet)
- [ ] Quote tweets incluem contexto do tweet original
- [ ] `content_items` criados com metadata de engajamento
- [ ] Rate limits do X API respeitados com backoff exponencial
- [ ] Contagem de uso da API rastreada para evitar exceder quota

---

### SRC-005 — Newsletter / Blog RSS Ingestion

| Field        | Value                |
| ------------ | -------------------- |
| Status       | TODO                 |
| Priority     | Medium               |
| Dependencies | SRC-001, SCRAPER-001 |

**Goal:** Fonte dedicada para newsletters e blogs via RSS, separada de `news_sites`. Reutiliza o parser RSS existente (`rss.ts`) mas insere diretamente em `content_items` sem passar por `scraped_articles`.

**Diferença de `news_sites`:** `newsletter_sources` são tipicamente conteúdo opinativo, curado, de autor único — o tratamento editorial é diferente (menos factual, mais análise/perspectiva). A separação permite que o pipeline editorial (EDT) dê pesos diferentes a cada tipo de fonte.

**Arquivos a criar/modificar:**

- `backend/src/services/ingest/newsletter-ingester.ts` — serviço de ingestão
- `backend/src/routes/sources.ts` — (adicionar rotas newsletter)
- `backend/src/schemas/sources.schema.ts` — (adicionar schemas newsletter)

**Pipeline:**

```
1. Cron job (a cada N horas por source)
2. Reutilizar scrapeRss(feed_url) de services/scraper/rss.ts
3. Para cada item RSS novo:
   a. INSERT content_items(
        source_type='newsletter',
        summary=rss_description (truncado 500 chars),
        full_content=NULL (fetched on demand, mesmo padrão de news_article),
        metadata={authorName, feedTitle, categories}
      )
4. Atualizar newsletter_sources.last_checked_at
```

**Acceptance Criteria:**

- [ ] Usuário pode adicionar newsletter/blog via URL (auto-detecção RSS reutilizada)
- [ ] Parser RSS existente (`rss.ts`) é reutilizado sem modificações
- [ ] `content_items` criados com `source_type='newsletter'`
- [ ] `full_content` obtido sob demanda na aprovação (mesmo padrão de artigos)
- [ ] Deduplicação por URL funciona corretamente
- [ ] Metadata inclui autor e categorias do feed

---

### SRC-006 — AI Pipeline — Migração para `content_items`

| Field        | Value            |
| ------------ | ---------------- |
| Status       | TODO             |
| Priority     | Critical         |
| Dependencies | SRC-001, SRC-002 |

**Goal:** Migrar o pipeline de AI (`suggest.ts`, `auto-flow.ts`, `ai.ts`) para ler de `content_items` ao invés de `scraped_articles`. Adicionar `content_item_id` em `ai_suggestions` (nullable durante transição). Manter backward compatibility com `article_id`.

**Arquivos a modificar:**

- `supabase/migrations/024_ai_suggestions_content_item.sql` — nova coluna
- `backend/src/services/ai/suggest.ts` — ler de `content_items` + fallback `scraped_articles`
- `backend/src/services/ai/auto-flow.ts` — usar `content_items` como fonte
- `backend/src/routes/ai.ts` — aceitar `content_item_id` na aprovação
- `backend/src/routes/timeline.ts` — incluir `content_item` nos detalhes

**Migration 024:**

```sql
ALTER TABLE public.ai_suggestions
  ADD COLUMN content_item_id uuid REFERENCES public.content_items(id);

CREATE INDEX idx_ai_suggestions_content_item ON public.ai_suggestions(content_item_id);

-- Backfill: popular content_item_id para sugestões existentes
UPDATE public.ai_suggestions s
SET content_item_id = sa.content_item_id
FROM public.scraped_articles sa
WHERE sa.id = s.article_id
  AND sa.content_item_id IS NOT NULL;
```

**Mudança no `suggest.ts` — `processNewArticles()`:**

```typescript
// ANTES: query scraped_articles WHERE is_processed = false
// DEPOIS: query content_items WHERE is_processed = false

// Fase 1 (transição): query ambos, priorizar content_items
// Fase 2 (final): query apenas content_items

async function processNewContentItems(xAccountId: string): Promise<void> {
  const { data: items } = await supabase
    .from('content_items')
    .select('*')
    .eq('x_account_id', xAccountId)
    .eq('is_processed', false);

  for (const item of items) {
    // Análise usa title + summary (barato, igual ao fluxo atual)
    const analysis = await analyzeContent(item.title, item.summary);

    if (analysis.eligible) {
      await supabase.from('ai_suggestions').insert({
        content_item_id: item.id,
        article_id: item.source_record_id, // backward compat (null para fontes não-article)
        x_account_id: xAccountId,
        status: 'pending',
        suggestion_text: null,
      });
    } else {
      await supabase.from('content_items').update({ is_processed: true }).eq('id', item.id);
    }
  }
}
```

**Acceptance Criteria:**

- [ ] `ai_suggestions.content_item_id` adicionado (nullable para backward compat)
- [ ] Backfill popula `content_item_id` para sugestões existentes via `scraped_articles.content_item_id`
- [ ] `processNewArticles()` renomeado para `processNewContentItems()` (ou wrapper compatível)
- [ ] Análise funciona com conteúdo de qualquer `source_type`
- [ ] Aprovação busca `full_content` de `content_items` (não mais de `scraped_articles` diretamente)
- [ ] Auto-flow funciona com `content_items` de qualquer fonte
- [ ] Timeline API retorna `source_type` e metadata da fonte no detalhe
- [ ] Fluxo legado (`article_id`) continua funcionando durante transição

---

### SRC-007 — Frontend — Gerenciamento de Fontes

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Status       | TODO                               |
| Priority     | High                               |
| Dependencies | SRC-001, SRC-003, SRC-004, SRC-005 |

**Goal:** Interface para gerenciar todas as fontes de conteúdo: YouTube channels, X feeds, newsletters. Segue o padrão visual de `SiteForm.tsx` / `SiteTable.tsx` mas com formulários específicos por tipo de fonte.

**Arquivos a criar:**

- `frontend/app/(app)/accounts/[accountId]/sources/page.tsx` — página de fontes
- `frontend/components/sources/SourceTabs.tsx` — tabs por tipo de fonte
- `frontend/components/sources/YouTubeSourceForm.tsx` — form YouTube
- `frontend/components/sources/XFeedSourceForm.tsx` — form X feed
- `frontend/components/sources/NewsletterSourceForm.tsx` — form newsletter
- `frontend/components/sources/SourceTable.tsx` — tabela genérica com ícones por tipo

**Layout da página:**

```
Fontes de Conteúdo
├── Tab: YouTube Channels
│   ├── [Tabela com canais cadastrados]
│   └── [Botão "Adicionar Canal"]
├── Tab: Feeds do X
│   ├── [Tabela com feeds cadastrados]
│   └── [Botão "Adicionar Feed"]
└── Tab: Newsletters
    ├── [Tabela com newsletters cadastradas]
    └── [Botão "Adicionar Newsletter"]
```

**YouTubeSourceForm campos:**

- URL do canal (auto-resolve channel ID)
- Nome (auto-preenchido via API)
- Intervalo de verificação (horas)
- Duração mínima do vídeo (segundos)
- Método de transcrição: Legendas automáticas | Whisper (se disponível) | Apenas resumo
- Auto-flow toggle
- Ativo toggle

**XFeedSourceForm campos:**

- Tipo: Timeline de Usuário | Lista | Busca
- Username / List ID / Query (condicional ao tipo)
- Nome do feed
- Intervalo de verificação
- Engajamento mínimo (likes, retweets)
- Auto-flow toggle
- Ativo toggle

**NewsletterSourceForm campos:**

- URL do blog/newsletter (auto-detecção RSS)
- Nome
- Intervalo de verificação
- Auto-flow toggle
- Ativo toggle

**Acceptance Criteria:**

- [ ] Página `/accounts/:id/sources` acessível via sidebar
- [ ] Tabs para YouTube, X Feed, Newsletter
- [ ] CRUD completo para cada tipo de fonte
- [ ] Formulários validados com Zod + react-hook-form
- [ ] Auto-detecção de RSS para newsletters (reutiliza lógica existente)
- [ ] Auto-resolução de channel ID para YouTube URLs
- [ ] Tabela com ícones distintos por tipo e status de última verificação
- [ ] Toggle auto_flow e is_active funcional para todas as fontes

---

### SRC-008 — Frontend — Timeline Multi-Source

| Field        | Value            |
| ------------ | ---------------- |
| Status       | TODO             |
| Priority     | High             |
| Dependencies | SRC-006, SRC-007 |

**Goal:** Adaptar a Timeline e o Dashboard para exibir conteúdo de todas as fontes, com ícones e labels indicando a origem (site, YouTube, X, newsletter).

**Arquivos a modificar:**

- `frontend/components/timeline/TimelineItem.tsx` — ícone de fonte + label
- `frontend/components/timeline/SuggestionCard.tsx` — exibir tipo de fonte
- `frontend/components/timeline/detail/OriginalArticleStep.tsx` — adaptar para vídeos/tweets/newsletters
- `frontend/components/timeline/detail/DetailStepper.tsx` — Step 1 nome dinâmico ("Artigo Original" | "Vídeo YouTube" | "Tweet" | "Newsletter")
- `frontend/components/dashboard/PendingPostsSection.tsx` — ícone de fonte

**Ícones por tipo:**

```tsx
const sourceIcons: Record<string, LucideIcon> = {
  news_article: Newspaper,
  youtube_video: Youtube,
  x_post: Twitter,
  newsletter: Mail,
};
```

**Acceptance Criteria:**

- [ ] Timeline mostra ícone + label da fonte para cada item
- [ ] Dashboard mostra tipo de fonte nos cards pending/published/rejected
- [ ] Detail page Step 1 adapta título e conteúdo ao tipo de fonte
- [ ] Para vídeos: mostra thumbnail, duração, link para YouTube
- [ ] Para tweets: mostra texto original, autor, métricas de engajamento
- [ ] Para newsletters: mostra autor, nome do feed
- [ ] Filtro de fonte na timeline (dropdown ou tabs)
- [ ] Busca funciona across all source types

---

## EPIC EDT — Editorial Intelligence (2026-03-03)

> **Objetivo:** Substituir o modelo "1 artigo → 1 sugestão" por uma camada editorial inteligente
> que detecta temas, agrupa conteúdos, e gera sugestões contextuais baseadas em múltiplas fontes.
> O fluxo 1:1 continua existindo como fallback, mas o novo modelo editorial é preferido.

### Arquitetura Geral

```
┌─────────────────────────────────────────────────────────┐
│                    content_items                         │
│  (news_article, youtube_video, x_post, newsletter)      │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌──────────────────────┐     ┌────────────────────┐
│   content_tags       │     │  Embedding vetorial │
│   (AI: 3-5 tags/item)│     │  (futuro - pgvector)│
└──────────┬───────────┘     └────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│      editorial_clusters              │
│  (agrupamento por tag + janela tempo)│
│  status: detected → ready → used     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│      editorial_briefs                │
│  (síntese AI do cluster:            │
│   contexto + ângulos sugeridos)     │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│      ai_suggestions                  │
│  (gerada com base no brief +        │
│   múltiplas fontes + ângulo)        │
│  editorial_brief_id (nullable FK)   │
└──────────────────────────────────────┘
```

### Pipeline Editorial

```
Fase 1 — Tagging (em cada content_item novo)
  → AI extrai 3–5 tags temáticas normalizadas
  → Tags armazenadas em content_tags

Fase 2 — Clustering (cron job periódico, ex: a cada 2h)
  → Agrupa content_items por sobreposição de tags + janela temporal
  → Mínimo 2 itens para formar cluster (evitar clusters de 1 item)
  → Calcula "trend_score" baseado em: quantidade de fontes, recência, diversidade de tipos

Fase 3 — Brief Generation (para clusters com score acima de threshold)
  → AI recebe resumos de todos os itens do cluster
  → Gera: contexto editorial (o que está acontecendo), 2-4 ângulos de post sugeridos
  → Status: 'draft' → 'approved' (manual ou auto) → 'used'

Fase 4 — Suggestion Generation (contextual)
  → Usuário seleciona um brief + ângulo (ou auto-flow seleciona automaticamente)
  → AI gera tweet usando: full_content das fontes mais relevantes do cluster
  → Sugestão referencia editorial_brief_id + source_content_ids[]
```

### Coexistência com Fluxo Atual

O fluxo 1:1 (`content_item → ai_suggestion`) continua existindo:

- Para `auto_flow=true` em fontes individuais
- Para itens que não formam clusters (conteúdo isolado)
- Como fallback quando o pipeline editorial está desabilitado

O novo fluxo editorial é **additive**: não substitui, mas complementa e é preferido quando há clusters disponíveis.

---

### EDT-001 — Tabelas de Tags e Embeddings

| Field        | Value    |
| ------------ | -------- |
| Status       | TODO     |
| Priority     | Critical |
| Dependencies | SRC-001  |

**Goal:** Criar a tabela `content_tags` para armazenar tags temáticas extraídas por AI de cada `content_item`. Preparar estrutura para embeddings vetoriais futuros (pgvector).

**Arquivos a criar:**

- `supabase/migrations/025_content_tags.sql`

**Migration 025:**

```sql
CREATE TABLE public.content_tags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  tag             text NOT NULL,          -- tag normalizada em lowercase (ex: 'inteligência artificial')
  confidence      real NOT NULL DEFAULT 1.0,  -- 0.0–1.0, confiança da AI na relevância
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_item_id, tag)
);

CREATE INDEX idx_content_tags_tag ON public.content_tags(tag);
CREATE INDEX idx_content_tags_item ON public.content_tags(content_item_id);

-- RLS
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own content_tags"
  ON public.content_tags FOR SELECT
  USING (content_item_id IN (
    SELECT id FROM public.content_items
    WHERE x_account_id IN (SELECT id FROM public.x_accounts WHERE user_id = auth.uid())
  ));

-- Futuro: quando pgvector estiver disponível
-- ALTER TABLE public.content_items ADD COLUMN embedding vector(1536);
-- CREATE INDEX idx_content_items_embedding ON content_items USING ivfflat (embedding vector_cosine_ops);
COMMENT ON TABLE public.content_tags IS
  'Tags temáticas extraídas por AI. Futuro: complementar com embeddings vetoriais (pgvector) para similaridade semântica.';
```

**Acceptance Criteria:**

- [ ] Tabela `content_tags` criada com constraint UNIQUE(content_item_id, tag)
- [ ] Índice em `tag` para queries de clustering
- [ ] RLS policy isola tags por chain de ownership
- [ ] Comentário documenta plano futuro de embeddings
- [ ] `database.ts` regenerado

---

### EDT-002 — Serviço de Tagging Automático

| Field        | Value            |
| ------------ | ---------------- |
| Status       | TODO             |
| Priority     | Critical         |
| Dependencies | EDT-001, SRC-001 |

**Goal:** Serviço que extrai 3–5 tags temáticas de cada `content_item` novo usando AI. Roda automaticamente após a ingestão (trigger no pipeline) ou via cron job para itens não taggeados.

**Arquivos a criar:**

- `backend/src/services/editorial/tagger.ts` — serviço de tagging
- `backend/src/services/editorial/prompts.ts` — prompts do pipeline editorial

**Prompt de tagging:**

```typescript
export function buildTaggingPrompt(): string {
  return [
    'Extract 3-5 thematic tags from the following content.',
    'Tags must be:',
    '- Lowercase, in the same language as the content',
    '- Broad enough to cluster with related content (e.g., "inteligência artificial" not "modelo gpt-4")',
    '- Specific enough to be meaningful (e.g., "regulação de criptomoedas" not "tecnologia")',
    '',
    'Respond ONLY with valid JSON: { "tags": [{ "tag": "nome da tag", "confidence": 0.0-1.0 }] }',
  ].join('\n');
}
```

**Serviço:**

```typescript
export class ContentTagger {
  static async tagContentItem(itemId: string): Promise<void> {
    // 1. Fetch content_item (title + summary)
    // 2. Call AI: generateRaw(taggingPrompt, title + summary)
    // 3. Parse response: { tags: [{ tag, confidence }] }
    // 4. Normalize tags: lowercase, trim, dedup
    // 5. Upsert into content_tags (ON CONFLICT DO NOTHING)
  }

  static async tagUntaggedItems(xAccountId: string): Promise<number> {
    // Query content_items sem tags (LEFT JOIN content_tags WHERE tag IS NULL)
    // Para cada item: tagContentItem(item.id)
    // Retorna quantidade processada
  }
}
```

**Integração no pipeline:**

- Após inserção em `content_items` (nos ingesters de SRC-003/004/005)
- Após bridge trigger (SRC-002) para news articles
- Cron job de fallback: a cada 1h, tag itens órfãos

**Acceptance Criteria:**

- [ ] AI extrai 3–5 tags por content_item
- [ ] Tags são normalizadas (lowercase, trim)
- [ ] Confiança (0.0–1.0) é armazenada por tag
- [ ] Tagging é idempotente (UNIQUE constraint previne duplicatas)
- [ ] Funciona com todos os source_types (article, video, tweet, newsletter)
- [ ] Usa `title + summary` (barato) — não full_content
- [ ] Circuit breaker: falha de AI não impede processamento de outros itens
- [ ] Cron job de fallback garante que nenhum item fica sem tags

---

### EDT-003 — Tabelas de Clusters e Briefs

| Field        | Value    |
| ------------ | -------- |
| Status       | TODO     |
| Priority     | Critical |
| Dependencies | EDT-001  |

**Goal:** Criar as tabelas `editorial_clusters`, `cluster_items` e `editorial_briefs` que formam o coração da camada editorial.

**Arquivos a criar:**

- `supabase/migrations/026_editorial_clusters.sql`

**Migration 026:**

```sql
-- Clusters editoriais (agrupamentos temáticos)
CREATE TABLE public.editorial_clusters (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  x_account_id        uuid NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  topic               text NOT NULL,         -- tema principal do cluster (gerado por AI)
  summary             text,                  -- resumo de 1-2 frases do cluster
  tags                text[] NOT NULL,       -- tags compartilhadas que formaram o cluster
  trend_score         real NOT NULL DEFAULT 0, -- 0.0–10.0, score de relevância
  item_count          integer NOT NULL DEFAULT 0,
  source_type_count   integer NOT NULL DEFAULT 0, -- quantos tipos de fonte diferentes
  time_window_start   timestamptz NOT NULL,
  time_window_end     timestamptz NOT NULL,
  status              text NOT NULL DEFAULT 'detected'
                      CHECK (status IN ('detected','ready','used','expired','dismissed')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_clusters_account_status ON public.editorial_clusters(x_account_id, status);
CREATE INDEX idx_clusters_score ON public.editorial_clusters(trend_score DESC);

-- Relação M:N entre clusters e content_items
CREATE TABLE public.cluster_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id      uuid NOT NULL REFERENCES public.editorial_clusters(id) ON DELETE CASCADE,
  content_item_id uuid NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  relevance_score real NOT NULL DEFAULT 1.0,  -- quão relevante este item é para o cluster
  UNIQUE(cluster_id, content_item_id)
);

CREATE INDEX idx_cluster_items_cluster ON public.cluster_items(cluster_id);
CREATE INDEX idx_cluster_items_content ON public.cluster_items(content_item_id);

-- Briefs editoriais (sínteses de clusters)
CREATE TABLE public.editorial_briefs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id      uuid NOT NULL REFERENCES public.editorial_clusters(id) ON DELETE CASCADE,
  x_account_id    uuid NOT NULL REFERENCES public.x_accounts(id) ON DELETE CASCADE,
  brief_text      text NOT NULL,             -- síntese editorial do cluster
  suggested_angles jsonb NOT NULL DEFAULT '[]', -- [{ angle: string, rationale: string }]
  selected_angle  text,                      -- ângulo escolhido pelo usuário (ou auto)
  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','approved','used','dismissed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_briefs_account_status ON public.editorial_briefs(x_account_id, status);
CREATE INDEX idx_briefs_cluster ON public.editorial_briefs(cluster_id);

-- Coluna adicional em ai_suggestions para rastreabilidade editorial
ALTER TABLE public.ai_suggestions
  ADD COLUMN editorial_brief_id uuid REFERENCES public.editorial_briefs(id),
  ADD COLUMN source_content_ids uuid[] DEFAULT '{}';

-- RLS
ALTER TABLE public.editorial_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cluster_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editorial_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clusters"
  ON public.editorial_clusters FOR SELECT
  USING (x_account_id IN (SELECT id FROM public.x_accounts WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own cluster_items"
  ON public.cluster_items FOR SELECT
  USING (cluster_id IN (
    SELECT id FROM public.editorial_clusters
    WHERE x_account_id IN (SELECT id FROM public.x_accounts WHERE user_id = auth.uid())
  ));

CREATE POLICY "Users can view own briefs"
  ON public.editorial_briefs FOR SELECT
  USING (x_account_id IN (SELECT id FROM public.x_accounts WHERE user_id = auth.uid()));
```

**Acceptance Criteria:**

- [ ] Tabela `editorial_clusters` com lifecycle de status (detected → ready → used → expired)
- [ ] Tabela `cluster_items` M:N com relevance_score
- [ ] Tabela `editorial_briefs` com ângulos sugeridos (JSONB)
- [ ] `ai_suggestions` estendido com `editorial_brief_id` e `source_content_ids[]`
- [ ] Índices otimizam queries por account + status + score
- [ ] RLS policies para todas as tabelas
- [ ] `database.ts` regenerado

---

### EDT-004 — Serviço de Clustering Temporal

| Field        | Value                     |
| ------------ | ------------------------- |
| Status       | TODO                      |
| Priority     | Critical                  |
| Dependencies | EDT-001, EDT-002, EDT-003 |

**Goal:** Serviço que agrupa `content_items` em clusters editoriais baseado em sobreposição de tags e proximidade temporal. Roda periodicamente via cron job.

**Arquivos a criar:**

- `backend/src/services/editorial/clusterer.ts`
- `backend/src/jobs/editorial.ts` — cron job editorial

**Algoritmo de clustering:**

```typescript
export class EditorialClusterer {
  /**
   * Janela temporal: últimas 48h (configurável)
   * Mínimo 2 itens com ≥2 tags em comum para formar cluster
   * Não re-clusterizar itens já em clusters 'ready' ou 'used'
   */
  static async detectClusters(xAccountId: string): Promise<void> {
    // 1. Buscar content_items recentes (48h) com tags
    // 2. Construir grafo de adjacência: item↔item com peso = nº tags em comum
    // 3. Agrupar: connected components com peso ≥ 2
    // 4. Para cada grupo:
    //    a. Calcular trend_score:
    //       - base = item_count * 1.0
    //       - bonus_diversity = source_type_count * 1.5
    //       - bonus_recency = itens das últimas 6h * 0.5
    //       - score = base + bonus_diversity + bonus_recency
    //    b. Determinar tags compartilhadas (interseção)
    //    c. Gerar topic label (tag mais frequente ou AI-generated)
    //    d. INSERT editorial_clusters + cluster_items
    // 5. Expirar clusters antigos (>72h sem uso) → status='expired'
  }

  /**
   * Cálculo de trend_score
   * Fatores: quantidade, diversidade de fontes, recência
   */
  static calculateTrendScore(items: ContentItem[]): number {
    const count = items.length;
    const sourceTypes = new Set(items.map((i) => i.source_type)).size;
    const recentItems = items.filter(
      (i) => Date.now() - new Date(i.ingested_at).getTime() < 6 * 60 * 60 * 1000,
    ).length;

    return count * 1.0 + sourceTypes * 1.5 + recentItems * 0.5;
  }
}
```

**Cron job:**

```typescript
// A cada 2 horas
cron.schedule('0 */2 * * *', async () => {
  const accounts = await getActiveAccounts();
  for (const account of accounts) {
    await EditorialClusterer.detectClusters(account.id);
  }
});
```

**Acceptance Criteria:**

- [ ] Clustering roda a cada 2h via cron job
- [ ] Janela temporal de 48h (configurável)
- [ ] Mínimo 2 itens com ≥2 tags em comum para formar cluster
- [ ] `trend_score` calculado com base em quantidade, diversidade e recência
- [ ] Clusters existentes não são duplicados (idempotência)
- [ ] Clusters antigos (>72h) são expirados automaticamente
- [ ] Clusters com itens de múltiplos `source_types` recebem score maior
- [ ] Log de execução para debugging

---

### EDT-005 — Geração de Editorial Briefs

| Field        | Value            |
| ------------ | ---------------- |
| Status       | TODO             |
| Priority     | High             |
| Dependencies | EDT-003, EDT-004 |

**Goal:** Para cada cluster com `status='detected'` e `trend_score` acima de threshold, gerar um editorial brief: síntese do contexto + 2–4 ângulos sugeridos para posts.

**Arquivos a criar:**

- `backend/src/services/editorial/brief-generator.ts`
- `backend/src/routes/editorial.ts` — rotas CRUD para briefs

**Prompt de brief:**

```typescript
export function buildBriefPrompt(): string {
  return [
    'You are an editorial advisor for a social media account on X (Twitter).',
    'Given the following collection of related content items about a topic,',
    'create an editorial brief that includes:',
    '',
    '1. A concise context summary (2-3 sentences) explaining what is happening',
    '2. 2-4 suggested posting angles, each with:',
    '   - A short angle description (1 sentence)',
    '   - A rationale for why this angle works (1 sentence)',
    '',
    'Consider: variety of perspectives, engagement potential, timeliness.',
    'Write in the same language as the content.',
    '',
    'Respond ONLY with valid JSON:',
    '{',
    '  "context": "...",',
    '  "angles": [{ "angle": "...", "rationale": "..." }]',
    '}',
  ].join('\n');
}
```

**Serviço:**

```typescript
export class BriefGenerator {
  static async generateForCluster(clusterId: string): Promise<void> {
    // 1. Fetch cluster + cluster_items → content_items (title + summary de cada)
    // 2. Construir prompt com todos os resumos agrupados
    // 3. Call AI: generateRaw(briefPrompt, contentSummaries)
    // 4. Parse response: { context, angles }
    // 5. INSERT editorial_briefs(brief_text=context, suggested_angles=angles)
    // 6. UPDATE editorial_clusters SET status='ready'
  }

  /**
   * Roda para todos os clusters detected com score >= threshold
   */
  static async processDetectedClusters(xAccountId: string): Promise<void> {
    const THRESHOLD = 3.0; // score mínimo para gerar brief
    // Query clusters WHERE status='detected' AND trend_score >= THRESHOLD
    // Para cada: generateForCluster(cluster.id)
  }
}
```

**Rotas:**

```
GET    /api/v1/accounts/:accountId/editorial/briefs           → List briefs (status filter)
GET    /api/v1/accounts/:accountId/editorial/briefs/:briefId  → Brief detail + cluster items
PATCH  /api/v1/accounts/:accountId/editorial/briefs/:briefId  → Approve/dismiss + select angle
POST   /api/v1/accounts/:accountId/editorial/briefs/:briefId/generate → Gerar sugestão a partir do brief
```

**Acceptance Criteria:**

- [ ] Briefs gerados automaticamente para clusters com score ≥ threshold (3.0)
- [ ] Cada brief contém contexto + 2–4 ângulos com rationale
- [ ] Brief é na mesma língua que o conteúdo do cluster
- [ ] API permite listar, visualizar, aprovar e descartar briefs
- [ ] Usuário pode selecionar ângulo antes de gerar sugestão
- [ ] Auto-flow: ângulo com maior score é selecionado automaticamente
- [ ] Cluster atualizado para `status='ready'` quando brief é gerado

---

### EDT-006 — Geração Contextual de Sugestões

| Field        | Value            |
| ------------ | ---------------- |
| Status       | TODO             |
| Priority     | Critical         |
| Dependencies | EDT-005, SRC-006 |

**Goal:** Novo modo de geração de sugestões que usa o editorial brief + múltiplas fontes para criar tweets mais ricos e contextuais. Substitui o modelo 1:1 quando há briefs disponíveis.

**Arquivos a criar/modificar:**

- `backend/src/services/editorial/contextual-generator.ts`
- `backend/src/services/ai/prompts.ts` — adicionar prompt contextual
- `backend/src/routes/editorial.ts` — endpoint de geração

**Prompt contextual:**

```typescript
export function buildContextualPublicationPrompt(): string {
  return [
    'You are a social media expert writing for X (Twitter).',
    'You have been given:',
    '1. An editorial context about a trending topic',
    '2. A specific angle to take',
    '3. Full content from multiple source articles/videos/posts',
    '',
    'Generate an engaging tweet that:',
    '- Takes the specified angle on the topic',
    '- Synthesizes information from MULTIPLE sources (not just one)',
    '- Feels authentic and informed, not like a generic news reshare',
    '- Stays within character limit',
    '- Uses the same language as the source content',
    '',
    'Respond ONLY with valid JSON: { "text": "...", "hashtags": ["#tag1", "#tag2"] }',
  ].join('\n');
}
```

**Serviço:**

```typescript
export class ContextualGenerator {
  static async generateFromBrief(
    briefId: string,
    selectedAngle: string,
    xAccountId: string,
  ): Promise<string> {
    // 1. Fetch brief + cluster + cluster_items → content_items
    // 2. Para os top 3 itens por relevance_score:
    //    a. Se full_content IS NULL → fetchArticleContent(url) → cache
    // 3. Construir prompt:
    //    - System: buildContextualPublicationPrompt() + user publication rules
    //    - User: briefContext + selectedAngle + fullContents
    // 4. Call AI → parse response
    // 5. INSERT ai_suggestions(
    //      content_item_id = NULL (não é 1:1),
    //      editorial_brief_id = briefId,
    //      source_content_ids = [item1.id, item2.id, item3.id],
    //      suggestion_text = generatedTweet,
    //      hashtags, status = 'approved'
    //    )
    // 6. Gerar article_summary com base nos múltiplos conteúdos
    // 7. UPDATE editorial_briefs SET status='used'
    // 8. UPDATE editorial_clusters SET status='used'
    // 9. Retornar suggestion.id
  }
}
```

**Diferença do fluxo 1:1:**

| Aspecto              | Fluxo 1:1 (atual)             | Fluxo Editorial (novo)                   |
| -------------------- | ----------------------------- | ---------------------------------------- |
| Fonte                | 1 content_item                | 2–5 content_items do cluster             |
| Contexto             | Título + conteúdo de 1 artigo | Brief editorial + múltiplos conteúdos    |
| Qualidade            | Rewrite de notícia            | Síntese informada com ângulo editorial   |
| Autenticidade        | Parece reshare                | Parece opinião original bem fundamentada |
| `article_id`         | Preenchido                    | NULL                                     |
| `editorial_brief_id` | NULL                          | Preenchido                               |
| `source_content_ids` | `[]`                          | `[id1, id2, ...]`                        |

**Acceptance Criteria:**

- [ ] Sugestão gerada a partir de brief + ângulo selecionado
- [ ] AI recebe full_content de até 3 fontes mais relevantes do cluster
- [ ] full_content é obtido/cacheado para cada fonte (mesmo padrão de artigos)
- [ ] Publication prompt rules do usuário são aplicadas
- [ ] Sugestão tem `editorial_brief_id` e `source_content_ids` preenchidos
- [ ] Article summary gerado com base nos múltiplos conteúdos
- [ ] Brief e cluster atualizados para `status='used'`
- [ ] Fluxo 1:1 continua funcionando para itens sem cluster
- [ ] Auto-flow suportado: seleciona melhor ângulo automaticamente

---

### EDT-007 — Frontend — Painel Editorial

| Field        | Value            |
| ------------ | ---------------- |
| Status       | TODO             |
| Priority     | High             |
| Dependencies | EDT-005, EDT-006 |

**Goal:** Nova página "Editorial" que mostra clusters detectados, briefs gerados, e permite ao usuário revisar ângulos e gerar sugestões contextuais.

**Arquivos a criar:**

- `frontend/app/(app)/accounts/[accountId]/editorial/page.tsx`
- `frontend/components/editorial/ClusterCard.tsx` — card de cluster com trend_score
- `frontend/components/editorial/BriefDetail.tsx` — detalhes do brief + ângulos
- `frontend/components/editorial/AngleSelector.tsx` — seleção de ângulo para geração
- `frontend/components/editorial/TrendIndicator.tsx` — visualização de score/trending

**Layout da página:**

```
Painel Editorial
├── Filtros: período (hoje, semana), score mínimo
├── Grid de Clusters (ordenados por trend_score DESC)
│   ├── ClusterCard
│   │   ├── topic, trend_score (barra visual), item_count
│   │   ├── Tags compartilhadas (badges)
│   │   ├── Tipos de fonte presentes (ícones)
│   │   ├── Status badge (detected, ready, used)
│   │   └── [Botão: Ver Brief / Gerar Brief]
│   └── ...
└── Detalhe do Brief (drawer/modal ou página separada)
    ├── Contexto editorial (texto)
    ├── Fontes incluídas (lista com links)
    ├── Ângulos sugeridos (cards selecionáveis)
    │   ├── AngleCard: ângulo + rationale
    │   └── [Selecionar e Gerar Post]
    └── Sugestão gerada (se já criada)
```

**Componentes visuais:**

```tsx
// TrendIndicator — barra de score de 0 a 10
<div className="flex items-center gap-2">
  <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
    <div className="bg-gold h-full rounded-full" style={{ width: `${(score / 10) * 100}%` }} />
  </div>
  <span className="text-muted-foreground text-sm">{score.toFixed(1)}</span>
</div>
```

**Acceptance Criteria:**

- [ ] Página `/accounts/:id/editorial` acessível via sidebar
- [ ] Grid de clusters com visual de trend_score
- [ ] Filtro por período e score mínimo
- [ ] Ao clicar em cluster, mostra brief com ângulos
- [ ] Seleção de ângulo + botão "Gerar Post" cria sugestão
- [ ] Sugestão gerada aparece inline (sem reload)
- [ ] Clusters usados ficam visualmente distintos (opacidade reduzida)
- [ ] Indicadores visuais de diversidade de fontes (ícones por tipo)
- [ ] Empty state quando não há clusters detectados

---

### EDT-008 — Frontend — Sugestões Contextuais no Dashboard

| Field        | Value            |
| ------------ | ---------------- |
| Status       | TODO             |
| Priority     | High             |
| Dependencies | EDT-006, EDT-007 |

**Goal:** Integrar sugestões editoriais no Dashboard principal. Mostrar seção "Trending" com top clusters e briefs prontos. Diferenciar visualmente sugestões 1:1 de sugestões editoriais.

**Arquivos a modificar:**

- `frontend/components/dashboard/PendingPostsSection.tsx` — badge "Editorial" para sugestões com `editorial_brief_id`
- `frontend/components/timeline/SuggestionCard.tsx` — exibir fontes múltiplas quando `source_content_ids.length > 0`
- `frontend/components/timeline/TimelineItem.tsx` — ícone editorial
- `frontend/app/(app)/dashboard/page.tsx` — seção "Trending" com top clusters

**Arquivos a criar:**

- `frontend/components/dashboard/TrendingSection.tsx` — top 3 clusters com briefs prontos
- `frontend/components/dashboard/EditorialBadge.tsx` — badge visual para sugestões editoriais

**Layout da seção Trending:**

```
🔥 Em Alta (Top clusters com briefs prontos)
├── Mini ClusterCard 1: topic, score, [Gerar Post]
├── Mini ClusterCard 2: topic, score, [Gerar Post]
└── Mini ClusterCard 3: topic, score, [Gerar Post]
[Ver todos → /editorial]
```

**SuggestionCard atualizado:**

```tsx
// Para sugestões editoriais (editorial_brief_id !== null)
<div className="mb-2 flex items-center gap-2">
  <EditorialBadge />
  <span className="text-muted-foreground text-sm">Baseado em {sourceContentIds.length} fontes</span>
</div>;
// Lista as fontes usadas com ícone de tipo
{
  sourceContentIds.map((id) => <SourceChip key={id} contentItemId={id} />);
}
```

**Acceptance Criteria:**

- [ ] Dashboard mostra seção "Em Alta" com top 3 clusters com briefs prontos
- [ ] Clicar em "Gerar Post" no cluster abre seletor de ângulo
- [ ] "Ver todos" navega para `/accounts/:id/editorial`
- [ ] SuggestionCard mostra badge "Editorial" para sugestões com `editorial_brief_id`
- [ ] SuggestionCard lista fontes usadas com ícones por tipo
- [ ] Timeline diferencia visualmente sugestões 1:1 de editoriais
- [ ] Seção vazia quando não há clusters com briefs prontos

---

## EPIC INFRA — Infrastructure & Quality

---

### INFRA-001 — Docker Setup (Backend)

| Field        | Value     |
| ------------ | --------- |
| Status       | TODO      |
| Priority     | Medium    |
| Dependencies | SETUP-002 |

**Files:**

- `backend/Dockerfile`
- `docker-compose.yml` (root — for local development)

**Dockerfile:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

**Acceptance Criteria:**

- [ ] `docker build` succeeds
- [ ] `docker run` starts the server and `GET /health` responds
- [ ] Environment variables are injected at runtime (not baked in)

---

### INFRA-002 — Testing Setup

| Field        | Value                          |
| ------------ | ------------------------------ |
| Status       | TODO                           |
| Priority     | Medium                         |
| Dependencies | SETUP-002, SETUP-003, CORE-003 |

**Goal:** Configure Vitest for backend unit + integration tests and React Testing Library for frontend component tests. Establish mock factories and coverage reporting.

**Files to create:**

- `backend/vitest.config.ts` — Vitest config for backend
- `backend/src/test/setup.ts` — global test setup (env vars, vi.mock stubs)
- `backend/src/test/mocks/supabase.ts` — reusable Supabase mock factory
- `backend/src/test/mocks/x-api.ts` — reusable TwitterApi mock factory
- `backend/src/test/mocks/ai.ts` — reusable OpenAI / Anthropic mock factories
- `backend/src/test/helpers/app.ts` — `buildTestApp()` helper (Fastify instance with mocked auth)
- `frontend/vitest.config.ts` — Vitest config with `@vitejs/plugin-react` and jsdom
- `frontend/src/test/setup.ts` — `@testing-library/jest-dom` matchers setup

**Backend `vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 60 },
    },
  },
});
```

**Integration test helper:**

```typescript
// backend/src/test/helpers/app.ts
import Fastify from 'fastify';
import { buildApp } from '../../app';

export async function buildTestApp(userOverride?: Partial<RequestUser>) {
  const app = await buildApp();
  // Decorate with a mock authenticate hook for protected route tests
  app.decorateRequest('user', {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'member',
    ...userOverride,
  });
  return app;
}
```

**Frontend `vitest.config.ts`:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: { lines: 50 },
    },
  },
});
```

**Implementation Notes:**

- See `docs/ARCHITECTURE.md §16` for the full testing strategy, mock patterns, and coverage targets
- Tests are colocated with source files (`*.test.ts` / `*.test.tsx`)
- Add `"test": "vitest run"` and `"test:watch": "vitest"` to both workspace `package.json` files
- Add `"test": "pnpm --filter frontend test && pnpm --filter backend test"` to root `package.json`

**Acceptance Criteria:**

- [ ] `pnpm test` from root runs both workspaces and passes
- [ ] `pnpm --filter backend test -- --coverage` generates a coverage report
- [ ] `pnpm --filter frontend test -- --coverage` generates a coverage report
- [ ] Mock factories exist for Supabase, X API, and AI providers
- [ ] `buildTestApp()` helper allows testing routes without a real JWT
- [ ] The existing `crypto.test.ts` (CORE-003) passes as part of this run

---

### INFRA-003 — README.md

| Field        | Value           |
| ------------ | --------------- |
| Status       | TODO            |
| Priority     | Medium          |
| Dependencies | All SETUP tasks |

**File:** `README.md` (root)

**Sections:**

1. Project overview + screenshot (placeholder)
2. Tech stack (linked)
3. Getting started (prerequisites, clone, install, env setup, `pnpm dev`)
4. Project structure
5. Available scripts
6. Database setup (`supabase db push`, `pnpm db:types`)
7. Architecture (link to `docs/ARCHITECTURE.md`)
8. Contributing guide

**Acceptance Criteria:**

- [ ] A new developer can get the project running locally following only the README
- [ ] All commands listed are tested and working
