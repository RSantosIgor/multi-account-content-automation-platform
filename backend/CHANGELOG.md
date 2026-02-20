# Changelog — Backend

All changes made by AI agents to this workspace are recorded here in **reverse chronological order** (newest first).

> **Agents:** Read `AGENTS.md §3` for the required format and rules before adding an entry.

---

## [2026-02-20 17:33 UTC] XACCOUNT-001 / XACCOUNT-002 — OAuth PKCE + X Accounts API

**Agent:** gpt-5-codex
**Task:** XACCOUNT-001, XACCOUNT-002
**Commit:** PENDING

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
