# Architecture: Clean Architecture (Fullstack)

## Overview
Проект NeuroTube Creator переходит на fullstack-стек с чётким разделением на фронтенд и бэкенд. Бэкенд использует Clean Architecture (строгая инверсия зависимостей), фронтенд следует конвенциям Quasar Framework.

Clean Architecture выбрана потому что:
- 12 AI-функций представляют собой use cases с чёткой бизнес-логикой (промпты, валидация, форматирование)
- Инверсия зависимостей позволяет легко заменять AI-провайдера (Gemini → OpenAI) без изменений бизнес-логики
- Чёткие слои облегчают тестирование: domain и application можно тестировать без реальных API-вызовов
- PostgreSQL, Hono, Gemini SDK — всё это детали реализации, изолированные в infrastructure

## Decision Rationale
- **Project type:** Fullstack AI-powered YouTube tool
- **Tech stack:** Vue 3 + Quasar (frontend), Hono (backend), PostgreSQL (database)
- **Key factor:** 12+ AI use cases требуют чёткого разделения бизнес-логики и инфраструктуры

## System Overview

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

## Monorepo Structure

```
neurotube-creator/
├── client/                          # Frontend — Vue 3 + Quasar
│   ├── src/
│   │   ├── pages/                   # Route pages
│   │   │   ├── IndexPage.vue        # Home — niche toggle, search, idea list
│   │   │   └── PlanPage.vue         # Video plan viewer with all AI tools
│   │   ├── layouts/
│   │   │   └── MainLayout.vue       # App shell — header, sidebar, footer
│   │   ├── components/              # Reusable UI components
│   │   │   ├── IdeaCard.vue         # Single video idea card
│   │   │   ├── NicheToggle.vue      # Psychology/Ambient switcher
│   │   │   ├── ThumbnailGenerator.vue
│   │   │   ├── TitleGenerator.vue
│   │   │   ├── DescriptionGenerator.vue
│   │   │   ├── BrandingGenerator.vue
│   │   │   └── ...
│   │   ├── composables/             # Vue composables (like React hooks)
│   │   │   ├── useGenerateIdeas.ts  # Idea generation logic + state
│   │   │   ├── useGeneratePlan.ts   # Plan generation logic
│   │   │   ├── useApi.ts            # Base API client (get, post, del)
│   │   │   ├── useIdeasHistory.ts   # Saved ideas CRUD (fetchAll, fetchById, remove)
│   │   │   └── usePlansHistory.ts   # Saved plans CRUD (fetchAll, fetchById, remove)
│   │   ├── stores/                  # Pinia state management
│   │   │   ├── ideas.ts             # Generated ideas store
│   │   │   ├── plan.ts              # Current plan store
│   │   │   └── niche.ts             # Active niche store
│   │   ├── types/                   # Shared TypeScript types
│   │   │   └── index.ts             # VideoIdea, Niche, ChannelBranding
│   │   ├── router/
│   │   │   └── routes.ts            # Vue Router routes
│   │   └── assets/                  # Static assets, icons
│   ├── quasar.config.ts             # Quasar framework config
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Backend — Hono + Clean Architecture
│   ├── src/
│   │   ├── domain/                  # 🟢 INNER: Pure business logic (zero dependencies)
│   │   │   ├── entities/
│   │   │   │   ├── VideoIdea.ts     # VideoIdea entity
│   │   │   │   ├── VideoPlan.ts     # VideoPlan entity
│   │   │   │   ├── ChannelBranding.ts
│   │   │   │   ├── Niche.ts         # Niche value object
│   │   │   │   ├── User.ts          # User entity (auth)
│   │   │   │   ├── Role.ts          # Role type + ROLE_HIERARCHY (auth)
│   │   │   │   └── Session.ts       # Session entity — refresh tokens (auth)
│   │   │   └── ports/               # Interfaces (contracts)
│   │   │       ├── IAiService.ts    # AI generation contract
│   │   │       ├── IIdeaRepository.ts
│   │   │       ├── IPlanRepository.ts
│   │   │       ├── IUserRepository.ts      # User CRUD (auth)
│   │   │       ├── ISessionRepository.ts   # Session management (auth)
│   │   │       ├── IPasswordHasher.ts      # Password hashing abstraction (auth)
│   │   │       └── ITokenService.ts       # JWT token generation/verification (auth)
│   │   │
│   │   ├── application/             # 🟡 USE CASES (depends on domain only)
│   │   │   ├── use-cases/
│   │   │   │   ├── GenerateIdeas.ts
│   │   │   │   ├── GeneratePlan.ts
│   │   │   │   ├── GenerateThumbnail.ts
│   │   │   │   ├── GenerateTitles.ts
│   │   │   │   ├── GenerateDescription.ts
│   │   │   │   ├── GenerateBranding.ts
│   │   │   │   ├── GenerateSunoPrompt.ts
│   │   │   │   ├── GenerateNotebookLM.ts
│   │   │   │   ├── GenerateShorts.ts
│   │   │   │   ├── AnalyzeNiche.ts
│   │   │   │   ├── GenerateMonetization.ts
│   │   │   │   ├── GenerateRoadmap.ts
│   │   │   │   ├── Register.ts          # User registration (auth, first-user-owner)
│   │   │   │   ├── Login.ts             # User login (auth)
│   │   │   │   ├── RefreshTokens.ts     # Token rotation (auth)
│   │   │   │   ├── Logout.ts            # Session invalidation (auth)
│   │   │   │   ├── GetAllUsers.ts       # Admin: list all users (rbac)
│   │   │   │   ├── UpdateUserRole.ts    # Admin: change user role (rbac)
│   │   │   │   └── DeactivateUser.ts    # Admin: soft-delete user (rbac)
│   │   │   └── dto/                 # Input/output data transfer objects
│   │   │       ├── GenerateIdeasInput.ts
│   │   │       └── GenerateIdeasOutput.ts
│   │   │
│   │   ├── infrastructure/          # 🔴 OUTER: Implements interfaces
│   │   │   ├── ai/
│   │   │   │   └── GeminiAiService.ts    # Implements IAiService with @google/genai
│   │   │   ├── db/
│   │   │   │   ├── schema.ts             # Drizzle ORM schema (ideas, plans, users, sessions)
│   │   │   │   ├── migrate.ts            # Migration runner
│   │   │   │   ├── IdeaRepository.ts     # Implements IIdeaRepository
│   │   │   │   ├── PlanRepository.ts     # Implements IPlanRepository
│   │   │   │   ├── UserRepository.ts     # Implements IUserRepository (auth)
│   │   │   │   └── SessionRepository.ts  # Implements ISessionRepository (auth)
│   │   │   ├── auth/
│   │   │   │   ├── BcryptHasher.ts      # Implements IPasswordHasher with bcryptjs
│   │   │   │   └── JwtService.ts        # Implements ITokenService with jose
│   │   │   └── config/
│   │   │       └── env.ts                # Environment variable validation
│   │   │
│   │   └── presentation/            # 🔵 HTTP layer (Hono)
│   │       ├── routes/
│   │       │   ├── ideas.ts              # POST /api/ideas/generate
│   │       │   ├── plans.ts              # POST /api/plans/generate
│   │       │   ├── thumbnails.ts         # POST /api/thumbnails/generate
│   │       │   ├── titles.ts             # POST /api/titles/generate
│   │       │   ├── descriptions.ts       # POST /api/descriptions/generate
│   │       │   ├── branding.ts           # POST /api/branding/generate
│   │       │   ├── analysis.ts           # POST /api/analysis/niche
│   │       │   ├── auth.ts              # POST /api/auth/register,login,refresh,logout + GET /me
│   │       │   ├── admin.ts             # GET/PATCH/POST /api/admin/users (rbac)
│   │       │   └── health.ts             # GET  /api/health
│   │       ├── middleware/
│   │       │   ├── errorHandler.ts       # Global error handling
│   │       │   ├── authMiddleware.ts     # Auth: createAuthMiddleware, createGlobalAuthGuard, createRequireRole
│   │       │   ├── rateLimiter.ts        # Rate limiting
│   │       │   └── cors.ts              # CORS config
│   │       └── app.ts                    # Hono app composition root
│   │
│   ├── drizzle.config.ts           # Drizzle ORM config
│   ├── tsconfig.json
│   └── package.json
│
├── shared/                          # Shared types between client & server
│   └── types/
│       ├── api.ts                   # API request/response types
│       ├── idea.ts                  # VideoIdea, Niche
│       ├── branding.ts             # ChannelBranding
│       └── auth.ts                  # Role, UserPublic, LoginRequest, AuthTokens, AuthResponse
│
├── docker-compose.yml               # Local dev: app + postgres
├── Dockerfile                       # Multi-stage: build client + server
├── Makefile                         # Build automation
├── .github/workflows/ci.yml        # CI pipeline
└── package.json                     # Root workspace config
```

