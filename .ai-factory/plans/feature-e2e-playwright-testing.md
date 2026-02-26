# Plan: E2E Testing (Playwright)

- **Branch:** `feature/e2e-playwright-testing`
- **Created:** 2026-02-26
- **Status:** Planned

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — unit tests on helpers/fixtures/page objects |
| Logging | Verbose — DEBUG logs for mock setup, route interception, test steps |
| Docs | Yes — create docs/e2e-testing.md, update DESCRIPTION.md |

## Context

The project has 43 unit/integration tests (Vitest) across client and server but zero E2E tests.
Frontend: Vue 3 + Quasar on port 9000, 3 pages (Index, Plan, Tools).
Backend: Hono API on port 3000, 13+ API routes, PostgreSQL.
All AI API calls will be mocked via Playwright's page.route() — no real Gemini API needed for E2E.
CI currently has lint + build jobs but no test job.

## Tasks

### Phase 1: Foundation (Tasks 1-2)

#### ~~Task 1: Install Playwright and create base config~~ [x]
- Install `@playwright/test` at root devDependencies
- Create `playwright.config.ts` at root:
  - baseURL: `http://localhost:9000`
  - webServer: start `npm run dev` (concurrently runs client + server)
  - Projects: chromium (primary), optionally firefox/webkit
  - Screenshots on failure, video on first retry
  - Timeouts: 30s test, 10s expect
- Create directory structure: `e2e/tests/`, `e2e/fixtures/`, `e2e/helpers/`, `e2e/pages/`
- Add scripts to root `package.json`: `test:e2e`, `test:e2e:ui`, `test:e2e:headed`
- **Files:** `playwright.config.ts`, `package.json`, `e2e/` directory

#### ~~Task 2: Create Page Object Models and shared fixtures~~ [x]
- **Blocked by:** Task 1
- Page objects: `e2e/pages/IndexPage.ts`, `PlanPage.ts`, `ToolsPage.ts`
  - Quasar-specific selectors (`.q-btn`, `.q-input`, `.q-card`, `.q-dialog`)
  - Actions for each page's key user interactions
- Custom fixtures: `e2e/fixtures/test-fixtures.ts` (auto-instantiate page objects)
- API mock helpers: `e2e/helpers/api-mock.ts` (intercept /api/* with mock data)
- Test data: `e2e/helpers/test-data.ts` (sample ideas, plans, tool responses)
- **Files:** `e2e/pages/*.ts`, `e2e/fixtures/test-fixtures.ts`, `e2e/helpers/*.ts`

### Phase 2: E2E Test Specs (Tasks 3-5)

#### ~~Task 3: Write E2E tests for IndexPage~~ [x]
- **Blocked by:** Task 2
- `e2e/tests/index-page.spec.ts`
- Cover: initial state, niche toggle, idea generation (mocked), idea card interaction,
  error handling (API 500), responsive layout (mobile/tablet/desktop)
- All API calls mocked via page.route()

#### ~~Task 4: Write E2E tests for PlanPage and ToolsPage~~ [x]
- **Blocked by:** Task 2
- `e2e/tests/plan-page.spec.ts`: plan display, markdown rendering, direct URL access, tool integration
- `e2e/tests/tools-page.spec.ts`: tools grid, tool dialogs (open/submit/close), error states
- Quasar dialog selectors: `.q-dialog`, `.q-card` inside dialog

#### ~~Task 5: Write E2E tests for data persistence flows~~ [x]
- **Blocked by:** Task 2
- `e2e/tests/persistence.spec.ts`
- Cover: save ideas, browse saved ideas, delete ideas, save plans, browse plans, delete plans
- Verify request/response payloads via mock interception

### Phase 3: Quality & Helpers (Task 6)

#### ~~Task 6: Write unit tests for E2E helpers and fixtures~~ [x]
- **Blocked by:** Task 2
- `e2e/helpers/__tests__/test-data.test.ts`: verify mock data shapes match interfaces
- `e2e/helpers/__tests__/api-mock.test.ts`: test mock factories and error helpers
- `e2e/pages/__tests__/page-objects.test.ts`: verify page object structure
- Use Vitest (not Playwright) — create `e2e/vitest.config.ts` if needed

### Phase 4: CI & Docs (Tasks 7-8)

#### ~~Task 7: Add E2E tests to CI pipeline~~ [x]
- **Blocked by:** Tasks 3, 4, 5
- Update `.github/workflows/ci.yml`:
  - New `e2e` job: install Playwright browsers, start Postgres service, run migrations, start servers, run tests
  - Cache Playwright browsers (`~/.cache/ms-playwright`)
  - Upload `playwright-report/` as artifact
- Env: `DATABASE_URL`, `GEMINI_API_KEY=test-dummy-key`, `NODE_ENV=test`

#### ~~Task 8: Update documentation with E2E testing guide~~ [x]
- **Blocked by:** Tasks 3, 4, 5
- Create `docs/e2e-testing.md`: overview, setup, running tests, writing tests (POM pattern, API mocking, Quasar selectors), CI, debugging
- Update `DESCRIPTION.md`: add Playwright to tech stack

## Commit Plan

| Checkpoint | After Tasks | Commit Message |
|------------|-------------|----------------|
| 1 | 1, 2 | `feat(e2e): add Playwright config, page objects, and test fixtures` |
| 2 | 3, 4, 5 | `test(e2e): add E2E specs for IndexPage, PlanPage, ToolsPage, and persistence` |
| 3 | 6 | `test(e2e): add unit tests for E2E helpers and page objects` |
| 4 | 7, 8 | `ci: add E2E test job and update documentation` |

## Dependencies

```
Task 1 ──→ Task 2 ──┬──→ Task 3 ──┐
                     ├──→ Task 4 ──┼──→ Task 7
                     ├──→ Task 5 ──┤   Task 8
                     └──→ Task 6
```
