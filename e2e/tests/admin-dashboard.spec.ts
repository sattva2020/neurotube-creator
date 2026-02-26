import { test, expect } from '../fixtures/test-fixtures';
import { MOCK_AUTH_ADMIN_RESPONSE, MOCK_ADMIN_STATS, MOCK_ACTIVITY_LOGS } from '../helpers/test-data';

/**
 * Set up admin authentication and all required mocks for admin dashboard tests.
 */
async function setupAdminDashboard(page: any, setupMocks: () => Promise<void>) {
  const { mockAllAuthRoutes, mockAuthMe, injectAuthTokens } = await import('../helpers/api-mock');
  await mockAllAuthRoutes(page);
  await mockAuthMe(page, MOCK_AUTH_ADMIN_RESPONSE.user);
  await setupMocks();
  await injectAuthTokens(page, MOCK_AUTH_ADMIN_RESPONSE);
}

test.describe('Admin Dashboard', () => {
  test.describe('Dashboard Tab', () => {
    test('shows stats cards on load', async ({ page, setupMocks }) => {
      await setupAdminDashboard(page, setupMocks);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Heading should be visible
      await expect(page.locator('.text-h5').filter({ hasText: 'Панель администратора' })).toBeVisible();

      // Stats cards should display values from mock
      await expect(page.locator('.text-h4').first()).toBeVisible();
      await expect(page.getByText(String(MOCK_ADMIN_STATS.totalUsers))).toBeVisible();
    });

    test('shows role distribution', async ({ page, setupMocks }) => {
      await setupAdminDashboard(page, setupMocks);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('.text-subtitle1').filter({ hasText: 'Распределение ролей' })).toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test('can switch between tabs', async ({ page, setupMocks }) => {
      await setupAdminDashboard(page, setupMocks);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Dashboard tab should be active by default
      await expect(page.locator('.q-tab--active').filter({ hasText: 'Дашборд' })).toBeVisible();

      // Switch to Users tab
      await page.locator('.q-tab').filter({ hasText: 'Пользователи' }).click();
      await page.waitForTimeout(300);
      await expect(page.locator('.q-tab--active').filter({ hasText: 'Пользователи' })).toBeVisible();

      // Switch to Activity tab
      await page.locator('.q-tab').filter({ hasText: 'Журнал активности' }).click();
      await page.waitForTimeout(300);
      await expect(page.locator('.q-tab--active').filter({ hasText: 'Журнал активности' })).toBeVisible();
    });
  });

  test.describe('Users Tab', () => {
    test('shows user management table', async ({ page, setupMocks }) => {
      await setupAdminDashboard(page, setupMocks);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Switch to Users tab
      await page.locator('.q-tab').filter({ hasText: 'Пользователи' }).click();
      await page.waitForTimeout(500);

      // Table should be visible with user data
      await expect(page.locator('.q-table')).toBeVisible();
    });
  });

  test.describe('Activity Log Tab', () => {
    test('shows activity log table', async ({ page, setupMocks }) => {
      await setupAdminDashboard(page, setupMocks);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Switch to Activity tab
      await page.locator('.q-tab').filter({ hasText: 'Журнал активности' }).click();
      await page.waitForTimeout(500);

      // Activity log table should be visible
      await expect(page.locator('.q-table')).toBeVisible();
    });

    test('shows action filter', async ({ page, setupMocks }) => {
      await setupAdminDashboard(page, setupMocks);
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Switch to Activity tab
      await page.locator('.q-tab').filter({ hasText: 'Журнал активности' }).click();
      await page.waitForTimeout(300);

      // Filter should be visible
      await expect(page.locator('.q-select').filter({ hasText: 'Фильтр по действию' })).toBeVisible();
    });
  });
});