## Clean Architecture Layers (Backend)

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

## Dependency Rules

### Backend (строгие)
- ✅ `domain` → **ничего** (ноль импортов из других слоёв)
- ✅ `application` → `domain` только
- ✅ `infrastructure` → `domain` + `application` (реализует интерфейсы из `domain/ports/`)
- ✅ `presentation` → `application` (вызывает use cases)
- ❌ `domain` НЕ импортирует `infrastructure` — использует интерфейсы (ports)
- ❌ `application` НЕ импортирует `infrastructure` — получает зависимости через DI
- ❌ `presentation` НЕ обращается напрямую к `infrastructure`

### Frontend (конвенции Quasar)
- ✅ `pages/` → `components/` + `composables/` + `stores/`
- ✅ `components/` → `composables/` + `stores/` + `types/`
- ✅ `composables/` → `stores/` + `types/` + `services/`
- ❌ `stores/` НЕ импортируют `components/`
- ❌ `components/` НЕ вызывают API напрямую — через composables или stores

### Cross-boundary
- ✅ `client/` → `shared/types/` (через npm workspace)
- ✅ `server/` → `shared/types/`
- ❌ `client/` НИКОГДА не импортирует из `server/` напрямую (только через HTTP API)

## Layer/Module Communication

- **Client → Server:** HTTP REST API (`fetch` / composables)
- **Server routes → Use cases:** Прямой вызов, DI через конструктор
- **Use cases → Infrastructure:** Через интерфейсы (ports) из domain
- **Infrastructure → External:** Gemini SDK, Drizzle ORM

