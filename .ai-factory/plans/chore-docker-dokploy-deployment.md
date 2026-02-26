# Plan: Docker & Dokploy Deployment

- **Branch:** `chore/docker-dokploy-deployment`
- **Created:** 2026-02-26
- **Milestone:** Docker & Dokploy Deployment (last remaining milestone)

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes |
| Logging | Verbose (DEBUG) |
| Docs    | Yes (README + docs/) |

## Context

The project is a fullstack monorepo (Vue 3 + Quasar / Hono / PostgreSQL). All 13 of 14 milestones are complete. The server currently only serves API routes — no static file serving. No Docker files exist yet, though the Makefile has docker-* targets referencing a missing Dockerfile.

### Key Findings from Codebase Analysis

- **Server entry:** `server/src/index.ts` — `@hono/node-server`, port from `env.PORT` (default 3000), graceful shutdown
- **Client build:** `client/dist/` via Vite (not quasar.config.ts)
- **Env vars required:** `GEMINI_API_KEY`, `DATABASE_URL`, optional `PORT`, `LOG_LEVEL`
- **Migrations:** `drizzle-kit migrate` — no auto-migration on startup
- **Build order:** `npm run build` → shared → server → client
- **No static serving** — server has no `serveStatic` middleware
- **Makefile ready** — docker-build, docker-run, deploy targets exist but reference missing Dockerfile

## Tasks

### Phase 1: Server Preparation

#### ~~Task 1: Add static file serving to Hono server~~ ✅
- Install `@hono/node-server` serve-static (if not bundled)
- Add `serveStatic` middleware in `server/src/presentation/app.ts` for `../client/dist/`
- Add SPA fallback: non-/api/* → `index.html`
- Configurable via `STATIC_DIR` env var
- **Files:** `server/src/presentation/app.ts`, `server/package.json`
- **Logging:** INFO "Serving static files from {path}", WARN if dir not found

#### ~~Task 2: Create .dockerignore~~ ✅
- Exclude: `node_modules/`, `.git/`, `**/dist/`, `.ai-factory/`, `.claude/`, `.env*local`, `.github/`, `docs/`, `coverage/`
- **Files:** `.dockerignore`

---

**Commit 1:** `feat(server): add static file serving and .dockerignore`

---

### Phase 2: Docker Infrastructure

#### ~~Task 3: Create multi-stage Dockerfile~~ ✅
- Stages: base → deps → build-shared → build-server → build-client → production
- Base: `node:22-alpine`
- Production: copy server/dist/, client/dist/, server/drizzle/, production node_modules
- Build args: VERSION, COMMIT
- Labels: OCI standard
- `NODE_ENV=production`, expose 3000
- **Files:** `Dockerfile`

#### ~~Task 4: Create docker-compose.yml for local dev~~ ✅
- Service `postgres`: postgres:17-alpine, port 5432, named volume, healthcheck
- Service `app`: build from Dockerfile, profile "full", depends on postgres
- **Files:** `docker-compose.yml`

#### ~~Task 5: Add Docker entrypoint with migrations~~ ✅
- Create `docker-entrypoint.sh`: run drizzle-kit migrate, then exec server
- Update Dockerfile ENTRYPOINT
- Handle migration errors with non-zero exit
- **Files:** `docker-entrypoint.sh`, `Dockerfile`
- **Logging:** "Running database migrations...", "Migrations complete. Starting server..."

---

**Commit 2:** `feat: add Dockerfile, docker-compose, and entrypoint`

---

### Phase 3: Configuration & Tests

#### ~~Task 6: Update .env.example and env validation~~ ✅
- Add `NODE_ENV`, `STATIC_DIR` to `.env.example` with Docker comments
- Update `server/src/infrastructure/config/env.ts` — add new optional vars
- **Files:** `.env.example`, `server/src/infrastructure/config/env.ts`

#### ~~Task 7: Add Docker configuration tests~~ ✅
- Test static file serving (Vitest integration test)
- Test env validation with new vars
- Validate Dockerfile and docker-compose.yml structure
- Verify .dockerignore coverage
- **Files:** `server/src/__tests__/static-serving.test.ts` (or similar)

---

**Commit 3:** `chore: update env config and add Docker tests`

---

### Phase 4: Documentation

#### ~~Task 8: Update deployment documentation~~ ✅
- README.md: Docker quick start, env vars reference, Dokploy steps
- docs/deployment.md: full deployment guide (local dev, Docker build, Dokploy setup, PostgreSQL service)
- **Files:** `README.md`, `docs/deployment.md`

---

**Commit 4:** `docs: add deployment documentation`

---

## Dependency Graph

```
Task 1 (static serving) ──┬──→ Task 3 (Dockerfile) ──→ Task 5 (entrypoint)
                          │                                    │
Task 2 (.dockerignore)    │    Task 4 (compose)               │
                          │         │                          │
Task 6 (env)              ├─────────┼──────────────────────────┼──→ Task 7 (tests)
                          │         │                          │
                          └─────────┴──────────────────────────┴──→ Task 8 (docs)
```

## Next Steps

```
/aif-implement    → execute this plan
```
