# Plan: State Management & Data Persistence

- **Branch:** `feature/state-persistence`
- **Created:** 2026-02-25
- **Base:** `master`

## Settings

- **Testing:** Yes
- **Logging:** Verbose (DEBUG-level with `[Component]` prefixes)
- **Docs:** Yes (update docs/ and ARCHITECTURE.md)

## Overview

Complete the data persistence layer: extend backend with CRUD endpoints, fix client stores to hold full entities, add history composables for loading saved data, update pages to hydrate from DB on mount, persist niche to localStorage.

### Key Findings from Exploration

- **plan store bug:** stores raw `markdown: string` but server returns full `VideoPlan` object — `id` is lost
- **useGeneratePlan type mismatch:** declared `post<string>` but receives `VideoPlan`
- **PlanPage ignores `:id` param** — can't deep-link to saved plans
- **IndexPage never calls `GET /api/ideas`** — history not loaded on mount
- **useApi.ts** missing `delete` method
- **Domain ports** only have `saveMany/save` + `findAll` — no `findById` or `delete`

---

## Phase 1: Backend CRUD Foundation

### ~~Task 1: Extend domain ports with findById and delete~~ [x]
- Files: `server/src/domain/ports/IIdeaRepository.ts`, `IPlanRepository.ts`
- Add `findById(id: string): Promise<T | null>` and `delete(id: string): Promise<void>`

### ~~Task 2: Implement findById and delete in repositories~~ [x]
- Files: `server/src/infrastructure/db/IdeaRepository.ts`, `PlanRepository.ts`
- Drizzle queries with `eq(table.id, id)`, return mapped entity or null
- Blocked by: Task 1

### ~~Task 3: Add GET /:id and DELETE /:id server routes~~ [x]
- Files: `server/src/presentation/routes/ideas.ts`, `plans.ts`, `app.ts`
- Zod validation for `:id` param (uuid)
- Wire repos into route factories via `AppDeps`
- Blocked by: Task 2

### ~~Task 4: Write tests for backend CRUD (repos + routes)~~ [x]
- Files: `server/src/infrastructure/db/__tests__/`, `server/src/presentation/routes/__tests__/`
- Vitest with mocked repos
- Blocked by: Task 3

### Commit Checkpoint 1
```
feat(server): add CRUD endpoints for ideas and plans

- Extend IIdeaRepository/IPlanRepository with findById, delete
- Implement in Drizzle repositories
- Add GET/DELETE /:id routes for ideas and plans
- Add tests for new endpoints and repository methods
```

---

## Phase 2: Client Stores & Composables

### ~~Task 5: Extend useApi with delete method~~ [x]
- File: `client/src/composables/useApi.ts`
- Add `del<T>(path: string): Promise<T>` with HTTP DELETE

### ~~Task 6: Fix plan store to hold full VideoPlan entity~~ [x]
- Files: `client/src/stores/plan.ts`, `client/src/composables/useGeneratePlan.ts`
- Store full `VideoPlan` instead of just `markdown: string`
- Add `id` and `markdown` computed getters for backward compat
- Fix useGeneratePlan to extract VideoPlan from response
- Blocked by: Task 5

### ~~Task 7: Create useIdeasHistory composable~~ [x]
- File: `client/src/composables/useIdeasHistory.ts`
- `fetchAll(niche?)`, `fetchById(id)`, `remove(id)`
- Reactive state: `history`, `isLoading`, `error`
- Blocked by: Task 5

### ~~Task 8: Create usePlansHistory composable~~ [x]
- File: `client/src/composables/usePlansHistory.ts`
- `fetchAll(niche?)`, `fetchById(id)`, `remove(id)`
- Blocked by: Tasks 5, 6

### Commit Checkpoint 2
```
feat(client): add persistence composables and fix plan store

- Extend useApi with delete method
- Refactor plan store to hold full VideoPlan entity
- Fix useGeneratePlan type handling
- Add useIdeasHistory and usePlansHistory composables
```

---

## Phase 3: UI Integration

### ~~Task 9: Update IndexPage to load saved ideas on mount~~ [x]
- File: `client/src/pages/IndexPage.vue`
- Call `useIdeasHistory.fetchAll()` on mount
- Add history section (tabs or expansion) below generation form
- Delete button on history items
- Reload history when niche changes
- Blocked by: Task 7

### ~~Task 10: Update PlanPage to support :id route param~~ [x]
- File: `client/src/pages/PlanPage.vue`
- If `route.params.id` present → fetch from DB via usePlansHistory.fetchById
- Fallback to existing behavior (generate from selected idea)
- Blocked by: Task 8

### ~~Task 11: Persist niche preference to localStorage~~ [x]
- File: `client/src/stores/niche.ts`
- Read from localStorage on init, write on change
- Key: `neurotube-niche`

### Commit Checkpoint 3
```
feat(client): integrate data persistence into pages

- IndexPage loads saved ideas on mount with history section
- PlanPage supports loading plan by :id route param
- Niche preference persisted to localStorage
```

---

## Phase 4: Tests & Docs

### ~~Task 12: Write client tests (stores, composables, pages)~~ [x]
- Store tests: plan.ts (full entity), niche.ts (localStorage)
- Composable tests: useIdeasHistory, usePlansHistory, useApi.del()
- Page tests: IndexPage (history), PlanPage (:id param)
- Blocked by: Tasks 9, 10, 11

### ~~Task 13: Update documentation for persistence features~~ [x]
- Files: `docs/architecture.md`, `docs/ai-features.md`, `.ai-factory/ARCHITECTURE.md`
- New API endpoints table, updated data flow diagram
- Blocked by: Task 3

### Commit Checkpoint 4
```
test(client): add persistence tests for stores, composables, pages

docs: update architecture and features for data persistence
```

---

## Dependency Graph

```
Task 1 (ports)
  └→ Task 2 (repos)
      └→ Task 3 (routes + app.ts)
          ├→ Task 4 (backend tests)
          └→ Task 13 (docs)

Task 5 (useApi.del)
  ├→ Task 6 (plan store fix)
  │    └→ Task 8 (usePlansHistory)
  │         └→ Task 10 (PlanPage :id)
  └→ Task 7 (useIdeasHistory)
       └→ Task 9 (IndexPage history)

Task 11 (niche localStorage) — independent

Tasks 9, 10, 11 → Task 12 (client tests)
```

## Total: 13 tasks, 4 commit checkpoints
