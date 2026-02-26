# E2E Testing Guide

## Overview

NeuroTube Creator uses **Playwright** for end-to-end testing. E2E tests verify key user flows:

- Idea generation (search, display, interaction)
- Plan viewing (markdown rendering, navigation)
- AI tools (dialog open/submit/close)
- Data persistence (save, browse, delete ideas/plans)

All AI API calls are **mocked** via `page.route()` — no real Gemini API key needed.

## Tech Stack

- **Framework:** Playwright Test (`@playwright/test`)
- **Browsers:** Chromium (primary), Firefox, WebKit
- **Pattern:** Page Object Model (POM)
- **Unit Tests:** Vitest (for helpers/fixtures validation)

## Directory Structure

```
e2e/
├── tests/               # Test spec files
│   ├── index-page.spec.ts
│   ├── plan-page.spec.ts
│   ├── tools-page.spec.ts
│   └── persistence.spec.ts
├── pages/               # Page Object Models
│   ├── IndexPage.ts
│   ├── PlanPage.ts
│   └── ToolsPage.ts
├── fixtures/            # Custom Playwright fixtures
│   └── test-fixtures.ts
├── helpers/             # Utilities
│   ├── api-mock.ts      # API route interceptors
│   ├── test-data.ts     # Mock data (ideas, plans, etc.)
│   └── __tests__/       # Unit tests for helpers
└── vitest.config.ts     # Vitest config for unit tests
```

## Setup

### Prerequisites

- Node.js 20+
- npm dependencies installed (`npm install`)

### Install Browsers

```bash
npx playwright install chromium
# Or install all browsers:
npx playwright install
```

## Running Tests

### Headless (default)

```bash
npm run test:e2e
```

### Interactive UI Mode

```bash
npm run test:e2e:ui
```

### Headed (see browser)

```bash
npm run test:e2e:headed
```

### Chromium Only

```bash
npm run test:e2e:chromium
```

### Specific Test File

```bash
npx playwright test e2e/tests/index-page.spec.ts
```

### Unit Tests (helpers/fixtures)

```bash
npm run test:e2e:unit
```

## Writing New Tests

### Page Object Model

Each page has a corresponding POM class in `e2e/pages/`:

```typescript
import { test, expect } from '../fixtures/test-fixtures';

test('example test', async ({ indexPage, setupMocks }) => {
  await setupMocks();           // Set up all API mocks
  await indexPage.goto();       // Navigate to page
  await indexPage.searchTopic('dopamine detox');
  await indexPage.waitForIdeas();

  const count = await indexPage.getIdeaCardsCount();
  expect(count).toBe(5);
});
```

### Custom Fixtures

Tests use extended fixtures from `e2e/fixtures/test-fixtures.ts`:

- `indexPage` — IndexPage POM instance
- `planPage` — PlanPage POM instance
- `toolsPage` — ToolsPage POM instance
- `setupMocks()` — sets up all common API mocks at once
- `mocks` — object with individual mock helpers for fine-grained control

### API Mocking

All API calls are intercepted via `page.route()`. Helpers in `e2e/helpers/api-mock.ts`:

```typescript
import { mockIdeasGeneration, mockApiError } from '../helpers/api-mock';

// Mock successful response
await mockIdeasGeneration(page);

// Mock error
await mockApiError(page, '**/api/ideas/generate', 500, 'Server error');

// Mock all routes at once
await mockAllApiRoutes(page);
```

### Quasar Selector Cheat Sheet

| Component | Selector |
|-----------|----------|
| QBtn | `.q-btn` |
| QInput | `.q-input input[type="text"]` |
| QCard | `.q-card` |
| QChip | `.q-chip` |
| QBadge | `.q-badge` |
| QDialog | `.q-dialog` |
| QBanner | `.q-banner` |
| QSpinner | `.q-spinner` |
| QBtnToggle | `.q-btn-toggle` (use custom class for specificity) |

### Mock Data

Test data lives in `e2e/helpers/test-data.ts`:

- `MOCK_IDEAS` — 5 VideoIdea objects
- `MOCK_PLAN` — VideoPlan with markdown content
- `MOCK_TITLES` — 5 alternative title suggestions
- `MOCK_BRANDING` — ChannelBranding object
- `TEST_TOPICS` — predefined search topics per niche

## CI Integration

E2E tests run in GitHub Actions on every push to `main` and on PRs:

1. **e2e-unit** job — runs helper/fixture unit tests
2. **e2e** job — runs full Playwright tests against Chromium
   - PostgreSQL service container
   - Database migrations
   - Playwright HTML report uploaded as artifact

## Debugging

### Screenshots

Failed tests automatically capture screenshots (configured in `playwright.config.ts`).

### Trace Viewer

On first retry, Playwright captures a full trace:

```bash
npx playwright show-trace e2e/test-results/*/trace.zip
```

### HTML Report

After test run:

```bash
npx playwright show-report
```

### Debug Mode

Enable verbose API mock logging:

```bash
E2E_DEBUG=true npm run test:e2e
```

### Step-through

```bash
PWDEBUG=1 npx playwright test e2e/tests/index-page.spec.ts
```
