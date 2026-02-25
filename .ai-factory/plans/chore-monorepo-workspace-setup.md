# Plan: Git Repository & Monorepo Workspace

**Branch:** `chore/monorepo-workspace-setup`
**Created:** 2026-02-25
**Milestone:** Git Repository & Monorepo Workspace

## Settings

- **Testing:** Yes — verify workspace resolution, tsconfig references, cross-package imports
- **Logging:** Verbose — detailed DEBUG logs for each setup step
- **Docs:** Yes — update README.md, docs/, AGENTS.md, ROADMAP.md

## Overview

Transform the flat React SPA into an npm workspaces monorepo with three packages:
- `client/` — Vue 3 + Quasar frontend (new)
- `server/` — Hono backend with Clean Architecture (new)
- `shared/` — shared TypeScript types between client and server

The current React SPA (`src/`) is preserved in `client/src-legacy/` as reference for migration.

## Tasks

### Phase 1: Directory Structure (Task 1)

- [x] **Task 1: Create monorepo directory structure**
  - Create `client/`, `server/src/`, `shared/types/` directories
  - Add `.gitkeep` files to preserve empty dirs

### Phase 2: Package Configuration (Tasks 2-5)

- [x] **Task 2: Configure root package.json for npm workspaces**
  - Rename `react-example` → `neurotube-creator`
  - Add `"workspaces": ["client", "server", "shared"]`
  - Move shared devDeps (typescript, @types/node) to root
  - Remove package-specific deps
  - Update scripts for monorepo orchestration
  - *Blocked by: Task 1*

- [x] **Task 3: Create client/package.json** (Vue 3 + Quasar)
  - `@neurotube/client` with Vue 3, Quasar, Pinia, vue-router
  - Dev deps: @quasar/vite-plugin, vite, typescript
  - Reference: `@neurotube/shared: workspace:*`
  - *Blocked by: Task 1*

- [x] **Task 4: Create server/package.json** (Hono)
  - `@neurotube/server` with hono, zod, @google/genai, drizzle-orm, postgres
  - Dev deps: tsx, drizzle-kit, typescript
  - Reference: `@neurotube/shared: workspace:*`
  - *Blocked by: Task 1*

- [x] **Task 5: Create shared/package.json** (TypeScript types)
  - `@neurotube/shared` with declaration exports
  - Proper exports map for type-safe imports
  - *Blocked by: Task 1*

### Phase 3: TypeScript & Files (Tasks 6-8)

- [x] **Task 6: Set up TypeScript project references**
  - Root tsconfig.json → references only
  - tsconfig.base.json → shared options (strict, ES2022)
  - client/tsconfig.json → DOM, jsx, bundler resolution
  - server/tsconfig.json → no DOM, node16, outDir
  - shared/tsconfig.json → declarations, outDir
  - *Blocked by: Tasks 2, 3, 4, 5*

- [x] **Task 7: Move legacy React source to client/src-legacy/**
  - `src/` → `client/src-legacy/`
  - `index.html` → `client/index-legacy.html`
  - `vite.config.ts` → `client/vite.config.legacy.ts`
  - Keep `.env.example` at root
  - *Blocked by: Task 1*

- [x] **Task 8: Update .gitignore for monorepo**
  - Add `**/node_modules/`, `**/dist/`
  - Add per-workspace env patterns
  - Add drizzle artifacts
  - *Blocked by: Task 1*

### Phase 4: Build Integration (Task 9)

- [x] **Task 9: Update Makefile for monorepo commands**
  - Update dev/build/lint targets
  - Add workspace-specific targets (dev-client, dev-server)
  - Update Docker targets for multi-stage
  - *Blocked by: Task 2*

### Phase 5: Verification (Task 10)

- [x] **Task 10: Verify workspace setup and run basic tests**
  - `npm install` — workspaces resolve
  - `npm ls --workspaces` — all 3 packages visible
  - `npx tsc --build --dry` — no reference errors
  - Create shared type → verify importable from client and server
  - *Blocked by: Tasks 2, 3, 4, 5, 6, 7*

### Phase 6: Documentation (Task 11)

- [x] **Task 11: Update documentation for monorepo structure**
  - README.md — new Getting Started
  - docs/getting-started.md — workspace commands
  - docs/architecture.md — folder structure
  - AGENTS.md — actual structure
  - ROADMAP.md — mark milestone complete
  - *Blocked by: Task 10*

## Commit Plan

| Checkpoint | Tasks | Commit Message |
|-----------|-------|----------------|
| 1 | Tasks 1-5 | `chore: initialize monorepo with npm workspaces` |
| 2 | Tasks 6-8 | `chore: set up TypeScript project references and migrate legacy source` |
| 3 | Tasks 9-10 | `chore: update build automation and verify workspace setup` |
| 4 | Task 11 | `docs: update documentation for monorepo structure` |

## Dependencies

```
Task 1 (dirs)
  ├── Task 2 (root pkg) ──→ Task 9 (Makefile)
  ├── Task 3 (client pkg) ─┐
  ├── Task 4 (server pkg) ─┼──→ Task 6 (tsconfig) ──→ Task 10 (verify) ──→ Task 11 (docs)
  ├── Task 5 (shared pkg) ─┘
  ├── Task 7 (move legacy) ─────────────────────────→ Task 10
  └── Task 8 (.gitignore)
```
