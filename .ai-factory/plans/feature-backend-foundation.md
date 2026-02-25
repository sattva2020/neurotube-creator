# Plan: Backend Foundation (Hono + Domain)

**Branch:** `feature/backend-foundation`
**Created:** 2026-02-25
**Milestone:** Backend Foundation (Hono + Domain)

## Settings

- **Testing:** Yes — domain entity type checks, Hono health check endpoint
- **Logging:** Verbose — structured logger with configurable LOG_LEVEL
- **Docs:** No — documentation update on a separate milestone

## Overview

Create the backend foundation following Clean Architecture. This milestone covers:
- Domain layer (entities + ports) — zero dependencies, pure business logic contracts
- Infrastructure config (env validation with Zod)
- Structured logger utility
- Hono app entry point with health check
- Basic test infrastructure (vitest)

The domain layer defines the 12 AI service method signatures in `IAiService` port, which will be implemented by `GeminiAiService` in the next milestone (AI Service Migration).

## Tasks

### Phase 1: Domain Layer (Tasks 12-13)

- [x] **Task 12: Create domain entities**
  - `server/src/domain/entities/Niche.ts` — Niche type
  - `server/src/domain/entities/VideoIdea.ts` — VideoIdea interface
  - `server/src/domain/entities/VideoPlan.ts` — VideoPlan interface
  - `server/src/domain/entities/ChannelBranding.ts` — ChannelBranding interface
  - `server/src/domain/entities/index.ts` — barrel exports

- [x] **Task 13: Create domain ports**
  - `server/src/domain/ports/IAiService.ts` — 12 AI method signatures
  - `server/src/domain/ports/IIdeaRepository.ts` — saveMany, findAll
  - `server/src/domain/ports/IPlanRepository.ts` — save, findAll
  - `server/src/domain/ports/index.ts` — barrel exports
  - *Blocked by: Task 12*

### Phase 2: Infrastructure & Logger (Tasks 14-15)

- [x] **Task 14: Create server logger utility**
  - `server/src/infrastructure/logger.ts` — structured, configurable LOG_LEVEL

- [x] **Task 15: Create infrastructure config (env validation)**
  - `server/src/infrastructure/config/env.ts` — Zod schema for GEMINI_API_KEY, DATABASE_URL, PORT, LOG_LEVEL
  - *Blocked by: Task 14*

### Phase 3: Hono App (Task 16)

- [x] **Task 16: Create Hono app and health check route**
  - `server/src/presentation/routes/health.ts` — GET /api/health
  - `server/src/presentation/middleware/errorHandler.ts` — global error handler
  - `server/src/presentation/app.ts` — composition root
  - `server/src/index.ts` — server entry point with serve()
  - *Blocked by: Tasks 12, 13, 14, 15*

### Phase 4: Testing & Verification (Tasks 17-18)

- [x] **Task 17: Write tests for domain entities and health check**
  - Add vitest to server/package.json
  - `server/src/domain/entities/__tests__/VideoIdea.test.ts`
  - `server/src/presentation/routes/__tests__/health.test.ts`
  - *Blocked by: Tasks 12, 16*

- [x] **Task 18: Verify server starts and health check works**
  - `npm run dev -w @neurotube/server` — server starts
  - `curl /api/health` — 200 OK
  - `npm test -w @neurotube/server` — tests pass
  - *Blocked by: Tasks 16, 17*

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|-----------|-------|----------------|
| 1 | Tasks 12-13 | `feat(server): add domain entities and ports` |
| 2 | Tasks 14-16 | `feat(server): add Hono app with health check, logger, and env config` |
| 3 | Tasks 17-18 | `test(server): add vitest infrastructure and basic tests` |

## Dependencies

```
Task 12 (entities) ──→ Task 13 (ports) ──┐
Task 14 (logger) ──→ Task 15 (env) ──────┼──→ Task 16 (Hono app) ──→ Task 17 (tests) ──→ Task 18 (verify)
                                          │                      └───────────────────────→ Task 17
Task 12 ──────────────────────────────────┘
```
