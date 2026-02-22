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

| Task ID                                                       | Title                                          | Workspace | Priority | Status |
| ------------------------------------------------------------- | ---------------------------------------------- | --------- | -------- | ------ |
| [SETUP-001](#setup-001--initialize-monorepo)                  | Initialize Monorepo                            | Both      | Critical | DONE   |
| [SETUP-002](#setup-002--scaffold-fastify-backend)             | Scaffold Fastify Backend                       | Backend   | Critical | DONE   |
| [SETUP-003](#setup-003--scaffold-nextjs-frontend)             | Scaffold Next.js Frontend                      | Frontend  | Critical | DONE   |
| [SETUP-004](#setup-004--configure-supabase-cli--project)      | Configure Supabase CLI & Project               | Both      | Critical | DONE   |
| [SETUP-005](#setup-005--development-tooling)                  | Development Tooling                            | Both      | High     | DONE   |
| [DB-001](#db-001--bootstrap-extensions--helpers)              | Bootstrap Extensions & Helpers                 | Database  | Critical | DONE   |
| [DB-002](#db-002--user-profiles--roles)                       | User Profiles & Roles                          | Database  | Critical | DONE   |
| [DB-003](#db-003--x-accounts)                                 | X Accounts                                     | Database  | Critical | DONE   |
| [DB-004](#db-004--news-sites-articles-suggestions-posts-runs) | News Sites, Articles, Suggestions, Posts, Runs | Database  | Critical | DONE   |
| [DB-005](#db-005--rls-policies)                               | RLS Policies                                   | Database  | Critical | DONE   |
| [DB-006](#db-006--generate-typescript-types)                  | Generate TypeScript Types                      | Backend   | High     | DONE   |
| [CORE-001](#core-001--authentication-plugin-fastify)          | Authentication Plugin (Fastify)                | Backend   | Critical | DONE   |
| [CORE-002](#core-002--authorization-plugin-fastify)           | Authorization Plugin (Fastify)                 | Backend   | High     | DONE   |
| [CORE-003](#core-003--crypto-service)                         | Crypto Service                                 | Backend   | Critical | DONE   |
| [CORE-004](#core-004--supabase-service-client)                | Supabase Service Client                        | Backend   | Critical | DONE   |
| [CORE-005](#core-005--standard-error-handling)                | Standard Error Handling                        | Backend   | High     | DONE   |
| [AUTH-001](#auth-001--login-page)                             | Login Page                                     | Frontend  | Critical | DONE   |
| [AUTH-002](#auth-002--registration-page)                      | Registration Page                              | Frontend  | High     | DONE   |
| [AUTH-003](#auth-003--password-recovery-page)                 | Password Recovery Page                         | Frontend  | Medium   | DONE   |
| [AUTH-004](#auth-004--app-layout--sidebar)                    | App Layout & Sidebar                           | Frontend  | High     | DONE   |
| [XACCOUNT-001](#xaccount-001--x-oauth-pkce-service-backend)   | X OAuth PKCE Service                           | Backend   | Critical | DONE   |
| [XACCOUNT-002](#xaccount-002--x-account-crud-routes-backend)  | X Account CRUD Routes                          | Backend   | Critical | DONE   |
| [XACCOUNT-003](#xaccount-003--x-accounts-dashboard-frontend)  | X Accounts Dashboard                           | Frontend  | High     | DONE   |
| [SITES-001](#sites-001--rss-auto-detection-service-backend)   | RSS Auto-Detection Service                     | Backend   | High     | DONE   |
| [SITES-002](#sites-002--news-sites-crud-routes-backend)       | News Sites CRUD Routes                         | Backend   | Critical | DONE   |
| [SITES-003](#sites-003--news-sites-ui-frontend)               | News Sites UI                                  | Frontend  | High     | DONE   |
| [SCRAPER-001](#scraper-001--rss-scraper-service)              | RSS Scraper Service                            | Backend   | Critical | DONE   |
| [SCRAPER-002](#scraper-002--html-scraper-service)             | HTML Scraper Service                           | Backend   | High     | DONE   |
| [SCRAPER-003](#scraper-003--scraper-runner--orchestrator)     | Scraper Runner & Orchestrator                  | Backend   | Critical | DONE   |
| [SCRAPER-004](#scraper-004--scraping-routes-backend)          | Scraping Routes                                | Backend   | High     | DONE   |
| [SCRAPER-005](#scraper-005--cron-job-scheduler)               | Cron Job Scheduler                             | Backend   | Critical | DONE   |
| [AI-001](#ai-001--ai-provider-abstraction)                    | AI Provider Abstraction                        | Backend   | Critical | DONE   |
| [AI-002](#ai-002--prompt-templates)                           | Prompt Templates                               | Backend   | High     | DONE   |
| [AI-003](#ai-003--ai-processing-pipeline)                     | AI Processing Pipeline                         | Backend   | Critical | DONE   |
| [AI-004](#ai-004--ai-suggestion-routes-backend)               | AI Suggestion Routes                           | Backend   | High     | DONE   |
| [TIMELINE-001](#timeline-001--timeline-api-route-backend)     | Timeline API Route                             | Backend   | Critical | TODO   |
| [TIMELINE-002](#timeline-002--timeline-page-frontend)         | Timeline Page                                  | Frontend  | Critical | TODO   |
| [TIMELINE-003](#timeline-003--timeline-filters-frontend)      | Timeline Filters                               | Frontend  | Medium   | TODO   |
| [POSTS-001](#posts-001--x-posting-service-backend)            | X Posting Service                              | Backend   | Critical | TODO   |
| [POSTS-002](#posts-002--post-routes-backend)                  | Post Routes                                    | Backend   | Critical | TODO   |
| [POSTS-003](#posts-003--publish-action-frontend)              | Publish Action                                 | Frontend  | Critical | TODO   |
| [ADMIN-001](#admin-001--admin-layout--guard)                  | Admin Layout & Guard                           | Both      | Medium   | TODO   |
| [ADMIN-002](#admin-002--user-management-page)                 | User Management Page                           | Both      | Medium   | TODO   |
| [INFRA-001](#infra-001--docker-setup-backend)                 | Docker Setup                                   | Backend   | Medium   | TODO   |
| [INFRA-002](#infra-002--testing-setup)                        | Testing Setup                                  | Both      | Medium   | TODO   |
| [INFRA-003](#infra-003--readmemd)                             | README.md                                      | Both      | Medium   | TODO   |

**Workspace legend:** `Backend` = Fastify API · `Frontend` = Next.js UI · `Database` = SQL migrations in `supabase/migrations/` · `Both` = touches both workspaces or root config

---

## Epic Index

| Epic                                                            | ID Prefix | Description                                   |
| --------------------------------------------------------------- | --------- | --------------------------------------------- |
| [Foundation & Setup](#epic-setup-foundation--setup)             | SETUP     | Monorepo, tooling, project scaffolding        |
| [Database & Migrations](#epic-db-database--migrations)          | DB        | All SQL migrations and RLS policies           |
| [Core Backend Services](#epic-core-core-backend-services)       | CORE      | Fastify setup, auth plugins, shared utilities |
| [Authentication (Frontend)](#epic-auth-authentication-frontend) | AUTH      | Login, register, route protection             |
| [X Account Management](#epic-xaccount-x-account-management)     | XACCOUNT  | OAuth flow, account CRUD                      |
| [News Sites Management](#epic-sites-news-sites-management)      | SITES     | Site CRUD, RSS detection                      |
| [Scraping Engine](#epic-scraper-scraping-engine)                | SCRAPER   | RSS + HTML scrapers, scheduler                |
| [AI Integration](#epic-ai-ai-integration)                       | AI        | Provider abstraction, suggestion generation   |
| [Timeline](#epic-timeline-timeline)                             | TIMELINE  | Unified feed of suggestions and posts         |
| [X Posting](#epic-posts-x-posting)                              | POSTS     | Publish to X, post history                    |
| [Admin Panel](#epic-admin-admin-panel)                          | ADMIN     | User management, role assignment              |
| [Infrastructure & Quality](#epic-infra-infrastructure--quality) | INFRA     | Docker, README, testing setup                 |

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
| Status       | TODO              |
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
| Status       | TODO                   |
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
| Status       | TODO         |
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
| Status       | TODO         |
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
| Status       | TODO              |
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
| Status       | TODO                    |
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
| Status       | TODO               |
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
| Status       | TODO      |
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

---

_Last updated: 2026-02-19_
