/**
 * API mock helpers for E2E tests.
 * Uses Playwright's page.route() to intercept /api/* requests.
 */
import type { Page, Route } from '@playwright/test';
import {
  MOCK_IDEAS,
  MOCK_PLAN,
  MOCK_TITLES,
  MOCK_DESCRIPTION,
  MOCK_BRANDING,
  MOCK_SHORTS,
  MOCK_TOOL_MARKDOWN,
} from './test-data';

const DEBUG = process.env.E2E_DEBUG === 'true';

function log(message: string, data?: unknown) {
  if (DEBUG) {
    console.debug(`[api-mock] ${message}`, data ?? '');
  }
}

/** Fulfill a route with JSON response */
async function fulfillJson(route: Route, data: unknown, status = 200) {
  log(`Fulfilling ${route.request().method()} ${route.request().url()} → ${status}`);
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(status >= 400 ? data : { data }),
  });
}

/** Mock POST /api/ideas/generate — returns 5 mock ideas */
export async function mockIdeasGeneration(page: Page, ideas = MOCK_IDEAS) {
  log('Setting up mock: POST /api/ideas/generate', { count: ideas.length });
  await page.route('**/api/ideas/generate', async (route) => {
    if (route.request().method() === 'POST') {
      log('Intercepted POST /api/ideas/generate');
      await fulfillJson(route, ideas);
    } else {
      await route.continue();
    }
  });
}

/** Mock POST /api/plans/generate — returns mock plan */
export async function mockPlanGeneration(page: Page, plan = MOCK_PLAN) {
  log('Setting up mock: POST /api/plans/generate', { planId: plan.id });
  await page.route('**/api/plans/generate', async (route) => {
    if (route.request().method() === 'POST') {
      log('Intercepted POST /api/plans/generate');
      await fulfillJson(route, plan);
    } else {
      await route.continue();
    }
  });
}

/** Mock POST /api/titles/generate — returns mock titles */
export async function mockTitlesGeneration(page: Page, titles = MOCK_TITLES) {
  log('Setting up mock: POST /api/titles/generate', { count: titles.length });
  await page.route('**/api/titles/generate', async (route) => {
    if (route.request().method() === 'POST') {
      log('Intercepted POST /api/titles/generate');
      await fulfillJson(route, titles);
    } else {
      await route.continue();
    }
  });
}

/** Mock POST /api/descriptions/generate — returns mock description */
export async function mockDescriptionGeneration(page: Page, description = MOCK_DESCRIPTION) {
  log('Setting up mock: POST /api/descriptions/generate');
  await page.route('**/api/descriptions/generate', async (route) => {
    if (route.request().method() === 'POST') {
      log('Intercepted POST /api/descriptions/generate');
      await fulfillJson(route, { text: description });
    } else {
      await route.continue();
    }
  });
}

/** Mock POST /api/branding/generate — returns mock branding */
export async function mockBrandingGeneration(page: Page, branding = MOCK_BRANDING) {
  log('Setting up mock: POST /api/branding/generate');
  await page.route('**/api/branding/generate', async (route) => {
    if (route.request().method() === 'POST') {
      log('Intercepted POST /api/branding/generate');
      await fulfillJson(route, branding);
    } else {
      await route.continue();
    }
  });
}

/** Mock POST /api/shorts/generate — returns mock shorts */
export async function mockShortsGeneration(page: Page, shorts = MOCK_SHORTS) {
  log('Setting up mock: POST /api/shorts/generate');
  await page.route('**/api/shorts/generate', async (route) => {
    if (route.request().method() === 'POST') {
      log('Intercepted POST /api/shorts/generate');
      await fulfillJson(route, shorts);
    } else {
      await route.continue();
    }
  });
}

/** Mock generic markdown tool endpoints (notebooklm, suno, monetization, etc.) */
export async function mockMarkdownTool(page: Page, endpoint: string, markdown = MOCK_TOOL_MARKDOWN) {
  log(`Setting up mock: POST /api/${endpoint}`);
  await page.route(`**/api/${endpoint}`, async (route) => {
    if (route.request().method() === 'POST') {
      log(`Intercepted POST /api/${endpoint}`);
      await fulfillJson(route, { text: markdown });
    } else {
      await route.continue();
    }
  });
}

