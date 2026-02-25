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
│   ├── src/                         # (to be created — domain, application, infrastructure, presentation)
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
| `server/src/domain/ports/IAiService.ts` | AI service interface |
| `server/src/infrastructure/ai/GeminiAiService.ts` | Gemini API implementation |

## API Routes
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ideas/generate` | Generate 5 video ideas |
| POST | `/api/plans/generate` | Generate full video plan |
| POST | `/api/thumbnails/generate` | Generate thumbnail image |
| POST | `/api/titles/generate` | Generate alternative titles |
| POST | `/api/descriptions/generate` | Generate YouTube description |
| POST | `/api/branding/generate` | Generate channel branding |
| POST | `/api/analysis/niche` | Analyze niche (web grounded) |
| GET | `/api/health` | Health check |

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
