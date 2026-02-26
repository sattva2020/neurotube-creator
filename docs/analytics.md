# Analytics & Monitoring

NeuroTube Creator uses [PostHog](https://posthog.com/) for product analytics — an open-source, self-hostable analytics platform.

## Setup

Analytics is **opt-in**. It is disabled when no API key is configured.

### Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `POSTHOG_API_KEY` | Server | PostHog project API key (server-side tracking) |
| `POSTHOG_HOST` | Server | PostHog instance URL (default: `https://us.i.posthog.com`) |
| `VITE_POSTHOG_API_KEY` | Client | PostHog project API key (client-side tracking) |
| `VITE_POSTHOG_HOST` | Client | PostHog instance URL (default: `https://us.i.posthog.com`) |

Add these to your `.env` file (see `.env.example`). Leave empty or omit to disable analytics entirely.

### Self-Hosted PostHog

If running a self-hosted PostHog instance, set the `POSTHOG_HOST` / `VITE_POSTHOG_HOST` to your instance URL.

## Architecture

### Server-Side (`posthog-node`)

- **PostHogService** (`server/src/infrastructure/analytics/PostHogService.ts`) — singleton service with `trackEvent()`, `trackApiCall()`, `shutdown()`
- **Analytics Middleware** (`server/src/presentation/middleware/analyticsMiddleware.ts`) — Hono middleware that tracks all `/api/*` calls (except `/api/health`)
- Graceful shutdown flushes pending events before process exit

### Client-Side (`posthog-js`)

- **Vue Plugin** (`client/src/plugins/posthog.ts`) — initializes PostHog and auto-tracks pageviews via Vue Router
- **useAnalytics Composable** (`client/src/composables/useAnalytics.ts`) — `trackEvent()` and `trackPageView()` for manual instrumentation

## Events Table

### Server Events

| Event | Properties | Source |
|-------|-----------|--------|
| `api_call` | `method`, `path`, `status`, `elapsed_ms`, `niche`, `route_group` | Analytics middleware |

### Client Events

| Event | Properties | Source |
|-------|-----------|--------|
| `$pageview` | `$current_url`, `page_name` | Router (auto) |
| `niche_toggled` | `niche` | NicheToggle.vue |
| `search_submitted` | `topic`, `niche` | IndexPage.vue |
| `ideas_generated` | `topic`, `niche`, `count` | useGenerateIdeas.ts |
| `idea_selected` | `title`, `niche` | IndexPage.vue |
| `idea_deleted` | `id` | IndexPage.vue |
| `plan_generated` | `title`, `niche`, `length` | useGeneratePlan.ts |
| `plan_viewed` | `id`, `title` | PlanPage.vue |
| `tool_opened` | `tool` | ToolsPage.vue |
| `tool_completed` | `tool` | ThumbnailDialog, TitlesDialog, BrandingDialog, MarkdownToolDialog |

## Privacy

- Analytics is fully opt-in — zero tracking when API keys are not configured
- No PII (personally identifiable information) is collected
- Server-side events use `distinctId: 'server'` (no user identification)
- Client-side uses PostHog anonymous IDs only
- `capture_pageview: false` — pageviews are controlled manually via Router
- All data stays in your PostHog instance (self-hostable)

## Suggested PostHog Dashboards

1. **API Usage** — filter by `api_call` event, breakdown by `route_group`
2. **Feature Adoption** — funnel: `search_submitted` → `ideas_generated` → `idea_selected` → `plan_generated`
3. **Tool Usage** — filter by `tool_opened`, breakdown by `tool`
4. **Niche Distribution** — breakdown by `niche` across all events
5. **API Performance** — average `elapsed_ms` by `route_group`