/** Mock GET /api/ideas — returns saved ideas list */
export async function mockIdeasList(page: Page, ideas = MOCK_IDEAS) {
  log('Setting up mock: GET /api/ideas', { count: ideas.length });
  await page.route('**/api/ideas', async (route) => {
    if (route.request().method() === 'GET' && !route.request().url().includes('/generate')) {
      log('Intercepted GET /api/ideas');
      await fulfillJson(route, ideas);
    } else {
      await route.continue();
    }
  });
}

/** Mock GET /api/ideas/:id — returns a specific idea */
export async function mockIdeaById(page: Page, idea = MOCK_IDEAS[0]) {
  log('Setting up mock: GET /api/ideas/:id', { id: idea.id });
  await page.route(new RegExp('/api/ideas/[^/]+$'), async (route) => {
    const url = route.request().url();
    if (route.request().method() === 'GET' && !url.includes('/generate')) {
      log('Intercepted GET /api/ideas/:id', { url });
      await fulfillJson(route, idea);
    } else {
      await route.continue();
    }
  });
}

/** Mock DELETE /api/ideas/:id — returns success */
export async function mockIdeaDelete(page: Page) {
  log('Setting up mock: DELETE /api/ideas/:id');
  await page.route(new RegExp('/api/ideas/[^/]+$'), async (route) => {
    if (route.request().method() === 'DELETE') {
      log('Intercepted DELETE /api/ideas/:id');
      await fulfillJson(route, { success: true });
    } else {
      await route.continue();
    }
  });
}

/** Mock GET /api/plans — returns saved plans list */
export async function mockPlansList(page: Page, plans = [MOCK_PLAN]) {
  log('Setting up mock: GET /api/plans', { count: plans.length });
  await page.route('**/api/plans', async (route) => {
    if (route.request().method() === 'GET' && !route.request().url().includes('/generate')) {
      log('Intercepted GET /api/plans');
      await fulfillJson(route, plans);
    } else {
      await route.continue();
    }
  });
}

/** Mock GET /api/plans/:id — returns a specific plan */
export async function mockPlanById(page: Page, plan = MOCK_PLAN) {
  log('Setting up mock: GET /api/plans/:id', { id: plan.id });
  await page.route(new RegExp('/api/plans/[^/]+$'), async (route) => {
    const url = route.request().url();
    if (route.request().method() === 'GET' && !url.includes('/generate')) {
      log('Intercepted GET /api/plans/:id', { url });
      await fulfillJson(route, plan);
    } else {
      await route.continue();
    }
  });
}

/** Mock DELETE /api/plans/:id — returns success */
export async function mockPlanDelete(page: Page) {
  log('Setting up mock: DELETE /api/plans/:id');
  await page.route(new RegExp('/api/plans/[^/]+$'), async (route) => {
    if (route.request().method() === 'DELETE') {
      log('Intercepted DELETE /api/plans/:id');
      await fulfillJson(route, { success: true });
    } else {
      await route.continue();
    }
  });
}

/** Mock GET /api/health — returns healthy status */
export async function mockHealth(page: Page) {
  log('Setting up mock: GET /api/health');
  await page.route('**/api/health', async (route) => {
    await fulfillJson(route, { status: 'ok', timestamp: new Date().toISOString() });
  });
}

/** Mock an API error on a specific route */
export async function mockApiError(
  page: Page,
  urlPattern: string | RegExp,
  status: number,
  errorMessage = 'Internal Server Error',
) {
  log(`Setting up error mock: ${urlPattern} → ${status}`);
  await page.route(urlPattern, async (route) => {
    log(`Intercepted (error) ${route.request().method()} ${route.request().url()} → ${status}`);
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'SERVER_ERROR',
        message: errorMessage,
        statusCode: status,
      }),
    });
  });
}

/** Set up all common API mocks at once */
export async function mockAllApiRoutes(page: Page) {
  log('Setting up ALL API mocks');

  await mockHealth(page);
  await mockIdeasGeneration(page);
  await mockPlanGeneration(page);
  await mockIdeasList(page);
  await mockPlansList(page);
  await mockTitlesGeneration(page);
  await mockDescriptionGeneration(page);
  await mockBrandingGeneration(page);
  await mockShortsGeneration(page);

  // Mock all markdown tool endpoints
  const markdownEndpoints = [
    'notebooklm/generate',
    'suno/generate',
    'monetization/generate',
    'roadmap/generate',
    'analysis/niche',
  ];
  for (const endpoint of markdownEndpoints) {
    await mockMarkdownTool(page, endpoint);
  }

  log('All API mocks set up');
}
