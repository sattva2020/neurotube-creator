# AGENTS.md

> Project map for AI agents. Keep this file up-to-date as the project evolves.

## Project Overview
NeuroTube Creator — AI-powered YouTube idea generator and script outliner for psychology/neuroscience and ambient/meditation channels. Fullstack app: Vue 3 + Quasar frontend, Hono backend, PostgreSQL database. Deployed on Dokploy.

## Tech Stack

### Frontend
- **Framework:** Vue 3 (Composition API) + Quasar Framework
- **Build Tool:** Vite
- **State:** Pinia
- **Routing:** Vue Router (Quasar)

### Backend
- **Framework:** Hono (TypeScript)
- **AI Provider:** Google Gemini API (`@google/genai`)
- **Validation:** Zod

### Database
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM

### Infrastructure
- **Deployment:** Dokploy (Docker)
- **CI/CD:** GitHub Actions

## Architecture
**Pattern:** Clean Architecture (backend) + Quasar conventions (frontend)

See `.ai-factory/ARCHITECTURE.md` for full details.

## Project Structure (current)
```
neurotube-creator/
├── client/                          # Frontend — Vue 3 + Quasar
│   ├── src/                         # (to be created — new Vue frontend)
│   ├── src-legacy/                  # Legacy React SPA (reference for migration)
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── services/geminiService.ts
│   │   └── utils/
│   ├── package.json                 # @neurotube/client
│   └── tsconfig.json
│
├── server/                          # Backend — Hono + Clean Architecture
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/            # VideoIdea, VideoPlan, ChannelBranding, Niche
│   │   │   └── ports/               # IAiService, IIdeaRepository, IPlanRepository
│   │   ├── application/
│   │   │   └── use-cases/           # 12 use cases (GenerateIdeas, GeneratePlan, etc.)
│   │   │       └── index.ts         # Barrel exports for all use cases
│   │   ├── infrastructure/
│   │   │   ├── ai/
│   │   │   │   └── GeminiAiService.ts  # Implements IAiService (12 methods)
│   │   │   ├── db/
│   │   │   │   ├── schema.ts          # Drizzle ORM schema (ideas + plans tables)
│   │   │   │   ├── client.ts          # DB connection factory (postgres.js + drizzle)
│   │   │   │   ├── IdeaRepository.ts  # Implements IIdeaRepository
│   │   │   │   └── PlanRepository.ts  # Implements IPlanRepository
│   │   │   ├── config/env.ts        # Zod-validated environment config
│   │   │   └── logger.ts            # Structured logger (LOG_LEVEL)
│   │   ├── presentation/
│   │   │   ├── routes/
│   │   │   │   ├── health.ts        # GET /api/health
│   │   │   │   ├── ideas.ts         # POST /generate, GET /
│   │   │   │   ├── plans.ts         # POST /generate, GET /
│   │   │   │   ├── thumbnails.ts    # POST /generate
│   │   │   │   ├── titles.ts        # POST /generate
│   │   │   │   ├── descriptions.ts  # POST /generate
│   │   │   │   ├── branding.ts      # POST /generate
│   │   │   │   ├── analysis.ts      # POST /niche
│   │   │   │   ├── notebooklm.ts    # POST /generate
│   │   │   │   ├── shorts.ts        # POST /generate
│   │   │   │   ├── monetization.ts  # POST /generate
│   │   │   │   ├── roadmap.ts       # POST /generate
│   │   │   │   └── suno.ts          # POST /generate
│   │   │   ├── middleware/
│   │   │   │   ├── errorHandler.ts  # Global error handler (Zod + generic)
│   │   │   │   ├── requestLogger.ts # HTTP request/response logger
│   │   │   │   └── notFound.ts      # 404 JSON handler
│   │   │   ├── schemas.ts           # Shared Zod validation schemas
│   │   │   └── app.ts              # Hono composition root (DI wiring)
│   │   └── index.ts                 # Server entry point
│   ├── drizzle/                     # Generated SQL migrations
│   ├── drizzle.config.ts            # Drizzle Kit config
│   ├── package.json                 # @neurotube/server
│   └── tsconfig.json
│
├── shared/                          # Shared TypeScript types
│   ├── types/
│   │   ├── index.ts                 # Barrel exports
│   │   ├── idea.ts                  # VideoIdea, Niche
│   │   └── api.ts                   # ApiResponse, ApiError
│   ├── package.json                 # @neurotube/shared
│   └── tsconfig.json
│
├── tsconfig.json                    # Root — project references
├── tsconfig.base.json               # Shared compiler options
├── Makefile                         # Build automation (monorepo)
├── .github/workflows/ci.yml        # CI pipeline
└── package.json                     # Root workspace (npm workspaces)
```

