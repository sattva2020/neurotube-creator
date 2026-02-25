# Plan: Frontend Foundation (Vue 3 + Quasar)

**Branch:** `feature/frontend-foundation`
**Created:** 2026-02-25
**Milestone:** Frontend Foundation (Vue 3 + Quasar) — client/ scaffold с Quasar CLI, routing, MainLayout, Pinia stores

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — Vitest + @vue/test-utils + happy-dom |
| Logging | Verbose — console.debug for dev (API calls, state changes, navigation) |
| Docs | Yes — update docs/ after implementation (/aif-docs) |

## Context

Backend (server/) полностью готов: 12 API routes, middleware, PostgreSQL, тесты.
Shared types (@neurotube/shared) готовы: VideoIdea, Niche, ApiResponse, ApiError.
Client package.json уже содержит зависимости: Vue 3, Quasar 2.18, Pinia, vue-router, sass-embedded.
Каталог client/src/ не существует — только src-legacy/ с React-кодом.
Нужно создать полный scaffold Vue 3 + Quasar приложения.

## Tasks

### Phase 1: App Scaffold

**Task 1: Create Vite config and app entry point** ✅
- `client/vite.config.ts` — Vue + Quasar + sass + dev proxy to :3000
- `client/src/main.ts` — createApp, install Quasar (Material Icons), Pinia, Router
- `client/src/App.vue` — `<q-app><router-view /></q-app>`
- `client/src/env.d.ts` — Vue SFC type declarations
- Logging: console.debug on app init

### Phase 2: Layout, Routing, State (parallel after Phase 1)

**Task 2: Create MainLayout with Quasar shell** ✅
- `client/src/layouts/MainLayout.vue` — QLayout + QHeader + QPageContainer
- Header: "NeuroTube Creator" title, NicheToggle area
- Responsive using Quasar breakpoints
- Logging: console.debug on mount, drawer toggle

**Task 3: Set up Vue Router** ✅
- `client/src/router/index.ts` — createRouter with createWebHistory
- `client/src/router/routes.ts` — `/` → IndexPage, `/plan/:id?` → PlanPage, catch-all
- Routes use MainLayout as parent layout
- Logging: console.debug in beforeEach navigation guard

**Task 4: Create Pinia stores** ✅
- `client/src/stores/niche.ts` — useNicheStore (active niche, toggle)
- `client/src/stores/ideas.ts` — useIdeasStore (items, selected, isLoading)
- `client/src/stores/plan.ts` — usePlanStore (markdown, isLoading)
- All use Composition API style (setup stores)
- Import types from @neurotube/shared
- Logging: console.debug on every state mutation

**Task 5: Create useApi composable** ✅
- `client/src/composables/useApi.ts` — HTTP client for Hono backend
- get<T>(path), post<T>(path, body)
- Error handling with ApiError from shared
- Logging: verbose (request method/URL/body, response status/data, errors)

### Phase 3: Pages (after layout + routing + stores)

**Task 6: Create stub pages** ✅
- `client/src/pages/IndexPage.vue` — placeholder with niche display + toggle
- `client/src/pages/PlanPage.vue` — placeholder with route param display
- UI in Russian, QPage wrappers
- Logging: console.debug on page mount

### Phase 4: Tests

**Task 7: Set up Vitest and write tests** ✅
- `client/vitest.config.ts` — vue plugin, path aliases
- Add vitest, @vue/test-utils, happy-dom to devDependencies
- Tests for all 3 stores (niche, ideas, plan)
- Tests for useApi composable (mock fetch)

### Phase 5: Verification

**Task 8: Verify build and dev server** ✅
- `npm install` — install new deps
- `npm run build -w client` — Vite build succeeds
- `npm run lint -w client` — vue-tsc passes
- `npm test -w client` — all tests green
- Fix any issues

## Commit Plan

| Checkpoint | After Tasks | Commit Message |
|------------|-------------|----------------|
| 1 | Tasks 1-3 | `feat(client): scaffold Vue 3 + Quasar app with routing and layout` |
| 2 | Tasks 4-5 | `feat(client): add Pinia stores and useApi composable` |
| 3 | Tasks 6-8 | `feat(client): add stub pages, tests, and verify build` |

## Dependency Graph

```
Task 1 (Vite + entry)
├── Task 2 (MainLayout)
│   └── Task 6 (stub pages) ──┐
├── Task 3 (Router)            │
│   └── Task 6 ────────────────┤
├── Task 4 (Pinia stores)      │
│   ├── Task 6 ────────────────┘
│   └── Task 7 (tests) ──────── Task 8 (verify)
└── Task 5 (useApi)
    └── Task 7 ───────────────┘
```

## Migration Notes (from legacy)

| Legacy (React) | New (Vue 3 + Quasar) |
|----------------|---------------------|
| `App.tsx` state machine | Pinia stores + Vue Router |
| Inline useState | Composition API `ref()` |
| `geminiService.ts` direct calls | `useApi` → Hono backend |
| Tailwind CSS + cn() | Quasar components + SCSS |
| `Button.tsx` variants | `QBtn` with Quasar props |
| `react-markdown` | Will use `marked` or `vue-markdown` (next milestone) |
| `window.aistudio` API key | Dropped — API key server-side only |
