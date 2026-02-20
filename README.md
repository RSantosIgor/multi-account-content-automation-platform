# batchNews

> Multi-account X (Twitter) content automation platform. Aggregates news via RSS and web scraping, generates AI-powered post suggestions, and publishes directly to X.

---

## Features

- **Multi-account management** — connect and manage multiple X (Twitter) accounts
- **News aggregation** — RSS-first collection with HTML scraping fallback; manually curate sites per account
- **AI-powered suggestions** — each article is processed by OpenAI or Anthropic to generate a ready-to-post suggestion (≤ 280 chars + hashtags)
- **Unified timeline** — review suggestions and post history per account in a single feed
- **One-click publishing** — edit, approve, and publish directly to X from the timeline
- **Access control** — user roles (`admin` / `member`) with row-level security enforced at the database layer
- **Scheduled scraping** — automatic periodic collection via `node-cron`, configurable per site

---

## Tech Stack

| Layer           | Technology                                                          |
| --------------- | ------------------------------------------------------------------- |
| Frontend        | Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui     |
| Backend         | Fastify · Node.js 20 · TypeScript                                   |
| Database        | Supabase (PostgreSQL + Auth)                                        |
| AI              | OpenAI (`gpt-4o-mini`) or Anthropic (`claude-haiku`) — configurable |
| X Integration   | X API v2 · OAuth 2.0 PKCE                                           |
| Scraping        | `rss-parser` (RSS/Atom) · `cheerio` (HTML fallback)                 |
| Scheduler       | `node-cron`                                                         |
| Package manager | pnpm workspaces                                                     |

---

## Project Structure

```
batchNews/
├── frontend/          # Next.js application (UI only)
│   ├── AGENTS.md      # Rules for AI agents working on the frontend
│   └── CHANGELOG.md   # Frontend change history
├── backend/           # Fastify API server (all business logic)
│   ├── AGENTS.md      # Rules for AI agents working on the backend
│   └── CHANGELOG.md   # Backend change history
├── supabase/
│   └── migrations/    # SQL migrations (schema + RLS policies)
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
- An [OpenAI](https://platform.openai.com/) or [Anthropic](https://console.anthropic.com/) API key

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

AI_PROVIDER=openai        # or 'anthropic'
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

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

# Apply all migrations
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

## Architecture

For a detailed breakdown of the system design, data flow, security model, and conventions, see:

**[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**

---

## Development Tasks

The project is organized into epics and tasks, each self-contained for AI-assisted development:

**[docs/TASKS.md](docs/TASKS.md)**

---

## AI Agent Guidelines

If you are an AI agent contributing to this codebase:

- **Frontend:** read [`frontend/AGENTS.md`](frontend/AGENTS.md) before making any changes
- **Backend:** read [`backend/AGENTS.md`](backend/AGENTS.md) before making any changes

All changes must be logged in the respective `CHANGELOG.md`.

---

## License

MIT
