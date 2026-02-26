# Implementation Plan: User-Scoped Data

Branch: feature/user-scoped-data
Created: 2026-02-26

## Settings
- Testing: yes
- Logging: verbose
- Docs: yes

## Migration Strategy
- Existing ideas/plans without userId: assign to first registered owner user
- Migration is a 3-step SQL: add nullable column → backfill → set NOT NULL + FK

## Commit Plan

- **Commit 1** (after tasks 1-3): `feat(db): add userId to domain, schema, and ports for user-scoped data`
- **Commit 2** (after tasks 4-6): `feat(api): implement user-scoped filtering in repos, use cases, and routes`
- **Commit 3** (after task 7): `test: add user-scoped data tests for repos, use cases, and routes`
- **Commit 4** (after task 8): `docs: update project docs for user-scoped data`

## Tasks

### Phase 1: Domain & Schema

- [x] **Task 1:** Add userId to domain entities and shared types
  - Files: `server/src/domain/entities/VideoIdea.ts`, `VideoPlan.ts`, `shared/types/idea.ts`
  - Add `userId?: string` field to VideoIdea and VideoPlan interfaces

- [x] **Task 2:** Add user_id column to ideas and plans DB schema + migration (depends on 1)
  - Files: `server/src/infrastructure/db/schema.ts`, `server/drizzle/0002_*.sql`
  - Add `userId` FK to both tables, generate Drizzle migration
  - Backfill: assign existing rows to first owner user (3-step: nullable → backfill → NOT NULL)

- [x] **Task 3:** Update repository ports with userId parameters (depends on 1)
  - Files: `server/src/domain/ports/IIdeaRepository.ts`, `IPlanRepository.ts`
  - Add userId param to saveMany/save, findAll, findById, delete

<!-- Commit checkpoint: tasks 1-3 → feat(db): add userId to domain, schema, and ports -->

### Phase 2: Implementation

- [x] **Task 4:** Implement user-scoped filtering in IdeaRepository and PlanRepository (depends on 2, 3)
  - Files: `server/src/infrastructure/db/IdeaRepository.ts`, `PlanRepository.ts`
  - Write userId on insert, filter by userId on queries, ownership checks on findById/delete
  - Import `and` from drizzle-orm for compound WHERE conditions

- [x] **Task 5:** Update GenerateIdeas and GeneratePlan use cases with userId (depends on 3)
  - Files: `server/src/application/use-cases/GenerateIdeas.ts`, `GeneratePlan.ts`
  - Add userId param to execute(), pass through to repo methods

- [x] **Task 6:** Update ideas and plans routes to extract userId from auth context (depends on 4, 5)
  - Files: `server/src/presentation/routes/ideas.ts`, `plans.ts`
  - Type Hono with AuthVariables, extract `c.get('user').userId`, pass to use cases and repos
  - No frontend changes needed — auth token sent automatically

<!-- Commit checkpoint: tasks 4-6 → feat(api): implement user-scoped filtering -->

### Phase 3: Tests

- [x] **Task 7:** Write tests for user-scoped data (repos, use cases, routes) (depends on 6)
  - Files: `server/src/infrastructure/db/__tests__/IdeaRepository.test.ts`, `PlanRepository.test.ts`
  - Files: `server/src/application/__tests__/GenerateIdeas.test.ts`, `GeneratePlan.test.ts`
  - Files: `server/src/presentation/routes/__tests__/ideas.test.ts`, `plans.test.ts`
  - Test data isolation: user A can't see/delete user B's data
  - Vitest with vi.fn() mocks

<!-- Commit checkpoint: task 7 → test: add user-scoped data tests -->

### Phase 4: Documentation

- [x] **Task 8:** Update documentation for user-scoped data (depends on 6)
  - Files: `.ai-factory/DESCRIPTION.md`, `.ai-factory/ARCHITECTURE.md`, `.ai-factory/ROADMAP.md`
  - Document userId in schema, ownership enforcement pattern, mark milestone complete

<!-- Commit checkpoint: task 8 → docs: update project docs for user-scoped data -->

## Architecture Notes

### Data Flow (after implementation)
```
Client request (with JWT)
  → Auth middleware extracts userId from token
  → Route handler reads c.get('user').userId
  → Use case receives userId param
  → Repository filters/writes by userId
  → DB: ideas.user_id / plans.user_id
```

### Key Design Decisions
- userId is optional on findById/delete ports — allows future admin override
- Frontend composables unchanged — userId comes from server-side JWT, not client
- CASCADE delete: if user is deleted, their ideas and plans are also deleted
- Existing data backfill: assigned to first owner user (safe for single-owner setups)
