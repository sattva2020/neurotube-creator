# Plan: Use Cases & Application Layer

**Branch:** `feature/use-cases-application-layer`
**Created:** 2026-02-25
**Milestone:** Use Cases & Application Layer

## Settings

- **Testing:** Yes — use cases with mocked IAiService and repositories
- **Logging:** Verbose — DEBUG for every execute() call (params, timing, result)
- **Docs:** Yes — update AGENTS.md and ROADMAP.md

## Overview

Create 12 use cases in `server/src/application/use-cases/`, implementing the Application Layer of Clean Architecture. Each use case is a single-responsibility class with constructor-injected domain ports.

Two patterns:
- **With persistence** (2 use cases): GenerateIdeas, GeneratePlan — call IAiService + save via repository
- **Pure delegation** (10 use cases): call IAiService method, return result

## Tasks

### Phase 1: Repository Use Cases (Task 25)

- [x] **Task 25: Create GenerateIdeas and GeneratePlan use cases**
  - `server/src/application/use-cases/GenerateIdeas.ts` — IAiService + IIdeaRepository
  - `server/src/application/use-cases/GeneratePlan.ts` — IAiService + IPlanRepository

### Phase 2: Pure AI Use Cases (Tasks 26-27)

- [x] **Task 26: Create 4 use cases (GenerateTitles, GenerateBranding, GenerateThumbnail, AnalyzeNiche)**
  - All take IAiService only, no repositories
  - *Blocked by: Task 25*

- [x] **Task 27: Create 6 text use cases + barrel exports**
  - GenerateDescription, GenerateNotebookLM, GenerateShorts, GenerateMonetization, GenerateRoadmap, GenerateSunoPrompt
  - `server/src/application/use-cases/index.ts` — barrel exports for all 12
  - *Blocked by: Task 25*

### Phase 3: Testing & Verification (Tasks 28-29)

- [x] **Task 28: Write tests for all 12 use cases**
  - `server/src/application/use-cases/__tests__/GenerateIdeas.test.ts`
  - `server/src/application/use-cases/__tests__/GeneratePlan.test.ts`
  - `server/src/application/use-cases/__tests__/PureUseCases.test.ts`
  - *Blocked by: Tasks 25, 26, 27*

- [x] **Task 29: Verify compilation, tests, and update docs**
  - tsc --noEmit, vitest run, update AGENTS.md + ROADMAP.md
  - *Blocked by: Task 28*

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|-----------|-------|----------------|
| 1 | Tasks 25-27 | `feat(server): implement 12 application use cases` |
| 2 | Tasks 28-29 | `test(server): add use case tests and update docs` |

## Dependencies

```
Task 25 (repo use cases) ──┬──→ Task 26 (4 pure AI) ──┐
                           └──→ Task 27 (6 text + index)┼──→ Task 28 (tests) ──→ Task 29 (verify+docs)
```
