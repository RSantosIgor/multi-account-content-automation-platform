# AGENTS.md — Frontend Workspace

> This file defines the rules and workflow for any AI agent working on the **frontend** workspace.
> Read this file completely before making any changes.

---

## 1. Workspace Overview

This is the **Next.js 16 (App Router)** frontend for the batchNews platform.
It is responsible exclusively for **UI rendering and client-side authentication**.
All business logic lives in the backend workspace (`../backend`).

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui · Supabase SSR

---

## 2. Required Reading (Before Starting Any Task)

Before implementing anything, read the following in order:

1. [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — System architecture, conventions, folder structure, naming rules
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

- `path/to/file.tsx` — description of what it does

### Files Modified

- `path/to/file.tsx` — what was changed and why

### Files Deleted

- `path/to/file.tsx` — reason for deletion

### Summary

One or two sentences describing what was implemented and any important decisions made.

### Notes

Any caveats, known issues, or follow-up tasks required.
```

### Rules for the log entry

- Use **UTC** for the timestamp
- Omit sections that don't apply (e.g., omit "Files Deleted" if nothing was deleted)
- Be specific: instead of "updated components", write "updated `SuggestionCard.tsx` to add character counter"
- Add a "Notes" section if there are edge cases, unfinished work, or decisions that future agents should be aware of
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

- **Strict mode** is enabled — no `any` types (use `unknown` and narrow)
- All props must be typed (no implicit prop types)
- Prefer `type` over `interface` for object shapes
- Use `satisfies` operator for config objects

### Components

- **Server Components** by default — add `'use client'` only when needed (interactivity, browser APIs, hooks)
- One component per file
- File name matches component name: `SuggestionCard.tsx` exports `export function SuggestionCard()`
- Prefer composition over inheritance
- No inline styles — use Tailwind utility classes only

### UI / shadcn

- Always use **shadcn/ui** components as the base — never build raw HTML replacements for things shadcn covers
- Add shadcn components with: `npx shadcn@latest add <component>`
- New shadcn components go to `components/ui/` (auto-generated)
- Custom components go to `components/<feature>/`

### Data Fetching

- All backend calls go through `lib/api/client.ts` — never call `fetch()` directly in components
- Use `async` Server Components for initial data fetching
- Use `SWR` or `React Query` (if added to the project) for client-side revalidation
- Handle loading states with `Skeleton` components
- Handle error states with inline error messages or `toast`

### Forms

- All forms use `react-hook-form` + `zod` resolver
- Validation schemas live in the same file as the form component (or in a co-located `*.schema.ts` file)
- Show field-level error messages below each input

### Routing

- Prefer server-side redirects (in Server Components) over client-side `router.push` after auth checks
- Route groups: `(auth)` for public routes, `(app)` for protected routes

---

## 6. Security Rules

- **Never** put `SUPABASE_SERVICE_ROLE_KEY` or `ENCRYPTION_KEY` in frontend code or `.env.local`
- Only use `NEXT_PUBLIC_*` env vars in the frontend (these are safe to expose)
- Never make direct Supabase database queries from frontend code — all DB access goes through the backend API
- Never store JWT tokens in `localStorage` — Supabase SSR handles this with HTTPOnly cookies
- Sanitize any user-provided content before rendering (avoid `dangerouslySetInnerHTML`)

---

## 7. Approved Libraries

Do not install new libraries without updating `CHANGELOG.md` with the reason.

| Purpose       | Library                                  |
| ------------- | ---------------------------------------- |
| Framework     | `next`                                   |
| Auth          | `@supabase/ssr`, `@supabase/supabase-js` |
| UI components | `shadcn/ui` (via CLI), `lucide-react`    |
| Styling       | `tailwindcss`                            |
| Forms         | `react-hook-form`, `@hookform/resolvers` |
| Validation    | `zod`                                    |
| Dates         | `date-fns`                               |
| HTTP client   | `fetch` via `lib/api/client.ts`          |

---

## 8. What NOT To Do

- Do **not** add business logic to the frontend (scraping, AI calls, X API calls, token encryption)
- Do **not** create new Supabase clients with the service role key
- Do **not** skip writing to `CHANGELOG.md`
- Do **not** use `any` TypeScript type
- Do **not** install libraries outside the approved list without documenting the reason
- Do **not** commit `.env.local` or any file containing secrets
- Do **not** use `console.log` in production code — use proper error boundaries and toast notifications
- Do **not** modify files in `components/ui/` manually — re-run the shadcn CLI instead

---

_This file is authoritative. When in doubt, follow the rules here._
