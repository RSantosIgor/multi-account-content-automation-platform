# AGENTS.md — Backend Workspace

> This file defines the rules and workflow for any AI agent working on the **backend** workspace.
> Read this file completely before making any changes.

---

## 1. Workspace Overview

This is the **Fastify + Node.js** backend for the batchNews platform.
It owns all business logic: authentication verification, scraping, AI processing, X API integration, and scheduled jobs.

**Stack:** Fastify 4 · Node.js 20 · TypeScript · Supabase (Auth + PostgreSQL) · node-cron

**Supabase usage:** Auth verification + PostgreSQL only. No Edge Functions, no Storage, no Realtime.

---

## 2. Required Reading (Before Starting Any Task)

Before implementing anything, read the following in order:

1. [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — System architecture, conventions, folder structure, naming rules, security model
2. [`../docs/TASKS.md`](../docs/TASKS.md) — Full list of epics and tasks; find your assigned task for deliverables and acceptance criteria
3. [`CHANGELOG.md`](./CHANGELOG.md) — Recent changes that may affect your task

---

## 3. Mandatory Change Logging Rule

> **This rule is non-negotiable. Every change must be logged.**

After completing any task (or meaningful partial work), you **must** append an entry to [`CHANGELOG.md`](./CHANGELOG.md) in this workspace.

### Log entry format

```markdown
## [YYYY-MM-DD HH:MM UTC] <Task ID> — <Short title>

**Agent:** <model name>
**Task:** <task ID from TASKS.md, or 'ad-hoc' if not task-based>
**Commit:** PENDING

### Files Created

- `path/to/file.ts` — description of what it does

### Files Modified

- `path/to/file.ts` — what was changed and why

### Files Deleted

- `path/to/file.ts` — reason for deletion

### Summary

One or two sentences describing what was implemented and any important decisions made.

### Notes

Any caveats, known issues, or follow-up tasks required.
```

### Rules for the log entry

- Use **UTC** for the timestamp
- Omit sections that don't apply (e.g., omit "Files Deleted" if nothing was deleted)
- Be specific: instead of "added scraping service", write "created `services/scraper/rss.ts` with `scrapeRss()` function using `rss-parser`"
- Add a "Notes" section for edge cases, unfinished work, or decisions that future agents should be aware of
- Entries are prepended (newest first) — insert your entry at the **top** of the entries list, below the header

---

## 4. Workflow

Follow this sequence for every task:

```
1. Read AGENTS.md (this file)                   ← you are here
2. Read docs/ARCHITECTURE.md
3. Read your task in docs/TASKS.md
4. Read CHANGELOG.md for recent context
       ↓
5. Implement the task
   - Follow coding standards (§5)
   - Follow security rules (§6)
   - Use only the approved libraries (§7)
       ↓
6. Verify acceptance criteria from TASKS.md are met
       ↓
7. Append entry to CHANGELOG.md (§3)
       ↓
8. Update the task status in docs/TASKS.md from TODO to DONE
```

---

## 5. Coding Standards

These apply to all code in this workspace. See `../docs/ARCHITECTURE.md §14` for naming conventions.

### TypeScript

- **Strict mode** is enabled — no `any` types (use `unknown` and narrow explicitly)
- All function parameters and return types must be explicitly typed
- Prefer `type` over `interface`
- Use `satisfies` for config objects

### Fastify Patterns

- Register route modules as Fastify plugins (use `fastify.register()`)
- All routes use Zod schemas for input validation — pass them as `schema.body`, `schema.params`, `schema.querystring`
- Use `preHandler` hooks for authentication and authorization, never inline logic
- Type augment `FastifyRequest` for custom properties (e.g., `request.user`)

Example route structure:

```typescript
// routes/accounts.ts
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const accountsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/api/v1/accounts',
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      // handler
    },
  );
};

export default accountsRoutes;
```

### Standard Response Format

Always use the formats from `docs/ARCHITECTURE.md §12`:

```typescript
// Success
reply.status(200).send({ data: result });
reply.status(201).send({ data: created, message: 'Resource created' });
reply.status(204).send();

// Error (handled by global error handler — throw, don't reply manually)
throw fastify.httpErrors.notFound('Account not found');
throw fastify.httpErrors.forbidden('Insufficient permissions');
```

### Services

- Services are plain TypeScript classes or modules — no Fastify dependencies
- Services interact with Supabase via `lib/supabase.ts`
- Services throw errors; routes catch them via the global error handler
- Never put `fetch` calls to external APIs in route handlers — always delegate to a service

### Environment Variables

- Access env vars **only** through `config.ts` — never use `process.env` directly in other files
- If a new env var is needed, add it to: `config.ts` schema, `backend/.env.example`, and `docs/ARCHITECTURE.md §15`

### Logging

- Use `fastify.log` (Pino) — never `console.log`
- Log at appropriate levels: `info` for normal operations, `warn` for recoverable issues, `error` for failures
- **Never log sensitive data** (tokens, passwords, encryption keys)
- Redact sensitive fields in Pino config: `['authorization', 'oauth_access_token', 'oauth_refresh_token']`

---

## 6. Security Rules

- **Never return `oauth_access_token_enc` or `oauth_refresh_token_enc`** in any API response
- **Never log tokens** — use `[REDACTED]` if a log line must reference a token field
- **Always decrypt tokens in-memory only** — assign to a `const` that is used immediately
- Use `lib/crypto.ts` for all token encryption/decryption — never implement encryption inline
- Validate **all** input with Zod schemas before processing
- Use parameterized queries via the Supabase client — never interpolate user input into SQL strings
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — use it carefully and only in the backend
- Always verify that a resource belongs to `request.user.id` before mutating it

---

## 7. Approved Libraries

Do not install new libraries without documenting the reason in `CHANGELOG.md`.

| Purpose         | Library                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| HTTP framework  | `fastify`                                                                     |
| Fastify plugins | `@fastify/cors`, `@fastify/helmet`, `@fastify/swagger`, `@fastify/swagger-ui` |
| Database        | `@supabase/supabase-js`                                                       |
| X API           | `twitter-api-v2`                                                              |
| RSS parsing     | `rss-parser`                                                                  |
| HTML parsing    | `cheerio`                                                                     |
| AI — OpenAI     | `openai`                                                                      |
| AI — Anthropic  | `@anthropic-ai/sdk`                                                           |
| Validation      | `zod`                                                                         |
| Scheduler       | `node-cron`                                                                   |
| Encryption      | Node.js built-in `crypto` (no external library)                               |
| Testing         | `vitest`                                                                      |

---

## 8. Database Interaction Rules

- Use the service role Supabase client from `lib/supabase.ts` for all DB operations
- Always select only the columns you need (avoid `select('*')` in production queries)
- For inserts that may conflict, use `.upsert()` with `onConflict` specified explicitly
- When querying data owned by a user, always add a `.eq('user_id', request.user.id)` filter as a second layer of protection (even though RLS handles it)

---

## 9. What NOT To Do

- Do **not** skip writing to `CHANGELOG.md`
- Do **not** put business logic in route handlers — delegate to services
- Do **not** use `any` TypeScript type
- Do **not** access `process.env` directly — use `config.ts`
- Do **not** return OAuth tokens in API responses
- Do **not** log sensitive values (tokens, keys, passwords)
- Do **not** install libraries outside the approved list without documenting the reason
- Do **not** commit `.env` files or any file containing real secrets
- Do **not** use Supabase Edge Functions, Supabase Storage, or Supabase Realtime — they are out of scope for this backend
- Do **not** write raw SQL strings — use the Supabase client query builder

---

_This file is authoritative. When in doubt, follow the rules here._
