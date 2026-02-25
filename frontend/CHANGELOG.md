# Changelog — Frontend

All changes made by AI agents to this workspace are recorded here in **reverse chronological order** (newest first).

> **Agents:** Read `AGENTS.md §3` for the required format and rules before adding an entry.

---

## [2026-02-25 18:00 UTC] ad-hoc — Sticky sidebar & rejection stepper

**Agent:** claude-sonnet-4-6
**Task:** ad-hoc
**Commit:** 31ac06b

### Files Created

- `components/timeline/detail/RejectionStep.tsx` — step component shown as the last stage of the DetailStepper when a suggestion is rejected; displays rejection timestamp and reviewer

### Files Modified

- `app/(app)/layout.tsx` — changed `<aside>` to `sticky top-0 h-screen flex-shrink-0` so the sidebar stays fixed while the main content scrolls independently
- `components/timeline/detail/DetailStepper.tsx` — added `isRejected?` flag to `Step` type; when `suggestion.status === 'rejected'`, last step renders `RejectionStep` with red circle (X icon) and red connector line instead of `PublicationStep`

### Summary

Sidebar is now sticky (fixed relative to page content). The article detail stepper now correctly represents the full lifecycle when a suggestion is rejected, rendering a fourth visual state with red indicators.

---

## [2026-02-25 13:49 UTC] UX-001 / UX-003 / UX-004 / UX-006 / UX-007 / UX-008 — UX Phases 2–4 Frontend

**Agent:** claude-sonnet-4-6
**Task:** UX-001, UX-003, UX-004, UX-006, UX-007, UX-008
**Commit:** 645774b

### Files Created

- `app/(app)/accounts/page.tsx` — accounts list page (moved from dashboard); Server Component fetching all X accounts
- `app/(app)/accounts/[accountId]/settings/page.tsx` — account settings page with Account Data and Prompt Rules tabs
- `app/(app)/accounts/[accountId]/stats/page.tsx` — statistics page with date range filter, metrics cards, and bar chart
- `app/(app)/accounts/[accountId]/timeline/[itemId]/page.tsx` — article detail page with back button and DetailStepper
- `components/layout/Breadcrumb.tsx` — auto-generates breadcrumb trail from `usePathname()`; supports dynamic segments with Portuguese labels
- `components/dashboard/AccountSelector.tsx` — dropdown to switch between X accounts in the dashboard
- `components/dashboard/PendingPostsSection.tsx` — grid of SuggestionCards filtered by `status=pending`; includes "Ver Detalhes" link
- `components/dashboard/PublishedPostsSection.tsx` — grid of published post cards with X links and "Ver Detalhes" link
- `components/dashboard/RejectedPostsSection.tsx` — grid of rejected suggestion cards with "Ver Detalhes" link
- `components/accounts/settings/AccountDataTab.tsx` — read-only account info with is_active toggle and disconnect button
- `components/accounts/settings/PromptRuleForm.tsx` — form to create/edit a prompt rule (type, name, prompt text, priority, active toggle)
- `components/accounts/settings/PromptRuleList.tsx` — table listing all prompt rules with type badge, edit/delete actions
- `components/accounts/settings/PromptRulesTab.tsx` — combines PromptRuleList and PromptRuleForm with create/edit/delete flow
- `components/timeline/detail/DetailStepper.tsx` — vertical 3-step stepper (Article → Suggestion → Publication/Rejection) with gold/red visual states
- `components/timeline/detail/OriginalArticleStep.tsx` — step showing article title, source, URL, scraped date, and article_summary bullets
- `components/timeline/detail/SuggestionStep.tsx` — step showing AI-generated tweet text, hashtags, status badge, and "Process Article" button for unprocessed articles
- `components/timeline/detail/PublicationStep.tsx` — step showing published post content, X link, and error message if failed
- `components/stats/DateRangeFilter.tsx` — preset buttons (7/30/90 days / All) that emit `{ from, to }` to parent
- `components/stats/MetricsCards.tsx` — four metric cards: total posts, avg/day, avg/week, avg/month
- `components/stats/PostingChart.tsx` — recharts `BarChart` with gold bars on dark background showing daily post counts
- `components/ui/breadcrumb.tsx` — shadcn/ui Breadcrumb component (via CLI)
- `components/ui/tabs.tsx` — shadcn/ui Tabs component (via CLI)

### Files Modified

- `app/(app)/dashboard/page.tsx` — rewritten as new dashboard with AccountSelector + pending/published/rejected tabs
- `app/(app)/accounts/[accountId]/page.tsx` — added Settings and Statistics navigation cards
- `app/(app)/accounts/[accountId]/timeline/page.tsx` — added Breadcrumb
- `app/(app)/accounts/[accountId]/sites/page.tsx` — added Breadcrumb
- `app/(app)/accounts/[accountId]/sites/new/page.tsx` — added Breadcrumb
- `app/(app)/accounts/[accountId]/sites/[siteId]/page.tsx` — added Breadcrumb
- `components/layout/AppSidebar.tsx` — added Accounts nav item linking to `/accounts`
- `components/timeline/SuggestionCard.tsx` — added "Ver Detalhes" button linking to detail page
- `components/timeline/TimelineItem.tsx` — passed `accountId` to SuggestionCard and PostCard for detail links
- `package.json` — added `recharts` dependency

