# Plan: Database Layer (PostgreSQL + Drizzle)

**Branch:** `feature/database-layer`
**Created:** 2026-02-25
**Milestone:** Database Layer (PostgreSQL + Drizzle)

## Settings

- **Testing:** Yes — repository implementations with mocked Drizzle
- **Logging:** Verbose — DEBUG for all DB operations (queries, timing, row counts)
- **Docs:** Yes — update AGENTS.md and ROADMAP.md

## Overview

Set up PostgreSQL database layer with Drizzle ORM. Create schema, repository implementations for IIdeaRepository and IPlanRepository, docker-compose for local dev, and Drizzle config for migrations.

Key decisions:
- **Driver:** postgres.js (`postgres` package) — already installed
- **Adapter:** `drizzle-orm/postgres-js` (NOT `drizzle-orm/pg-core` client)
- **Schema:** 2 tables — `ideas` and `plans` (matching domain entities)
- **Migrations:** Drizzle Kit (`drizzle-kit generate` / `drizzle-kit migrate`)

## Tasks

### Phase 1: Infrastructure Setup (Tasks 30-31)

- [x] **Task 30: Create docker-compose.yml, .env.example, drizzle.config.ts, and DB connection helper**
  - `docker-compose.yml` — PostgreSQL 16, port 5432
  - `.env.example` — DATABASE_URL, GEMINI_API_KEY, PORT, LOG_LEVEL
  - `server/drizzle.config.ts` — Drizzle Kit config
  - `server/src/infrastructure/db/client.ts` — DB connection factory (postgres.js + drizzle)

- [x] **Task 31: Create Drizzle schema with ideas and plans tables**
  - `server/src/infrastructure/db/schema.ts` — ideas + plans pgTable definitions
  - *Blocked by: Task 30*

### Phase 2: Repository Implementations (Tasks 32-33)

- [x] **Task 32: Implement IdeaRepository (saveMany, findAll)**
  - `server/src/infrastructure/db/IdeaRepository.ts` — implements IIdeaRepository
  - *Blocked by: Task 31*

- [x] **Task 33: Implement PlanRepository (save, findAll)**
  - `server/src/infrastructure/db/PlanRepository.ts` — implements IPlanRepository
  - *Blocked by: Task 31*

### Phase 3: Testing & Verification (Tasks 34-35)

- [x] **Task 34: Write tests for IdeaRepository and PlanRepository**
  - `server/src/infrastructure/db/__tests__/IdeaRepository.test.ts`
  - `server/src/infrastructure/db/__tests__/PlanRepository.test.ts`
  - *Blocked by: Tasks 32, 33*

- [x] **Task 35: Verify compilation, generate migration, and update docs**
  - tsc --noEmit, vitest run, drizzle-kit generate, update AGENTS.md + ROADMAP.md
  - *Blocked by: Task 34*

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|-----------|-------|----------------|
| 1 | Tasks 30-33 | `feat(server): add PostgreSQL schema and repository implementations` |
| 2 | Tasks 34-35 | `test(server): add repository tests and generate initial migration` |

## Dependencies

```
Task 30 (config) ──→ Task 31 (schema) ──┬──→ Task 32 (IdeaRepo) ──┐
                                        └──→ Task 33 (PlanRepo) ──┼──→ Task 34 (tests) ──→ Task 35 (verify+docs)
```
