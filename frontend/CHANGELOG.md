# Changelog — Frontend

All changes made by AI agents to this workspace are recorded here in **reverse chronological order** (newest first).

> **Agents:** Read `AGENTS.md §3` for the required format and rules before adding an entry.

---

## [2026-02-21] SITES-003 — News Sites UI & Account Overview Page

**Agent:** Claude Sonnet 4.5
**Task:** SITES-003

### Files Created

- `app/(app)/accounts/[accountId]/page.tsx` — Account overview page (Server Component). Shows avatar, username, stats (sites/posts), and navigation cards to Sites and Timeline.
- `app/(app)/accounts/[accountId]/sites/page.tsx` — Sites list page (Server Component). Fetches sites from backend API, renders SiteTable.
- `app/(app)/accounts/[accountId]/sites/new/page.tsx` — Create site page. Renders SiteForm in create mode.
- `app/(app)/accounts/[accountId]/sites/[siteId]/page.tsx` — Edit site page. Renders SiteForm in edit mode with ScraperPreview.
- `components/sites/SiteTable.tsx` — Sites table with inline Switch toggle, AlertDialog delete confirmation, and edit link. Optimistic local state updates.
- `components/sites/SiteForm.tsx` — Site form with react-hook-form + Zod. Shows RSS detection alert on create, ScraperPreview on edit.
- `components/sites/ScraperPreview.tsx` — Preview component (placeholder until SCRAPER-001/002).
- `components/ui/alert-dialog.tsx` — shadcn/ui AlertDialog.
- `components/ui/table.tsx` — shadcn/ui Table.
- `components/ui/switch.tsx` — shadcn/ui Switch.
- `components/ui/alert.tsx` — shadcn/ui Alert.

### Summary

Built complete news sites management UI and account overview page. Dashboard AccountCard links to `/accounts/:id` which shows stats and navigation to Sites/Timeline. Sites section supports full CRUD with inline toggle and delete confirmation. All pages follow batchNews design system (dark theme, gold accents, Playfair Display headings).

## [2026-02-20 17:45 UTC] ad-hoc — Error Message Language Standardization

**Agent:** gpt-5-codex
**Task:** ad-hoc
**Commit:** ca588e5

### Files Modified

- `app/(app)/dashboard/page.tsx` — Standardized dashboard fallback error text to English.
- `components/accounts/ConnectXButton.tsx` — Standardized OAuth start error text to English and avoided exposing raw API error messages.
- `components/auth/LoginForm.tsx` — Standardized login auth error text to English.

### Summary

Updated technical/error-facing messages in this flow to English, keeping user-facing UI content in Portuguese where appropriate.

## [2026-02-20 17:33 UTC] XACCOUNT-003 — X Accounts Dashboard

**Agent:** gpt-5-codex
**Task:** XACCOUNT-003
**Commit:** ca588e5

### Files Created

- `app/(app)/dashboard/page.tsx` — Implemented dashboard view with account loading, empty state, loading skeleton, and error handling.
- `components/accounts/AccountCard.tsx` — Added account card UI (avatar, username/display name, status, sites/posts counters, account link).
- `components/accounts/ConnectXButton.tsx` — Added button that calls OAuth start endpoint and redirects user to X authorization URL.

### Summary

Built the X Accounts dashboard page and components to list connected accounts and start the X OAuth flow directly from the UI.

### Notes

- Dashboard consumes `GET /api/v1/accounts` and expects normalized fields from backend (`username`, `displayName`, `sitesCount`, `postsCount`).

## [2026-02-20] AUTH-001 to AUTH-004 — Frontend Authentication & Design System

**Agent:** claude-opus-4-6
**Task:** AUTH-001, AUTH-002, AUTH-003, AUTH-004

### Design System

- `app/globals.css` — Updated CSS variables to batchNews brand: #0F0F0F (background), #C6A75E (gold primary), #2D2D2D (card), #F4F4F4 (foreground)
- `app/layout.tsx` — Added Playfair Display font (titles) alongside Inter (body), dark mode by default
- `tailwind.config.ts` — Added `font-display` (Playfair) and `font-sans` (Inter) families, `gold` color

### Files Created

- `app/(auth)/login/page.tsx` — Login page (Server Component)
- `app/(auth)/register/page.tsx` — Registration page (Server Component)
- `app/(auth)/forgot-password/page.tsx` — Forgot password page (Server Component)
- `app/(auth)/reset-password/page.tsx` — Reset password page (Server Component)
- `components/auth/LoginForm.tsx` — Login form with react-hook-form + zod, Supabase signInWithPassword
- `components/auth/RegisterForm.tsx` — Registration form with password confirmation, email verification flow
- `components/auth/ForgotPasswordForm.tsx` — Email input for password reset request
- `components/auth/ResetPasswordForm.tsx` — New password form with confirmation, toast on success
- `components/layout/AppSidebar.tsx` — Sidebar with navigation links, active state, admin-only items
- `components/layout/AppHeader.tsx` — Header with hamburger menu (mobile Sheet), user dropdown with logout
- `components/ui/form.tsx` — shadcn/ui Form (react-hook-form integration)
- `components/ui/sheet.tsx` — shadcn/ui Sheet (mobile sidebar)
- `components/ui/separator.tsx` — shadcn/ui Separator
- `components/ui/avatar.tsx` — shadcn/ui Avatar
- `components/ui/dropdown-menu.tsx` — shadcn/ui DropdownMenu

### Files Modified

- `app/(auth)/layout.tsx` — Mountain landscape background with dark overlay, glassmorphism card, batchNews logo in Playfair gold
- `app/(app)/layout.tsx` — Replaced placeholder with real AppSidebar + AppHeader components

### Summary

Complete frontend authentication flow: login, registration (with email verification), password recovery (request + reset), and app layout with responsive sidebar (Sheet on mobile) and user header with logout. Design system uses dark editorial theme with gold (#C6A75E) accents and Playfair Display titles.

## [2026-02-20] Add batchNews logo to auth and app layouts

**Agent:** claude-opus-4-6

### Files Modified

- `app/(auth)/layout.tsx` — Replaced text "batchNews" heading with `logo_dark.png` image (200x60, Next.js Image component with priority)
- `components/layout/AppSidebar.tsx` — Replaced text logo with `logo_dark.png` image (120x36, Next.js Image component with priority)

### Summary

Integrated official batchNews logo (dark variant for dark backgrounds) into authentication pages and app sidebar. Both locations use Next.js optimized Image component with priority loading.

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