## Key Entry Points (legacy React — in client/src-legacy/)
| File | Purpose |
|------|---------|
| `client/src-legacy/App.tsx` | Main React component (reference for Vue migration) |
| `client/src-legacy/services/geminiService.ts` | All AI API calls — 12 functions (to move to server/) |

## Key Entry Points (target — fullstack)
| File | Purpose |
|------|---------|
| `client/src/pages/IndexPage.vue` | Home page — search, idea list |
| `client/src/pages/PlanPage.vue` | Video plan viewer with AI tools |
| `server/src/presentation/app.ts` | Hono app composition root (DI wiring) |
| `server/src/presentation/schemas.ts` | Shared Zod validation schemas |
| `server/src/domain/ports/IAiService.ts` | AI service interface |
| `server/src/infrastructure/ai/GeminiAiService.ts` | Gemini API implementation |
| `server/src/application/use-cases/index.ts` | All 12 use cases (barrel exports) |
| `server/src/infrastructure/db/schema.ts` | Drizzle ORM schema (ideas + plans tables) |
| `server/src/infrastructure/db/client.ts` | DB connection factory (postgres.js + drizzle) |
| `server/drizzle.config.ts` | Drizzle Kit migration config |
| `docker-compose.yml` | Local dev: PostgreSQL 16 |

## API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/ideas/generate` | Generate 5 video ideas |
| GET | `/api/ideas` | List saved ideas |
| POST | `/api/plans/generate` | Generate full video plan |
| GET | `/api/plans` | List saved plans |
| POST | `/api/thumbnails/generate` | Generate thumbnail image |
| POST | `/api/titles/generate` | Generate alternative titles |
| POST | `/api/descriptions/generate` | Generate YouTube description |
| POST | `/api/branding/generate` | Generate channel branding |
| POST | `/api/analysis/niche` | Analyze niche (web grounded) |
| POST | `/api/notebooklm/generate` | Generate NotebookLM source doc |
| POST | `/api/shorts/generate` | Generate Shorts spinoffs |
| POST | `/api/monetization/generate` | Generate monetization copy |
| POST | `/api/roadmap/generate` | Generate 30-day content roadmap |
| POST | `/api/suno/generate` | Generate Suno.ai music prompt |

## Key Patterns
- **Clean Architecture** — domain defines interfaces, infrastructure implements them
- **Dependency Inversion** — use cases don't know about Gemini SDK or PostgreSQL
- **Thin client** — all business logic (prompts, validation) lives on server
- **Dual niche** — `Niche` type ('psychology' | 'ambient') drives different prompts and UI
- **Bilingual** — UI in Russian, AI-generated content in English (Tier-1)

## Documentation
| Document | Path | Description |
|----------|------|-------------|
| README | `README.md` | Project landing page |
| Getting Started | `docs/getting-started.md` | Installation, setup, first steps |
| Architecture | `docs/architecture.md` | Project structure, data flow |
| Configuration | `docs/configuration.md` | Environment variables, config |
| AI Features | `docs/ai-features.md` | All 12 AI functions reference |

## AI Context Files
| File | Purpose |
|------|---------|
| `Makefile` | Build automation (dev, build, docker, deploy) |
| `.github/workflows/ci.yml` | GitHub Actions CI (lint + build) |
| `AGENTS.md` | This file — project structure map |
| `.ai-factory/DESCRIPTION.md` | Project specification and tech stack |
| `.ai-factory/ARCHITECTURE.md` | Architecture decisions and guidelines (Clean Architecture) |
| `.mcp.json` | MCP server configuration |
| `.ai-factory.json` | AI Factory skill registry |
