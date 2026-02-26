import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9000';
const CI = !!process.env.CI;

console.debug('[E2E Config] Base URL:', BASE_URL);
console.debug('[E2E Config] CI mode:', CI);
console.debug('[E2E Config] Workers:', CI ? 1 : undefined);

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: './e2e/test-results',

  /* Maximum time one test can run */
  timeout: 30_000,

  expect: {
    timeout: 10_000,
  },

  /* Run tests sequentially in CI, parallel locally */
  fullyParallel: !CI,
  workers: CI ? 1 : undefined,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: CI,

  /* Retry on CI only */
  retries: CI ? 2 : 0,

  /* Reporter */
  reporter: CI
    ? [['html', { open: 'never' }], ['list']]
    : [['html', { open: 'on-failure' }], ['list']],

  use: {
    baseURL: BASE_URL,

    /* Collect trace on first retry */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on first retry */
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Start dev servers before running tests */
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