### Summary

Complete UX epic frontend (phases 2–4): dashboard redesigned with per-account tabs; new /accounts route; account settings with prompt rule management; article detail page with vertical stepper; statistics dashboard with recharts bar chart. Breadcrumbs added to all deep pages. All UX-001 through UX-008 acceptance criteria met.

### Notes

- `recharts` was added as an approved library for chart visualization; documented here as required by AGENTS.md §7
- `shadcn/ui` tabs and breadcrumb components were added via `npx shadcn@latest add`
- The detail page stepper uses gold for completed steps and gray for pending steps

---

## [2026-02-25 00:03 UTC] UX-002 — Article Summary Display in Timeline

**Agent:** claude-sonnet-4-6
**Task:** UX-002
**Commit:** 4e64f04

### Files Modified

- `components/timeline/SuggestionCard.tsx` — added `articleSummary` prop; renders bullet list in a muted box below suggestion text when `article_summary` exists; bullets styled with gold `•` accent
- `components/timeline/TimelineItem.tsx` — added `ArticleSummary` type and passed `article_summary` from API response down to `SuggestionCard`
- `app/(app)/accounts/[accountId]/timeline/page.tsx` — added `ArticleSummary` type to `TimelineItemData` interface to match updated backend response

### Summary

Frontend display of AI-generated article summaries: suggestion cards now show 3–5 bullet points summarizing the source article when a summary is available, giving reviewers context before approving a tweet.

---

## [2026-02-24 21:00 UTC] POSTS-003 / ADMIN-001 / ADMIN-002 / TIMELINE-002 / TIMELINE-003 — Posts, Admin & Timeline UI

**Agent:** claude-sonnet-4-6
**Task:** POSTS-003, ADMIN-001, ADMIN-002, TIMELINE-002, TIMELINE-003
**Commit:** 81b1e3a

### Files Created

- `app/(app)/accounts/[accountId]/timeline/page.tsx` — timeline page fetching unified feed with status/type filters, renders `TimelineItem` list with empty state and loading skeleton
- `app/(app)/admin/layout.tsx` — admin section layout with role guard; redirects non-admin users to dashboard
- `app/(app)/admin/users/page.tsx` — user management page listing all users, showing roles, with role change dropdown (admin only)
- `components/timeline/PostCard.tsx` — card for published posts showing content, status badge, published date, and link to X post
- `components/timeline/PublishDialog.tsx` — dialog to edit and publish a suggestion to X; shows character counter, hashtags preview, and confirmation flow
- `components/timeline/SuggestionCard.tsx` — card for AI suggestions with approve/reject/publish actions, status badge, and hashtags
- `components/timeline/TimelineFilters.tsx` — filter bar with status (all/pending/approved/rejected/posted) and type (all/suggestion/post) selectors
- `components/timeline/TimelineItem.tsx` — unified item wrapper rendering either `SuggestionCard` or `PostCard` based on item type
- `components/ui/dialog.tsx` — shadcn/ui Dialog component (via CLI)
- `components/ui/select.tsx` — shadcn/ui Select component (via CLI)
- `components/ui/textarea.tsx` — shadcn/ui Textarea component (via CLI)
- `components/ui/tooltip.tsx` — shadcn/ui Tooltip component (via CLI)

### Files Modified

- `app/(app)/layout.tsx` — added admin nav item to sidebar (visible to admin users only)
- `components/sites/SiteForm.tsx` — added manual scrape trigger option in edit mode
- `components/sites/SiteTable.tsx` — added "Scrape Now" button triggering `POST /api/v1/scrape/run/:siteId`
- `lib/api/client.ts` — minor type fix for error handling

### Summary

Complete frontend for publishing pipeline, admin panel, and timeline: users can review AI suggestions, edit tweet text, and publish to X via a dialog with character counter. Timeline shows unified feed with filter controls. Admin panel allows role management. Scrape trigger button added to sites table.

---

## [2026-02-21 22:44 UTC] ad-hoc — Fix Site Edit/Preview Scraper Configuration Flow

**Agent:** gpt-5-codex
**Task:** ad-hoc
**Commit:** 8592dcf

### Files Modified

- `components/sites/SiteForm.tsx` — Added optional HTML selector inputs, prefill from existing site config, payload normalization, and validation requiring all selector fields when any selector is set.
- `components/sites/ScraperPreview.tsx` — Replaced outdated placeholder note with actionable guidance about URL/selectors.

### Summary

Fixed the site edit flow so users can configure and persist HTML selectors needed by non-RSS scraping, and improved preview feedback when zero articles are returned.

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