## Key Principles

1. **Dependency Inversion** — domain определяет интерфейсы (`IAiService`), infrastructure их реализует (`GeminiAiService`). Бизнес-логика не знает о Gemini SDK.
2. **Single Responsibility per Use Case** — каждая AI-генерация = отдельный use case файл. `GenerateIdeas.ts` не знает о `GeneratePlan.ts`.
3. **Frontend = тонкий клиент** — вся бизнес-логика (промпты, форматирование, валидация) живёт на сервере. Клиент только отображает данные и отправляет запросы.
4. **Shared types** — общие TypeScript-типы в `shared/` для type-safety между клиентом и сервером.

## Code Examples

### Domain entity (server/src/domain/entities/VideoIdea.ts)
```typescript
import type { Niche } from './Niche';

export interface VideoIdea {
  id?: string;
  title: string;
  hook: string;
  targetAudience: string;
  whyItWorks: string;
  searchVolume: 'High' | 'Medium' | 'Rising Trend';
  primaryKeyword: string;
  secondaryKeywords: string[];
  niche: Niche;
  createdAt?: Date;
}
```

### Domain port (server/src/domain/ports/IAiService.ts)
```typescript
import type { VideoIdea } from '../entities/VideoIdea';
import type { Niche } from '../entities/Niche';

export interface IAiService {
  generateIdeas(topic: string, niche: Niche): Promise<VideoIdea[]>;
  generatePlan(title: string, hook: string, niche: Niche): Promise<string>;
  generateThumbnail(prompt: string): Promise<string | null>;
  generateTitles(titleIdea: string): Promise<string[]>;
  // ... other generation methods
}
```

