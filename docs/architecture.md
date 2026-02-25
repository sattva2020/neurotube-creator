[← Getting Started](getting-started.md) · [Back to README](../README.md) · [Configuration →](configuration.md)

# Architecture

## Overview

NeuroTube Creator — fullstack-приложение с чётким разделением на фронтенд и бэкенд. Бэкенд использует Clean Architecture (строгая инверсия зависимостей), фронтенд следует конвенциям Quasar Framework. Монорепозиторий с npm workspaces.

```
┌─────────────────────┐      ┌──────────────────────┐      ┌──────────────┐
│   Vue 3 + Quasar    │─────→│    Hono API Server   │─────→│  PostgreSQL  │
│   (client/)         │ HTTP │    (server/)          │      │  (Dokploy)   │
│   SPA on port 9000  │←─────│    port 3000          │←─────│  port 5432   │
└─────────────────────┘      │         │              │      └──────────────┘
                             │         ▼              │
                             │   Google Gemini API    │
                             └──────────────────────┘
```

## Architecture Pattern: Clean Architecture (Backend) + Quasar Conventions (Frontend)

### Backend — Clean Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation (Hono)                     │  HTTP routes, middleware
│  ┌─────────────────────────────────────────────────┐    │
│  │           Infrastructure (Gemini, DB)            │    │  Implements ports
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │          Application (Use Cases)         │    │    │  Orchestrates domain
│  │  │  ┌─────────────────────────────────┐    │    │    │
│  │  │  │        Domain (Entities)         │    │    │    │  Pure business logic
│  │  │  │    (Ports, Value Objects)        │    │    │    │
│  │  │  └─────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Frontend — Quasar Conventions

```
pages/       → Route pages (IndexPage, PlanPage)
layouts/     → App shell (MainLayout)
components/  → Reusable UI (NicheToggle, IdeaCard)
composables/ → Business logic hooks (useGenerateIdeas, useGeneratePlan, useApi)
stores/      → Pinia state (ideas, plan, niche)
```

## Dependency Rules

### Backend (strict)
- `domain` → **nothing** (zero imports from other layers)
- `application` → `domain` only
- `infrastructure` → `domain` + `application` (implements ports)
- `presentation` → `application` (calls use cases)

### Frontend (Quasar conventions)
- `pages/` → `components/` + `composables/` + `stores/`
- `components/` → `composables/` + `stores/` + `types/`
- `composables/` → `stores/` + `types/`
- `stores/` do NOT import `components/`
- `components/` do NOT call API directly — through composables

### Cross-boundary
- `client/` → `shared/types/` (via npm workspace)
- `server/` → `shared/types/`
- `client/` NEVER imports from `server/` directly (HTTP API only)

## Project Structure

```
neurotube-creator/
├── client/                          # Frontend — Vue 3 + Quasar
│   ├── src/
│   │   ├── pages/
│   │   │   ├── IndexPage.vue        # Home — niche toggle, search, idea list
│   │   │   └── PlanPage.vue         # Video plan viewer (markdown rendering)
│   │   ├── layouts/
│   │   │   └── MainLayout.vue       # App shell — header, footer
│   │   ├── components/
│   │   │   ├── NicheToggle.vue      # Psychology/Ambient switcher
│   │   │   └── IdeaCard.vue         # Single video idea card
│   │   ├── composables/
│   │   │   ├── useGenerateIdeas.ts  # Idea generation → API + store
│   │   │   ├── useGeneratePlan.ts   # Plan generation → API + store
│   │   │   └── useApi.ts            # Base HTTP client (fetch wrapper)
│   │   ├── stores/
│   │   │   ├── ideas.ts             # Generated ideas state
│   │   │   ├── plan.ts              # Current plan state
│   │   │   └── niche.ts             # Active niche state
│   │   └── router/
│   │       └── routes.ts            # Vue Router routes
│   └── package.json
│
├── server/                          # Backend — Hono + Clean Architecture
│   ├── src/
│   │   ├── domain/                  # Pure business logic (zero deps)
│   │   │   ├── entities/            # VideoIdea, VideoPlan, Niche
│   │   │   └── ports/               # IAiService, IIdeaRepository, IPlanRepository
│   │   ├── application/             # Use Cases (depends on domain only)
│   │   │   ├── use-cases/           # 12 AI generation use cases
│   │   │   └── dto/                 # Input/output DTOs
│   │   ├── infrastructure/          # External implementations
│   │   │   ├── ai/                  # GeminiAiService
│   │   │   ├── db/                  # Drizzle schema, repositories
│   │   │   └── config/              # Environment validation
│   │   └── presentation/            # HTTP layer (Hono)
│   │       ├── routes/              # API route handlers
│   │       ├── middleware/           # Error handling, rate limiting, CORS
│   │       └── app.ts               # Composition root (DI wiring)
│   └── package.json
│
├── shared/                          # Shared TypeScript types
│   └── types/
│       ├── api.ts                   # ApiResponse, ApiError
│       └── idea.ts                  # VideoIdea, VideoPlan, Niche
│
└── package.json                     # Root workspace config
```

## Data Flow

```
User Input → IndexPage.vue
                │
                ├─→ useGenerateIdeas.generate(topic)
                │       │
                │       ├─→ useApi.post('/api/ideas/generate')
                │       │       │
                │       │       └─→ Hono route → GenerateIdeas use case → GeminiAiService
                │       │               │
                │       │               └─→ Response: VideoIdea[]
                │       │
                │       └─→ ideasStore.setIdeas(ideas)
                │               │
                │               └─→ IdeaCard[] render
                │
                └─→ User clicks "Generate plan" → navigate to /plan
                        │
                        └─→ PlanPage.vue (onMounted)
                                │
                                └─→ useGeneratePlan.generate()
                                        │
                                        ├─→ useApi.post('/api/plans/generate')
                                        │       │
                                        │       └─→ Hono route → GeneratePlan use case → GeminiAiService
                                        │               │
                                        │               └─→ Response: string (markdown)
                                        │
                                        └─→ planStore.setPlan(markdown)
                                                │
                                                └─→ markdown-it render → v-html
```

## Key Patterns

### Dual Niche System
Тип `Niche = 'psychology' | 'ambient'` переключает:
- Системные промпты для Gemini (server-side)
- UI (иконки, цвета, пресеты)
- Пресеты тем для быстрого поиска

### Bilingual Content Strategy
- UI текст: **русский** (targetAudience, whyItWorks, кнопки)
- AI-generated контент: **английский** (title, hook, keywords — для Tier-1 аудитории)

### State Management
- Pinia stores хранят данные между страницами (ideas, selected idea, plan)
- Composables инкапсулируют API-логику и обновляют stores
- Компоненты читают из stores, не вызывают API напрямую

## See Also

- [AI Features](ai-features.md) — подробное описание всех 12 AI-функций
- [Configuration](configuration.md) — переменные окружения и настройки
- [.ai-factory/ARCHITECTURE.md](../.ai-factory/ARCHITECTURE.md) — полная архитектура с примерами кода
