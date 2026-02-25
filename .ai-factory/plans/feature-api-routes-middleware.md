# Plan: API Routes & Middleware

**Branch:** `feature/api-routes-middleware`
**Created:** 2026-02-25
**Milestone:** API Routes & Middleware

## Settings

- **Testing:** Yes — route integration tests with mocked use cases via app.request()
- **Logging:** Verbose — DEBUG for request/response, validation, DI wiring
- **Docs:** Yes — update AGENTS.md and ROADMAP.md

## Overview

Create all Hono API routes for the 12 use cases, wire up DI composition root, add middleware (request logger, notFound, improved errorHandler), and Zod validation schemas. This connects the presentation layer to application use cases and infrastructure.

Key decisions:
- **Route pattern:** Factory functions accepting use case instances (DI via constructor)
- **Validation:** `@hono/zod-validator` with shared Zod schemas
- **Response format:** `{ data: T }` for success, `{ error, message, statusCode }` for errors
- **Composition root:** `createApp(deps)` with explicit dependency injection
- **Middleware:** Built-in `hono/cors`, custom requestLogger, notFound, errorHandler

## Tasks

### Phase 1: Foundation (Tasks 36-37)

- [x] **Task 36: Create shared Zod validation schemas and update app.ts composition root with DI wiring**
  - `server/src/presentation/schemas.ts` — reusable Zod schemas (niche, topic, title, etc.)
  - `server/src/presentation/app.ts` — update createApp() with DI deps, register all routes
  - `server/src/index.ts` — wire all dependencies, graceful shutdown

- [x] **Task 37: Add request logger and notFound middleware**
  - `server/src/presentation/middleware/requestLogger.ts` — HTTP request/response logging
  - `server/src/presentation/middleware/notFound.ts` — 404 JSON handler
  - Update `server/src/presentation/middleware/errorHandler.ts` — Zod error distinction
  - *Blocked by: Task 36*

### Phase 2: Route Implementation (Tasks 38-40)

- [x] **Task 38: Create route files for ideas, plans, and thumbnails endpoints**
  - `server/src/presentation/routes/ideas.ts` — POST /generate + GET /
  - `server/src/presentation/routes/plans.ts` — POST /generate + GET /
  - `server/src/presentation/routes/thumbnails.ts` — POST /generate
  - *Blocked by: Task 36*

- [x] **Task 39: Create route files for titles, descriptions, branding, and analysis endpoints**
  - `server/src/presentation/routes/titles.ts` — POST /generate
  - `server/src/presentation/routes/descriptions.ts` — POST /generate
  - `server/src/presentation/routes/branding.ts` — POST /generate
  - `server/src/presentation/routes/analysis.ts` — POST /niche
  - *Blocked by: Task 36*

- [x] **Task 40: Create route files for remaining 5 endpoints**
  - `server/src/presentation/routes/notebooklm.ts` — POST /generate
  - `server/src/presentation/routes/shorts.ts` — POST /generate
  - `server/src/presentation/routes/monetization.ts` — POST /generate
  - `server/src/presentation/routes/roadmap.ts` — POST /generate
  - `server/src/presentation/routes/suno.ts` — POST /generate
  - *Blocked by: Task 36*

### Phase 3: Testing & Verification (Tasks 41-42)

- [ ] **Task 41: Write tests for routes and middleware**
  - `server/src/presentation/routes/__tests__/ideas.test.ts`
  - `server/src/presentation/routes/__tests__/plans.test.ts`
  - `server/src/presentation/routes/__tests__/routes.test.ts` (combined for pure routes)
  - `server/src/presentation/middleware/__tests__/middleware.test.ts`
  - *Blocked by: Tasks 37, 38, 39, 40*

- [ ] **Task 42: Verify compilation, run tests, and update docs**
  - tsc --noEmit, vitest run, update AGENTS.md + ROADMAP.md
  - *Blocked by: Task 41*

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|-----------|-------|----------------|
| 1 | Tasks 36-40 | `feat(server): add API routes, middleware, and DI composition root` |
| 2 | Tasks 41-42 | `test(server): add route and middleware tests, update docs` |

## Dependencies

```
Task 36 (schemas+DI) ──┬──→ Task 37 (middleware) ──────────────────┐
                       ├──→ Task 38 (ideas/plans/thumbnails) ──────┤
                       ├──→ Task 39 (titles/desc/branding/analysis)┼──→ Task 41 (tests) ──→ Task 42 (verify+docs)
                       └──→ Task 40 (notebooklm/shorts/etc.) ─────┘
```