### Use case (server/src/application/use-cases/GenerateIdeas.ts)
```typescript
import type { IAiService } from '../../domain/ports/IAiService';
import type { IIdeaRepository } from '../../domain/ports/IIdeaRepository';
import type { VideoIdea } from '../../domain/entities/VideoIdea';
import type { Niche } from '../../domain/entities/Niche';

export class GenerateIdeas {
  constructor(
    private aiService: IAiService,
    private ideaRepo: IIdeaRepository,
  ) {}

  async execute(topic: string, niche: Niche): Promise<VideoIdea[]> {
    const ideas = await this.aiService.generateIdeas(topic, niche);
    await this.ideaRepo.saveMany(ideas);
    return ideas;
  }
}
```

### Infrastructure: AI Service (server/src/infrastructure/ai/GeminiAiService.ts)
```typescript
import { GoogleGenAI, Type } from '@google/genai';
import type { IAiService } from '../../domain/ports/IAiService';
import type { VideoIdea } from '../../domain/entities/VideoIdea';
import type { Niche } from '../../domain/entities/Niche';

export class GeminiAiService implements IAiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateIdeas(topic: string, niche: Niche): Promise<VideoIdea[]> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: this.buildIdeaPrompt(topic, niche),
      config: {
        responseMimeType: 'application/json',
        responseSchema: { /* ... */ },
      },
    });
    return JSON.parse(response.text?.trim() || '[]');
  }

  // ... other methods
}
```

### Hono route (server/src/presentation/routes/ideas.ts)
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { GenerateIdeas } from '../../application/use-cases/GenerateIdeas';

const generateIdeasSchema = z.object({
  topic: z.string().min(1).max(200),
  niche: z.enum(['psychology', 'ambient']),
});

export function ideasRoutes(generateIdeas: GenerateIdeas) {
  const app = new Hono();

  app.post('/generate', zValidator('json', generateIdeasSchema), async (c) => {
    const { topic, niche } = c.req.valid('json');
    const ideas = await generateIdeas.execute(topic, niche);
    return c.json({ data: ideas });
  });

  return app;
}
```

### Composition root (server/src/presentation/app.ts)
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GeminiAiService } from '../infrastructure/ai/GeminiAiService';
import { IdeaRepository } from '../infrastructure/db/IdeaRepository';
import { GenerateIdeas } from '../application/use-cases/GenerateIdeas';
import { ideasRoutes } from './routes/ideas';
import { env } from '../infrastructure/config/env';

// Wire dependencies
const aiService = new GeminiAiService(env.GEMINI_API_KEY);
const ideaRepo = new IdeaRepository(env.DATABASE_URL);
const generateIdeas = new GenerateIdeas(aiService, ideaRepo);

// Build app
const app = new Hono();
app.use('*', cors());
app.route('/api/ideas', ideasRoutes(generateIdeas));
// ... other routes

export default app;
```

### Vue composable (client/src/composables/useGenerateIdeas.ts)
```typescript
import { ref } from 'vue';
import type { VideoIdea, Niche } from '@shared/types/idea';
import { useApi } from './useApi';

export function useGenerateIdeas() {
  const ideas = ref<VideoIdea[]>([]);
  const isLoading = ref(false);
  const { post } = useApi();

  async function generate(topic: string, niche: Niche) {
    if (!topic.trim()) return;
    isLoading.value = true;
    try {
      const response = await post<{ data: VideoIdea[] }>('/api/ideas/generate', { topic, niche });
      ideas.value = response.data;
    } catch (error) {
      console.error('Failed to generate ideas:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function reset() { ideas.value = []; }

  return { ideas, isLoading, generate, reset };
}
```

### Pinia store (client/src/stores/niche.ts)
```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Niche } from '@shared/types/idea';

export const useNicheStore = defineStore('niche', () => {
  const active = ref<Niche>('psychology');

  function toggle() {
    active.value = active.value === 'psychology' ? 'ambient' : 'psychology';
  }

  return { active, toggle };
});
```

## Database Schema (Drizzle ORM)

