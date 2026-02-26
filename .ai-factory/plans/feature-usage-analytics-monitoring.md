# Plan: Usage Analytics & Monitoring

- **Branch:** `feature/usage-analytics-monitoring`
- **Created:** 2026-02-26
- **Status:** Complete

## Settings

| Setting | Value |
|---------|-------|
| Testing | Yes — unit tests on analytics service, middleware, composable |
| Logging | Verbose — DEBUG logs for event tracking, init, shutdown |
| Docs | Yes — create docs/analytics.md, update DESCRIPTION.md |

## Context

The project has zero analytics — no client tracking, no server metrics, no monitoring.
Provider: PostHog (open-source, self-hostable, full product analytics).
Server has a custom stdout logger and requestLogger middleware measuring elapsed ms.
Client: Vue 3 + Quasar, bootstrapped in main.ts with Pinia/Router/Quasar plugins.
Backend: Hono with Clean Architecture, DI via createApp(deps).
Analytics must be opt-in — disabled when POSTHOG_API_KEY is empty.

## Tasks

### Phase 1: Foundation (Tasks 1-2)

#### ~~Task 1: Install PostHog SDKs and configure environment~~ ✅
- Install `posthog-node` in server/, `posthog-js` in client/
- Update env.ts with POSTHOG_API_KEY (optional), POSTHOG_HOST (optional)
- Update .env.example
- **Files:** server/package.json, client/package.json, server/src/infrastructure/config/env.ts, .env.example

#### ~~Task 2: Create server-side analytics service~~ ✅
- **Blocked by:** Task 1
- PostHogService in server/src/infrastructure/analytics/
- No-op when API key empty, graceful shutdown with flush
- Methods: trackEvent, trackApiCall, shutdown
- **Files:** server/src/infrastructure/analytics/PostHogService.ts, server/src/infrastructure/analytics/index.ts

### Phase 2: Integration (Tasks 3-4)

#### ~~Task 3: Create API metrics middleware~~ ✅
- **Blocked by:** Task 2
- Hono middleware tracking /api/* calls (except /health)
- Sends 'api_call' event with method, path, status, elapsed, niche, route_group
- Register in app.ts after requestLogger
- **Files:** server/src/presentation/middleware/analyticsMiddleware.ts, server/src/presentation/app.ts

#### ~~Task 4: Create client-side analytics composable and Vue plugin~~ ✅
- **Blocked by:** Task 1
- useAnalytics composable with trackEvent, trackPageView
- Vue plugin with Router integration for auto-pageviews
- Register in main.ts
- **Files:** client/src/composables/useAnalytics.ts, client/src/plugins/posthog.ts, client/src/main.ts

### Phase 3: Instrumentation (Task 5)

#### ~~Task 5: Instrument key user flows with analytics events~~ ✅
- **Blocked by:** Tasks 3, 4
- Track: niche_toggled, ideas_generated, idea_selected, plan_generated, plan_viewed, tool_opened, tool_completed, idea_saved/deleted, plan_saved/deleted, search_submitted
- Minimal changes to existing components — one-line tracking calls
- **Files:** NicheToggle.vue, IndexPage.vue, PlanPage.vue, ToolsPage.vue, useGenerateIdeas.ts, useGeneratePlan.ts

### Phase 4: Quality & Docs (Tasks 6-7)

#### ~~Task 6: Write unit tests for analytics service, middleware, and composable~~ ✅
- **Blocked by:** Tasks 3, 4
- Server: PostHogService tests, analyticsMiddleware tests (mock posthog-node)
- Client: useAnalytics tests (mock posthog-js)
- **Files:** server/src/infrastructure/analytics/__tests__/, client/src/composables/__tests__/, server/src/presentation/middleware/__tests__/

#### ~~Task 7: Update documentation and DESCRIPTION.md~~ ✅
- **Blocked by:** Task 5
- Create docs/analytics.md (setup, events table, privacy, dashboards)
- Update DESCRIPTION.md with PostHog in tech stack
- **Files:** docs/analytics.md, .ai-factory/DESCRIPTION.md

## Commit Plan

| Checkpoint | After Tasks | Commit Message |
|------------|-------------|----------------|
| 1 | 1, 2 | `feat(analytics): add PostHog server-side service and env config` |
| 2 | 3, 4 | `feat(analytics): add API metrics middleware and client-side tracking` |
| 3 | 5 | `feat(analytics): instrument key user flows with PostHog events` |
| 4 | 6, 7 | `test(analytics): add unit tests and documentation` |

## Dependencies

```
Task 1 ──┬──→ Task 2 ──→ Task 3 ──┬──→ Task 5 ──→ Task 7
         └──→ Task 4 ──────────────┼──→ Task 6
                                    └
```
