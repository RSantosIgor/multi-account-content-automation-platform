# Changelog — Frontend

All changes made by AI agents to this workspace are recorded here in **reverse chronological order** (newest first).

> **Agents:** Read `AGENTS.md §3` for the required format and rules before adding an entry.

---

<!-- NEW ENTRIES GO HERE — insert above this line -->

## [2026-02-19 00:00 UTC] SETUP-003 — Scaffold Next.js Frontend

**Agent:** claude-sonnet-4-5-20250929
**Task:** SETUP-003
**Commit:** 040c1b9

### Files Created

- `frontend/package.json` — workspace manifest with all frontend dependencies
- `frontend/tsconfig.json` — strict TypeScript config for Next.js App Router
- `frontend/next.config.ts` — minimal Next.js config with `reactStrictMode: true`
- `frontend/tailwind.config.ts` — Tailwind config with shadcn/ui CSS variable theme
- `frontend/postcss.config.mjs` — PostCSS config for Tailwind + Autoprefixer
- `frontend/components.json` — shadcn/ui CLI config (style: default, rsc: true, tsx: true)
- `frontend/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `frontend/app/globals.css` — Tailwind directives + CSS variables for light and dark theme
- `frontend/app/layout.tsx` — root layout with Inter font, global styles, and Toaster
- `frontend/app/(auth)/layout.tsx` — centered card layout for auth pages
- `frontend/app/(app)/layout.tsx` — sidebar + header shell layout (placeholders for AUTH-004)
- `frontend/app/page.tsx` — root page redirects to `/dashboard`
- `frontend/lib/supabase/client.ts` — browser-side Supabase client (`createBrowserClient`)
- `frontend/lib/supabase/server.ts` — server-side Supabase client (`createServerClient` with cookies)
- `frontend/lib/api/client.ts` — typed `apiClient<T>()` wrapper; auto-attaches JWT, throws `ApiError`
- `frontend/middleware.ts` — redirects unauthenticated users to `/login`; redirects authenticated users away from auth pages
- `frontend/.env.local.example` — template for public env vars
- `frontend/vitest.config.ts` — Vitest config with jsdom + `@vitejs/plugin-react` + V8 coverage
- `frontend/src/test/setup.ts` — imports `@testing-library/jest-dom` matchers
- `frontend/components/ui/button.tsx` — shadcn/ui Button (via CLI)
- `frontend/components/ui/card.tsx` — shadcn/ui Card (via CLI)
- `frontend/components/ui/input.tsx` — shadcn/ui Input (via CLI)
- `frontend/components/ui/label.tsx` — shadcn/ui Label (via CLI)
- `frontend/components/ui/badge.tsx` — shadcn/ui Badge (via CLI)
- `frontend/components/ui/skeleton.tsx` — shadcn/ui Skeleton (via CLI)
- `frontend/components/ui/sonner.tsx` — shadcn/ui Toaster (sonner, via CLI)

### Summary

Full Next.js 16 App Router frontend scaffold with TypeScript strict mode, Tailwind CSS, shadcn/ui, Supabase SSR auth, and middleware-based route protection. All backend calls go through `lib/api/client.ts` which automatically attaches the Supabase JWT.

### Notes

- shadcn/ui components were added via `npx shadcn@latest add` — do not edit files in `components/ui/` manually
- `middleware.ts` protects all routes except static assets; add new public paths to `isAuthRoute` if needed
- Next.js 16 is used