```typescript
// server/src/infrastructure/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const ideas = pgTable('ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  hook: text('hook').notNull(),
  targetAudience: text('target_audience').notNull(),
  whyItWorks: text('why_it_works').notNull(),
  searchVolume: text('search_volume').notNull(),
  primaryKeyword: text('primary_keyword').notNull(),
  secondaryKeywords: jsonb('secondary_keywords').$type<string[]>().notNull(),
  niche: text('niche').notNull(),
  topic: text('topic').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  ideaId: uuid('idea_id').references(() => ideas.id),
  title: text('title').notNull(),
  markdown: text('markdown').notNull(),
  niche: text('niche').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

## API Routes

| Method | Path | Use Case | Description |
|--------|------|----------|-------------|
| POST | `/api/ideas/generate` | GenerateIdeas | 5 video ideas with SEO |
| POST | `/api/plans/generate` | GeneratePlan | Full video plan (Markdown) |
| POST | `/api/thumbnails/generate` | GenerateThumbnail | AI image (base64) |
| POST | `/api/titles/generate` | GenerateTitles | 5 alternative titles |
| POST | `/api/descriptions/generate` | GenerateDescription | YouTube SEO description |
| POST | `/api/branding/generate` | GenerateBranding | Channel name + branding |
| POST | `/api/suno/generate` | GenerateSunoPrompt | Suno.ai music prompt |
| POST | `/api/notebooklm/generate` | GenerateNotebookLM | NotebookLM source doc |
| POST | `/api/shorts/generate` | GenerateShorts | 3 Shorts spinoffs |
| POST | `/api/analysis/niche` | AnalyzeNiche | Competitive analysis |
| POST | `/api/monetization/generate` | GenerateMonetization | Patreon/Boosty copy |
| POST | `/api/roadmap/generate` | GenerateRoadmap | 30-day content plan |
| GET | `/api/health` | — | Health check |
| GET | `/api/ideas` | — | List saved ideas |
| GET | `/api/ideas/:id` | — | Get idea by ID |
| DELETE | `/api/ideas/:id` | — | Delete idea by ID |
| GET | `/api/plans` | — | List saved plans |
| GET | `/api/plans/:id` | — | Get plan by ID |
| DELETE | `/api/plans/:id` | — | Delete plan by ID |
| POST | `/api/auth/register` | Register | User registration |
| POST | `/api/auth/login` | Login | User login |
| POST | `/api/auth/refresh` | RefreshTokens | Token rotation |
| POST | `/api/auth/logout` | Logout | Session invalidation |
| GET | `/api/auth/me` | — | Current user (requires auth) |
| GET | `/api/admin/users` | GetAllUsers | List all users (admin+) |
| PATCH | `/api/admin/users/:id/role` | UpdateUserRole | Change user role (admin+) |
| POST | `/api/admin/users/:id/deactivate` | DeactivateUser | Deactivate user (admin+) |

## Anti-Patterns

- ❌ **AI SDK в routes:** Никогда не вызывать `@google/genai` из Hono routes напрямую. Только через use case → IAiService
- ❌ **DB в use cases:** Use cases не знают о Drizzle/PostgreSQL. Работают через `IIdeaRepository`
- ❌ **Бизнес-логика на клиенте:** Промпты, валидация, форматирование — всё на сервере. Клиент = thin client
- ❌ **Прямой import infrastructure в domain:** Domain не знает о Gemini SDK, Drizzle, Hono
- ❌ **God use case:** Один use case = одна операция. `GenerateIdeas` не генерирует планы
- ❌ **API key на клиенте:** GEMINI_API_KEY живёт только на сервере, в env vars

## Deployment (Dokploy)

```
Docker Container (Dokploy)
├── Hono server (port 3000)
│   ├── Serves /api/* routes
│   └── Serves client/ static build (dist/)
│
PostgreSQL Service (Dokploy)
└── Internal: postgres:5432
```

- Один Docker-образ: multi-stage build (build client → build server → production)
- PostgreSQL как отдельный сервис в Dokploy
- Hono раздаёт и API, и статику фронтенда

## Migration Strategy

1. **Фаза 1:** Инициализировать `server/` с Hono + domain entities + ports
2. **Фаза 2:** Перенести промпты из `geminiService.ts` в `GeminiAiService` (infrastructure)
3. **Фаза 3:** Создать use cases, подключить PostgreSQL через Drizzle
4. **Фаза 4:** Инициализировать `client/` с Quasar, перенести UI-логику из React
5. **Фаза 5:** Dockerize + deploy на Dokploy
