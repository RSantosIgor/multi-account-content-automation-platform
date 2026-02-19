# Changelog — Backend

All changes made by AI agents to this workspace are recorded here in **reverse chronological order** (newest first).

> **Agents:** Read `AGENTS.md §3` for the required format and rules before adding an entry.

---

<!-- NEW ENTRIES GO HERE — insert above this line -->

## [2026-02-19 00:00 UTC] SETUP-002 — Scaffold Fastify Backend

**Agent:** claude-sonnet-4-5-20250929
**Task:** SETUP-002

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
