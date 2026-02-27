# batchNews

> Multi-account X (Twitter) content automation platform. Aggregates news via RSS and web scraping, generates AI-powered post suggestions with customizable prompt rules, and publishes directly to X.

---

## Features

- **Multi-account management** — connect and manage multiple X (Twitter) accounts
- **News aggregation** — RSS-first collection with HTML scraping fallback; manually curate sites per account
- **AI-powered suggestions** — articles processed by OpenAI, Anthropic, or DeepSeek to generate ready-to-post suggestions (≤ 280 chars + hashtags)
- **Custom prompt rules** — per-account AI rules to control writing style and content filters (analysis and publication phases)
- **Full article content on approval** — when a suggestion is approved, the AI uses the complete article text (not just the RSS summary) to generate a higher-quality final tweet
- **Article summaries** — bullet-point summaries generated on approval and displayed in the timeline
- **Unified timeline** — review suggestions and post history per account in a single feed with detail view (article → suggestion → post stepper)
- **Dashboard** — tabs for Pending / Published / Rejected suggestions across all accounts
- **Account settings** — manage account data and configure prompt rules per account
- **Statistics** — daily posting charts with date range filters
- **One-click publishing** — edit, approve, and publish directly to X from the timeline
- **Access control** — user roles (`admin` / `member`) with row-level security enforced at the database layer
- **Scheduled scraping** — automatic periodic collection via `node-cron`, configurable per site

---

## Tech Stack

| Layer           | Technology                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| Frontend        | Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · recharts                                  |
| Backend         | Fastify 5 · Node.js 20 · TypeScript                                                                         |
| Database        | Supabase (PostgreSQL + Auth)                                                                                |
| AI              | OpenAI (`gpt-4o-mini`) · Anthropic (`claude-haiku-4-5`) · DeepSeek — configurable via `AI_PROVIDER` env var |
| X Integration   | X API v2 · OAuth 2.0 PKCE                                                                                   |
| Scraping        | `rss-parser` (RSS/Atom) · `cheerio` (HTML fallback + full article fetching)                                 |
| Scheduler       | `node-cron`                                                                                                 |
| Package manager | pnpm workspaces                                                                                             |

---

## Project Structure

```
batchNews/
├── CLAUDE.md          # AI agent context — business rules, architecture, flow lifecycle
├── frontend/          # Next.js application (UI only)
│   ├── AGENTS.md      # Rules for AI agents working on the frontend
│   └── CHANGELOG.md   # Frontend change history
├── backend/           # Fastify API server (all business logic)
│   ├── AGENTS.md      # Rules for AI agents working on the backend
│   └── CHANGELOG.md   # Backend change history
├── supabase/
│   └── migrations/    # SQL migrations 001–013 (schema + RLS policies)
└── docs/
    ├── ARCHITECTURE.md # Full architecture reference
    └── TASKS.md        # Development epics and tasks
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- A [Supabase](https://supabase.com/) project (free tier works)
- A [X Developer account](https://developer.twitter.com/) with OAuth 2.0 app
- An AI provider API key: [OpenAI](https://platform.openai.com/), [Anthropic](https://console.anthropic.com/), or [DeepSeek](https://platform.deepseek.com/)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/batchNews.git
cd batchNews
pnpm install
```

### 2. Configure environment variables

**Backend** — copy and fill in all values:

```bash
cp backend/.env.example backend/.env
```

```bash
# backend/.env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>

# Generate with: node -e "require('crypto').randomBytes(32).toString('hex')"
ENCRYPTION_KEY=<64_hex_chars>

X_CLIENT_ID=<oauth2_client_id>
X_CLIENT_SECRET=<oauth2_client_secret>
X_CALLBACK_URL=http://localhost:3001/api/v1/x/oauth/callback

# AI Provider: 'openai' | 'anthropic' | 'deepseek'
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com   # only needed for DeepSeek

CRON_SECRET=<random_string>
```

**Frontend** — copy and fill in the public keys only:

```bash
cp frontend/.env.local.example frontend/.env.local
```

```bash
# frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Set up the database

```bash
# Link to your Supabase project
supabase link --project-ref <project-ref>

# Apply all migrations (001–013)
pnpm db:push
```

### 4. Generate TypeScript types

```bash
pnpm db:types
```

### 5. Start the development servers

```bash
# Start both frontend (port 3000) and backend (port 3001)
pnpm dev
```

Or start separately:

```bash
pnpm dev:frontend   # http://localhost:3000
pnpm dev:backend    # http://localhost:3001
```

---

## Available Scripts

| Script              | Description                             |
| ------------------- | --------------------------------------- |
| `pnpm dev`          | Start frontend and backend in parallel  |
| `pnpm dev:frontend` | Start only the Next.js frontend         |
| `pnpm dev:backend`  | Start only the Fastify backend          |
| `pnpm build`        | Build both workspaces for production    |
| `pnpm lint`         | Run ESLint on all workspaces            |
| `pnpm format`       | Run Prettier on all files               |
| `pnpm test`         | Run tests on all workspaces             |
| `pnpm db:push`      | Apply Supabase migrations               |
| `pnpm db:types`     | Regenerate TypeScript types from schema |

---

## API Documentation

The backend exposes a Swagger UI in development mode:

```
http://localhost:3001/docs
```

---

## Documentation

| File                                           | Purpose                                                           |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| [`CLAUDE.md`](CLAUDE.md)                       | **AI agent context** — business rules, flow lifecycle, data model |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, security model, conventions                  |
| [`docs/TASKS.md`](docs/TASKS.md)               | Development epics and task tracking                               |
| [`frontend/AGENTS.md`](frontend/AGENTS.md)     | Rules for AI agents working on the frontend                       |
| [`backend/AGENTS.md`](backend/AGENTS.md)       | Rules for AI agents working on the backend                        |

---

## AI Agent Guidelines

If you are an AI agent contributing to this codebase:

1. **Start here:** read [`CLAUDE.md`](CLAUDE.md) — business rules, flow lifecycle, data model
2. **Frontend:** read [`frontend/AGENTS.md`](frontend/AGENTS.md) before making any changes
3. **Backend:** read [`backend/AGENTS.md`](backend/AGENTS.md) before making any changes

All changes must be logged in the respective `CHANGELOG.md`.

---

## License

MIT
