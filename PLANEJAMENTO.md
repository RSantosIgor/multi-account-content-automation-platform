# Planejamento: batchNews — Sistema de Web Scraping e Postagem no X/Twitter

> Gerado em: 2026-02-19
> Stack: Next.js (frontend) · Fastify (backend) · Supabase · shadcn/ui · X API v2

---

## Índice

1. [Visão Geral](#1-visão-geral)
2. [Arquitetura](#2-arquitetura)
3. [Banco de Dados (Supabase)](#3-banco-de-dados-supabase)
4. [Módulos do Sistema](#4-módulos-do-sistema)
5. [Rotas Frontend (Next.js)](#5-rotas-frontend-nextjs)
6. [API Backend (Fastify)](#6-api-backend-fastify)
7. [Fluxo de Dados](#7-fluxo-de-dados)
8. [Controle de Acesso (RLS + Roles)](#8-controle-de-acesso-rls--roles)
9. [Integrações Externas](#9-integrações-externas)
10. [Estratégia de Scraping (RSS + HTML)](#10-estratégia-de-scraping-rss--html)
11. [Segurança dos Tokens OAuth](#11-segurança-dos-tokens-oauth)
12. [Componentes de UI (shadcn)](#12-componentes-de-ui-shadcn)
13. [Estrutura de Pastas](#13-estrutura-de-pastas)
14. [Alertas e Pontos de Atenção](#14-alertas-e-pontos-de-atenção)
15. [Roadmap de Implementação](#15-roadmap-de-implementação)
16. [Dependências NPM](#16-dependências-npm)

---

## 1. Visão Geral

O **batchNews** é uma plataforma onde cada usuário pode:

- Cadastrar uma ou mais **contas do X (Twitter)**
- Associar **sites de notícias** a cada conta para coleta periódica (RSS prioritário, scraping como fallback)
- Receber **sugestões de posts geradas por IA** a partir das notícias coletadas
- **Aprovar e publicar** posts diretamente no X
- Acompanhar tudo em uma **timeline unificada** por conta do X

---

## 2. Arquitetura

```
┌──────────────────────────────────────┐
│           FRONTEND (Next.js)         │
│   UI · Auth Client · Supabase SSR    │
└───────────────────┬──────────────────┘
                    │ HTTP (REST)
┌───────────────────▼──────────────────┐
│           BACKEND (Fastify)          │
│  /api/accounts  /api/sites           │
│  /api/scrape    /api/ai              │
│  /api/posts     /api/x/oauth         │
└────┬──────────────┬───────────────┬──┘
     │              │               │
┌────▼────┐  ┌──────▼──────┐  ┌────▼────────┐
│Supabase │  │   X API v2  │  │ AI Provider │
│ (DB +   │  │  (postagem) │  │(OpenAI/     │
│  Auth)  │  └─────────────┘  │ Anthropic)  │
└────┬────┘                   └─────────────┘
     │
┌────▼──────────────────┐
│  Jobs Agendados       │
│  node-cron            │  ← roda dentro do próprio Fastify
│  (no backend)         │
└───────────────────────┘
```

### Decisões de Arquitetura

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Frontend | Next.js 14+ (App Router) | SSR, UI rica, integração Supabase |
| Backend | Fastify (Node.js) | Rápido, TypeScript nativo, Swagger auto, plugins maduros |
| Auth | Supabase Auth | JWT nativo, RLS automático, sessão por cookie |
| DB | Supabase (PostgreSQL) | RLS por usuário, realtime, migrations via CLI |
| UI | shadcn/ui + Tailwind | Componentes acessíveis e customizáveis |
| Scraping | RSS-first → Cheerio fallback | RSS é legalmente seguro; Cheerio para sites sem RSS |
| Jobs | node-cron (no backend) | Roda dentro do processo Fastify, sem infra extra |
| AI | OpenAI ou Anthropic | Configurável via env var |
| Posting | X API v2 (OAuth 2.0 PKCE) | Único método oficial |

---

## 3. Banco de Dados (Supabase)

### 3.1 Diagrama de Entidades

```
users (Supabase Auth)
  └──< user_profiles
  └──< user_roles
  └──< x_accounts
          └──< news_sites
          │        └──< scraped_articles
          │                  └──< ai_suggestions
          │                            └── posts (status: posted)
          └──< posts (histórico geral de postagens)
                    └── ai_suggestion_id (FK, nullable)
```

### 3.2 Tabelas

---

#### `user_profiles`
Extensão da tabela `auth.users` do Supabase.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | Mesmo ID do `auth.users` |
| display_name | text | Nome de exibição |
| avatar_url | text | URL do avatar |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

#### `user_roles`
Controle de acesso por papel.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | |
| role | text | `'admin'` \| `'member'` |
| created_at | timestamptz | |

---

#### `x_accounts`
Contas do X registradas no sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| user_id | uuid FK → auth.users | Dono da conta |
| username | text | Handle do X (ex: `@minhaempresa`) |
| display_name | text | Nome de exibição |
| profile_image_url | text | Foto do perfil (cache) |
| oauth_access_token_enc | text | Token de acesso (criptografado — ver seção 11) |
| oauth_refresh_token_enc | text | Refresh token (criptografado) |
| oauth_token_expires_at | timestamptz | Expiração do access token |
| x_user_id | text | ID do usuário na API do X |
| is_active | boolean | Conta ativa? |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

#### `news_sites`
Sites de notícias cadastrados **manualmente** por conta do X.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| x_account_id | uuid FK → x_accounts | |
| name | text | Nome amigável (ex: "G1 Tecnologia") |
| url | text | URL base do site |
| feed_url | text (nullable) | URL do feed RSS/Atom (preferencial) |
| scraping_config | jsonb (nullable) | Configuração HTML fallback (seletores CSS) |
| source_type | text | `'rss'` \| `'html'` \| `'auto'` (tenta RSS, cai para HTML) |
| scraping_interval_hours | integer | Frequência (padrão: 4h) |
| last_scraped_at | timestamptz | Última execução bem-sucedida |
| is_active | boolean | Habilitar/desabilitar coleta |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Exemplo de `scraping_config` (usado somente no fallback HTML):**
```json
{
  "article_selector": "article.post",
  "title_selector": "h1.title",
  "summary_selector": "p.lead",
  "link_selector": "a.read-more",
  "max_articles_per_run": 10
}
```

---

#### `scraped_articles`
Artigos coletados (via RSS ou HTML scraping).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| news_site_id | uuid FK → news_sites | |
| source_type | text | `'rss'` \| `'html'` — qual método coletou |
| url | text | URL do artigo |
| title | text | Título |
| summary | text | Resumo/lead (máx ~500 chars) |
| published_at | timestamptz | Data de publicação original |
| scraped_at | timestamptz | Data da coleta |
| is_processed | boolean | Já foi enviado para IA? |

> **Constraint:** `UNIQUE(news_site_id, url)` — evita duplicatas.
> **Nota:** salvar apenas título + resumo, não o artigo completo, para economizar espaço e tokens de IA.

---

#### `ai_suggestions`
Sugestões de posts geradas pela IA.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| scraped_article_id | uuid FK → scraped_articles | |
| x_account_id | uuid FK → x_accounts | |
| suggestion_text | text | Texto sugerido (≤ 280 chars) |
| hashtags | text[] | Hashtags sugeridas |
| status | text | `'pending'` \| `'approved'` \| `'rejected'` \| `'posted'` |
| ai_model_used | text | Modelo utilizado (ex: `gpt-4o-mini`) |
| created_at | timestamptz | |
| reviewed_at | timestamptz | Quando o usuário aprovou/rejeitou |
| reviewed_by | uuid FK → auth.users | |

---

#### `posts`
Histórico de posts publicados no X.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| x_account_id | uuid FK → x_accounts | |
| ai_suggestion_id | uuid FK → ai_suggestions (nullable) | Sugestão usada (se houver) |
| content | text | Conteúdo final postado |
| x_post_id | text | ID do tweet no X |
| x_post_url | text | URL pública do post |
| posted_at | timestamptz | |
| status | text | `'published'` \| `'failed'` |
| error_message | text | Detalhe do erro (se falhou) |
| metrics | jsonb | Likes, retweets (populado via polling) |

---

#### `scraping_runs`
Log de cada execução do processo de coleta.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid PK | |
| news_site_id | uuid FK → news_sites | |
| started_at | timestamptz | |
| finished_at | timestamptz | |
| source_type_used | text | `'rss'` \| `'html'` — qual foi usado na execução |
| status | text | `'running'` \| `'success'` \| `'failed'` |
| articles_found | integer | Novos artigos coletados |
| error_message | text | Erro se falhou |

---

## 4. Módulos do Sistema

### 4.1 Auth (Autenticação)
- **Provider**: Supabase Auth (email/senha)
- Login, cadastro, recuperação de senha
- Proteção de rotas: middleware Next.js para o frontend + JWT Bearer no Fastify
- Sessão gerenciada com cookies HTTPOnly via `@supabase/ssr`

### 4.2 Controle de Acesso
- Roles: `admin` e `member`
- **RLS no Supabase** garante isolamento por `user_id` — mesmo se a API for bypassada, o banco bloqueia
- O Fastify verifica o JWT da Supabase em cada request e injeta o `user_id` no contexto
- Admins têm visão global; members só veem seus próprios dados

### 4.3 Gerenciamento de Contas do X
- Fluxo **OAuth 2.0 com PKCE** — iniciado pelo backend Fastify
- Tokens armazenados criptografados (AES-256-GCM — ver seção 11)
- Refresh automático de tokens expirados antes de cada postagem
- Revogar acesso e desconectar conta

### 4.4 Gerenciamento de Sites de Notícias
- CRUD completo de sites por conta do X
- Ao cadastrar: sistema tenta descobrir automaticamente o feed RSS (`<link rel="alternate" type="application/rss+xml">`)
- Se não encontrar RSS: exibe formulário de configuração de seletores HTML
- Botão "Testar agora" para visualizar preview do que seria coletado

### 4.5 Coleta de Notícias (RSS + HTML)
- Ver seção 10 para detalhes da estratégia
- Executado no backend Fastify (Node.js — sem restrições de binários)
- Agendado via `node-cron` rodando dentro do próprio processo Fastify

### 4.6 Processamento por IA
- Disparado automaticamente após cada coleta bem-sucedida
- Prompt: recebe título + resumo do artigo, retorna sugestão de post ≤ 280 chars + hashtags
- Provider configurável via `AI_PROVIDER=openai|anthropic`
- Registra modelo usado para auditoria

### 4.7 Timeline
- Exibe em ordem cronológica reversa (por conta do X):
  - Sugestões pendentes de aprovação
  - Sugestões aprovadas/rejeitadas
  - Posts publicados
- Filtros: por status, por site de origem, por período
- Ações diretas na timeline: aprovar, editar texto, publicar, rejeitar

### 4.8 Publicação no X
- Backend chama `POST /2/tweets` via X API v2
- Preview antes de publicar
- Custo por requisição (X API pay-per-use — ver seção 14)
- Resposta salva em `posts` com `x_post_id`

---

## 5. Rotas Frontend (Next.js)

O Next.js é usado **apenas para UI e autenticação client-side**. Toda lógica de negócio vai para o Fastify.

```
app/
├── (auth)/
│   ├── login/page.tsx             → Página de login
│   ├── register/page.tsx          → Cadastro
│   └── callback/page.tsx          → Callback OAuth Supabase
│
└── (app)/
    ├── layout.tsx                 → Layout autenticado (sidebar, header)
    ├── dashboard/
    │   └── page.tsx               → Lista de contas do X
    │
    ├── accounts/
    │   ├── new/page.tsx           → Iniciar conexão OAuth com X
    │   └── [accountId]/
    │       ├── page.tsx           → Dashboard da conta
    │       ├── sites/
    │       │   ├── page.tsx       → Lista de sites
    │       │   ├── new/page.tsx   → Adicionar site
    │       │   └── [siteId]/page.tsx → Editar site
    │       ├── timeline/
    │       │   └── page.tsx       → Timeline (sugestões + posts)
    │       └── settings/
    │           └── page.tsx       → Config da conta do X
    │
    └── admin/
        ├── page.tsx               → Painel admin
        └── users/page.tsx         → Gerenciar usuários
```

---

## 6. API Backend (Fastify)

```
GET    /health

# Auth / X OAuth
GET    /api/x/oauth/start          → Gera URL OAuth PKCE
GET    /api/x/oauth/callback       → Troca code por tokens, salva no banco

# Contas do X
GET    /api/accounts               → Lista contas do usuário
POST   /api/accounts               → Registra nova conta (pós-OAuth)
DELETE /api/accounts/:id           → Remove conta
GET    /api/accounts/:id/stats     → Estatísticas da conta

# Sites de notícias
GET    /api/accounts/:id/sites     → Lista sites da conta
POST   /api/accounts/:id/sites     → Cria novo site
PUT    /api/accounts/:id/sites/:siteId   → Atualiza site
DELETE /api/accounts/:id/sites/:siteId  → Remove site
POST   /api/accounts/:id/sites/:siteId/test  → Testa scraping (preview)

# Scraping
POST   /api/scrape/run             → Executa scraping de todos os sites ativos
POST   /api/scrape/run/:siteId     → Executa scraping de um site específico
GET    /api/accounts/:id/sites/:siteId/runs  → Histórico de execuções

# IA
POST   /api/ai/suggest/:articleId  → Gera sugestão para um artigo
PATCH  /api/suggestions/:id/status → Aprova / rejeita sugestão

# Timeline
GET    /api/accounts/:id/timeline  → Sugestões + posts ordenados por data

# Posts
POST   /api/accounts/:id/posts     → Publica no X (usa suggestion_id ou texto livre)
GET    /api/accounts/:id/posts     → Histórico de posts

# Admin
GET    /api/admin/users            → Lista usuários (role: admin)
PATCH  /api/admin/users/:id/role   → Altera role do usuário
```

> Toda rota (exceto `/health`) exige header `Authorization: Bearer <supabase_jwt>`.

---

## 7. Fluxo de Dados

### Fluxo Principal (coleta → publicação)

```
1. [pg_cron] Dispara a cada N horas
        ↓
2. [Edge Function] POST /api/scrape/run → Fastify
        ↓
3. [Fastify] Para cada news_site ativo:
   - Se source_type = 'rss': faz fetch do feed RSS (rss-parser)
   - Se source_type = 'html': fetch + Cheerio
   - Se source_type = 'auto': tenta RSS, cai para HTML se falhar
        ↓
4. Novos artigos salvos em scraped_articles (deduplicação por URL)
        ↓
5. [Fastify] Para cada artigo novo (is_processed = false):
   - Chama AI Provider com título + resumo
   - Salva em ai_suggestions (status: 'pending')
   - Marca is_processed = true
        ↓
6. [Usuário] Acessa a Timeline → vê sugestões pendentes
        ↓
7. Usuário aprova/edita → clica "Publicar"
        ↓
8. [Fastify] POST /2/tweets via X API v2
        ↓
9. Salva em posts com x_post_id
   Atualiza ai_suggestion.status = 'posted'
        ↓
10. Timeline exibe post publicado
```

### Fluxo OAuth X

```
1. Usuário clica "Conectar conta do X"
2. Frontend → GET /api/x/oauth/start
3. Fastify gera code_verifier + code_challenge (PKCE)
   → salva code_verifier em sessão/cookie temporário
   → redireciona para X OAuth URL
4. X redireciona para /api/x/oauth/callback?code=...
5. Fastify troca code por tokens
   → criptografa tokens (AES-256-GCM)
   → salva em x_accounts
6. Redireciona para o frontend com conta ativa
```

---

## 8. Controle de Acesso (RLS + Roles)

### Políticas RLS por tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| x_accounts | próprio user_id | próprio user_id | próprio user_id | próprio user_id |
| news_sites | via x_account | via x_account | via x_account | via x_account |
| scraped_articles | via news_site → x_account | sistema | sistema | admin |
| ai_suggestions | via x_account | sistema | próprio user | admin |
| posts | via x_account | sistema | — | admin |
| user_roles | admin | admin | admin | admin |

### Exemplo de política RLS

```sql
-- x_accounts: usuário só vê o que é dele
CREATE POLICY "users see own x_accounts"
ON x_accounts FOR SELECT
USING (auth.uid() = user_id);

-- news_sites: acesso via join com x_accounts
CREATE POLICY "users see own news_sites"
ON news_sites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM x_accounts
    WHERE x_accounts.id = news_sites.x_account_id
      AND x_accounts.user_id = auth.uid()
  )
);
```

---

## 9. Integrações Externas

### 9.1 X (Twitter) API v2

- **Auth**: OAuth 2.0 PKCE (user context — necessário para postar em nome do usuário)
- **Scopes**: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
- **Postagem**: `POST /2/tweets`
- **Precificação**: pay-per-use por requisição (ver seção 14)
- **SDK**: `twitter-api-v2` (npm)

### 9.2 AI Provider

- **OpenAI**: `openai` SDK — modelo sugerido: `gpt-4o-mini` (barato, rápido)
- **Anthropic**: `@anthropic-ai/sdk` — modelo sugerido: `claude-haiku-4-5` (baixo custo)
- Configurado via `AI_PROVIDER=openai|anthropic` + chave de API correspondente

### 9.3 Coleta de Notícias

- **RSS/Atom**: `rss-parser` (npm) — confiável, sem risco de bloqueio
- **HTML scraping**: `cheerio` (npm) — somente quando não há RSS
- Sem Playwright no backend Fastify por padrão (explicação na seção 14)

### 9.4 Jobs Agendados (node-cron)

O agendamento roda **dentro do processo Fastify** usando `node-cron`. Não depende de infraestrutura externa.

```typescript
// backend/src/jobs/scraping.job.ts
import cron from 'node-cron';
import { ScraperRunner } from '../services/scraper/runner';

export function registerScrapingJob() {
  // Executa a cada 4 horas
  cron.schedule('0 */4 * * *', async () => {
    await ScraperRunner.runAll();
  });
}
```

Registrado no startup do servidor:
```typescript
// backend/src/server.ts
import { registerScrapingJob } from './jobs/scraping.job';
registerScrapingJob();
```

---

## 10. Estratégia de Scraping (RSS + HTML)

### Prioridade de coleta

```
news_site.source_type
    │
    ├── 'rss'   → usa feed_url diretamente
    ├── 'html'  → usa scraping_config (seletores CSS)
    └── 'auto'  → tenta RSS → se falhar → tenta HTML
                  (detecta feed_url automaticamente no HTML do site)
```

### Detecção automática de RSS

Ao cadastrar um site, o backend faz fetch da URL e procura por:
```html
<link rel="alternate" type="application/rss+xml" href="...">
<link rel="alternate" type="application/atom+xml" href="...">
```
Se encontrar, salva em `feed_url` e define `source_type = 'rss'`.

### Por que RSS primeiro?

| Critério | RSS | HTML Scraping |
|----------|-----|---------------|
| Legalidade | Geralmente permitido (feed é público) | Pode violar ToS |
| Confiabilidade | Alta (formato estruturado) | Frágil (muda com redesign) |
| Performance | Baixa (parse simples) | Mais custoso |
| Manutenção | Mínima | Exige atualizar seletores |

### Scraping HTML (fallback)

- Usa `cheerio` para parsear HTML estático
- **Sem headless browser** por padrão (Playwright é pesado)
- Se o site usa JavaScript para renderizar conteúdo: recomendar serviço externo como **ScrapingBee** ou **Browserless.io** como opcional
- Respeita `robots.txt` antes de scraper
- Adiciona delay entre requisições (mínimo 2s)
- User-Agent realista no header

---

## 11. Segurança dos Tokens OAuth

### Estratégia: Criptografia AES-256-GCM no nível da aplicação

Os tokens do X são criptografados **antes** de entrar no banco. Mesmo que o banco de dados seja comprometido, os tokens são inúteis sem a chave.

```typescript
// backend/src/lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes = 64 hex chars

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12); // 96 bits para GCM
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  // Formato: iv(12B) + authTag(16B) + ciphertext — tudo em hex
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

export function decrypt(ciphertext: string): string {
  const data = Buffer.from(ciphertext, 'hex');
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const encrypted = data.subarray(28);

  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]).toString('utf8');
}
```

### Geração da chave

```bash
# Gerar ENCRYPTION_KEY segura (uma vez, guardar no .env e no servidor)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Checklist de segurança dos tokens

- [ ] `ENCRYPTION_KEY` somente em variáveis de ambiente (nunca no código ou banco)
- [ ] Tokens nunca aparecem em logs
- [ ] Tokens nunca são retornados pela API (apenas usados internamente no backend)
- [ ] Refresh automático antes de expirar (`oauth_token_expires_at`)
- [ ] Ao desconectar conta: revogar token na API do X + deletar do banco

---

## 12. Componentes de UI (shadcn)

| Componente | Onde usar |
|------------|-----------|
| `Card` | Cards de conta do X, cards de artigo/sugestão |
| `Table` | Lista de sites, histórico de posts |
| `Dialog` | Criar/editar site, confirmar publicação |
| `Form` + `Input` | Login, cadastro, configuração de site |
| `Badge` | Status da sugestão (`pending`, `approved`, `posted`) |
| `Tabs` | Dashboard: Timeline / Sites / Settings |
| `Button` | Ações primárias |
| `Avatar` | Foto de perfil da conta do X |
| `Skeleton` | Loading states |
| `Sonner` (Toast) | Feedback de publicação, erros |
| `DropdownMenu` | Ações por item da timeline |
| `Select` | Filtros da timeline |
| `Switch` | Ativar/desativar site |
| `Separator` | Divisores visuais |
| `Textarea` | Edição da sugestão antes de publicar |

> Timeline é um componente **custom** composto com primitivos shadcn (não há `Timeline` nativo).

---

## 13. Estrutura de Pastas

```
batchNews/
│
├── frontend/                          ← Next.js (UI)
│   ├── app/
│   │   ├── (auth)/
│   │   └── (app)/
│   ├── components/
│   │   ├── ui/                        ← shadcn/ui (gerados via CLI)
│   │   ├── layout/                    ← Sidebar, Header
│   │   ├── accounts/                  ← AccountCard, ConnectXButton
│   │   ├── sites/                     ← SiteForm, SiteTable
│   │   └── timeline/                  ← TimelineItem, SuggestionCard, PostCard
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts              ← cliente browser
│   │       └── server.ts              ← cliente SSR
│   ├── middleware.ts                   ← proteção de rotas
│   └── package.json
│
├── backend/                           ← Fastify (API + lógica)
│   ├── src/
│   │   ├── app.ts                     ← instância Fastify + plugins
│   │   ├── server.ts                  ← entry point
│   │   ├── routes/
│   │   │   ├── accounts.ts
│   │   │   ├── sites.ts
│   │   │   ├── scrape.ts
│   │   │   ├── ai.ts
│   │   │   ├── posts.ts
│   │   │   ├── timeline.ts
│   │   │   └── x-oauth.ts
│   │   ├── services/
│   │   │   ├── scraper/
│   │   │   │   ├── rss.ts             ← coleta via RSS/Atom
│   │   │   │   ├── html.ts            ← coleta via Cheerio
│   │   │   │   └── runner.ts          ← orquestrador
│   │   │   ├── ai/
│   │   │   │   ├── suggest.ts         ← geração de sugestão
│   │   │   │   └── prompts.ts         ← templates de prompt
│   │   │   └── x-api/
│   │   │       ├── client.ts          ← wrapper twitter-api-v2
│   │   │       └── oauth.ts           ← PKCE helpers
│   │   ├── lib/
│   │   │   ├── supabase.ts            ← cliente Supabase (service role)
│   │   │   ├── crypto.ts              ← encrypt/decrypt tokens
│   │   │   └── auth.ts                ← verificação JWT middleware
│   │   └── types/
│   │       └── database.ts            ← tipos gerados pelo Supabase CLI
│   └── package.json
│
└── supabase/                          ← config Supabase (apenas auth + DB)
    └── migrations/                    ← SQL migrations
```

---

## 14. Alertas e Pontos de Atenção

### ATENÇÃO — X API: Custo por Uso

> ℹ️ A X API v2 cobra **por requisição** (pay-per-use).
> Não há uma taxa fixa mensal obrigatória — o custo varia conforme o volume de posts.
> O plano Free tem limites muito baixos de escrita; para uso em produção recomenda-se verificar os limites do plano Basic/Pro.
> **Monitorar** o consumo de requisições para evitar surpresas.

---

### NOTA — Supabase: apenas Auth e Banco de Dados

> ℹ️ O Supabase é usado exclusivamente para **autenticação** e **banco de dados PostgreSQL**.
> Não utilizamos Supabase Edge Functions, pg_cron, Storage ou Realtime.
> Todo processamento (scraping, IA, OAuth) roda no **backend Fastify**.
>
> Agendamento de jobs usa `node-cron` dentro do processo Fastify.
> Se no futuro for necessário scraping de sites com JavaScript dinâmico:
> - Opção A: Serviço externo (**ScrapingBee**, **Browserless.io**)
> - Opção B: Adicionar Playwright como serviço separado

---

### ATENÇÃO — Legalidade do Web Scraping

> ℹ️ RSS é o método preferencial exatamente por ser legalmente seguro (feed público).
> Para scraping HTML, verificar `robots.txt` e Termos de Serviço do site.
> Implementar delays entre requisições e User-Agent realista.

---

### NOTA — PKCE para X OAuth

> ℹ️ O X só suporta **OAuth 2.0 com PKCE** para apps públicos (sem client secret exposto).
> O `code_verifier` deve ser gerado no backend e armazenado temporariamente em sessão/Redis/Supabase durante o fluxo de callback.
> Não gerar o `code_verifier` no frontend (expõe o fluxo).

---

## 15. Roadmap de Implementação

### Fase 1 — Fundação (semana 1-2)
- [ ] Setup monorepo (`frontend/` + `backend/`)
- [ ] Configurar Supabase (projeto, CLI, tipos gerados)
- [ ] Criar migrations SQL (todas as tabelas + RLS)
- [ ] Setup Next.js + shadcn/ui
- [ ] Setup Fastify com JWT middleware (verifica token Supabase)
- [ ] Autenticação (login/registro via Supabase Auth)
- [ ] Proteção de rotas frontend + backend
- [ ] Layout base (sidebar, header)

### Fase 2 — Contas do X (semana 2-3)
- [ ] Fluxo OAuth 2.0 PKCE com X
- [ ] Criptografia de tokens (AES-256-GCM)
- [ ] CRUD de contas do X
- [ ] Dashboard listando contas

### Fase 3 — Sites e Coleta (semana 3-4)
- [ ] CRUD de sites de notícias
- [ ] Detecção automática de feed RSS
- [ ] Scraper RSS (`rss-parser`)
- [ ] Scraper HTML fallback (`cheerio`)
- [ ] Botão "Testar agora" (preview)
- [ ] Cron job com `node-cron` dentro do Fastify
- [ ] Log de execuções (`scraping_runs`)

### Fase 4 — IA e Sugestões (semana 4-5)
- [ ] Integração OpenAI ou Anthropic
- [ ] Geração automática pós-coleta
- [ ] Interface para aprovar/editar/rejeitar sugestões

### Fase 5 — Timeline e Publicação (semana 5-6)
- [ ] Timeline unificada por conta do X
- [ ] Publicação no X via API v2
- [ ] Histórico de posts com status
- [ ] Filtros e busca na timeline

### Fase 6 — Admin e Polimento (semana 6-7)
- [ ] Painel admin (gestão de usuários e roles)
- [ ] Notificações de erro (scraping falhou, post falhou)
- [ ] Testes de integração
- [ ] Ajustes de UX

---

## 16. Dependências NPM

### Frontend (`frontend/package.json`)
```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "zod": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "date-fns": "latest",
    "lucide-react": "latest"
  }
}
```

### Backend (`backend/package.json`)
```json
{
  "dependencies": {
    "fastify": "^4.x",
    "@fastify/cors": "latest",
    "@fastify/jwt": "latest",
    "@fastify/swagger": "latest",
    "@fastify/swagger-ui": "latest",
    "@supabase/supabase-js": "latest",
    "twitter-api-v2": "latest",
    "node-cron": "latest",
    "rss-parser": "latest",
    "cheerio": "latest",
    "openai": "latest",
    "@anthropic-ai/sdk": "latest",
    "zod": "latest",
    "dotenv": "latest"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "latest",
    "tsx": "latest"
  }
}
```

---

*Documento de planejamento — revisar com o time antes de iniciar a implementação.*
