import { test, expect } from '../fixtures/test-fixtures';
import { MOCK_AUTH_RESPONSE, MOCK_AUTH_ADMIN_RESPONSE } from '../helpers/test-data';

test.describe('Auth Flow', () => {
  test.describe('Unauthenticated Redirect', () => {
    test('redirects to /login when accessing / without auth', async ({ page, setupAuthMocks }) => {
      await setupAuthMocks();
      await page.goto('/');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('redirects to /login when accessing /tools without auth', async ({ page, setupAuthMocks }) => {
      await setupAuthMocks();
      await page.goto('/tools');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });

    test('redirects to /login when accessing /admin without auth', async ({ page, setupAuthMocks }) => {
      await setupAuthMocks();
      await page.goto('/admin');
      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Login', () => {
    test('login page renders correctly', async ({ loginPage, setupAuthMocks }) => {
      await setupAuthMocks();
      await loginPage.goto();

      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    test('successful login redirects to home', async ({ loginPage, page, setupAuthMocks, setupMocks }) => {
      await setupAuthMocks();
      await setupMocks();
      await loginPage.goto();

      await loginPage.login('test@example.com', 'password123');
      await page.waitForURL(/^(?!.*\/login)/);

      // Should be on home page, not login
      expect(page.url()).not.toContain('/login');
    });

    test('failed login shows error', async ({ loginPage, page, mocks }) => {
      await mocks.apiError(page, '**/api/auth/login', 401, 'Invalid credentials');
      await loginPage.goto();

      await loginPage.login('wrong@example.com', 'wrongpassword');
      await page.waitForTimeout(500);

      await expect(loginPage.errorBanner).toBeVisible();
    });

    test('has link to register page', async ({ loginPage, setupAuthMocks }) => {
      await setupAuthMocks();
      await loginPage.goto();

      await expect(loginPage.registerLink).toBeVisible();
    });
  });

  test.describe('Register', () => {
    test('register page renders correctly', async ({ registerPage, setupAuthMocks }) => {
      await setupAuthMocks();
      await registerPage.goto();

      await expect(registerPage.displayNameInput).toBeVisible();
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.submitButton).toBeVisible();
    });

    test('successful registration redirects to home', async ({ registerPage, page, setupAuthMocks, setupMocks }) => {
      await setupAuthMocks();
      await setupMocks();
      await registerPage.goto();

      await registerPage.register('New User', 'new@example.com', 'password123');
      await page.waitForURL(/^(?!.*\/register)/);

      expect(page.url()).not.toContain('/register');
    });

    test('has link to login page', async ({ registerPage, setupAuthMocks }) => {
      await setupAuthMocks();
      await registerPage.goto();

      await expect(registerPage.loginLink).toBeVisible();
    });
  });

  test.describe('Authenticated User', () => {
    test('authenticated user can access home page', async ({ page, setupAuthMocks, setupMocks, injectAuth }) => {
      await setupAuthMocks();
      await setupMocks();
      await injectAuth();
      await page.goto('/');

      // Should stay on home page
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain('/login');
    });

    test('authenticated user sees displayName in toolbar', async ({ page, setupAuthMocks, setupMocks, injectAuth }) => {
      await setupAuthMocks();
      await setupMocks();
      await injectAuth();
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // User name should be visible in toolbar
      await expect(page.locator('.q-chip').filter({ hasText: MOCK_AUTH_RESPONSE.user.displayName })).toBeVisible();
    });

    test('authenticated user is redirected from /login to /', async ({ page, setupAuthMocks, setupMocks, injectAuth }) => {
      await setupAuthMocks();
      await setupMocks();
      await injectAuth();
      await page.goto('/login');

      // Guest route should redirect authenticated user to home
      await page.waitForURL(/^(?!.*\/login)/);
      expect(page.url()).not.toContain('/login');
    });
  });

  test.describe('Logout', () => {
    test('logout clears auth and redirects to /login', async ({ page, setupAuthMocks, setupMocks, injectAuth }) => {
      await setupAuthMocks();
      await setupMocks();
      await injectAuth();
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click logout button
      const logoutBtn = page.locator('.q-btn[aria-label="Выйти"]');
      await logoutBtn.click();

      await page.waitForURL(/\/login/);
      expect(page.url()).toContain('/login');
    });
  });

  test.describe('Admin Access', () => {
    test('non-admin user cannot access /admin', async ({ page, setupAuthMocks, setupMocks, injectAuth }) => {
      await setupAuthMocks();
      await setupMocks();
      await injectAuth(); // default user is 'editor'
      await page.goto('/admin');

      // Should be redirected away from admin
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toContain('/admin');
    });

    test('admin user can access /admin', async ({ page, setupMocks }) => {
      // Set up auth mocks with admin response
      const { mockAuthMe, mockAdminUsers, mockAllAuthRoutes, injectAuthTokens } = await import('../helpers/api-mock');
      await mockAllAuthRoutes(page);
      await mockAuthMe(page, MOCK_AUTH_ADMIN_RESPONSE.user);
      await mockAdminUsers(page);
      await setupMocks();
      await injectAuthTokens(page, MOCK_AUTH_ADMIN_RESPONSE);

      await page.goto('/admin');
      await page.waitForLoadState('networkidle');

      // Admin page should show the user table
      await expect(page.locator('.text-h5').filter({ hasText: 'Панель администратора' })).toBeVisible();
    });

    test('admin nav item visible only for admin users', async ({ page, setupMocks }) => {
      const { mockAllAuthRoutes, mockAuthMe, injectAuthTokens } = await import('../helpers/api-mock');
      await mockAllAuthRoutes(page);
      await mockAuthMe(page, MOCK_AUTH_ADMIN_RESPONSE.user);
      await setupMocks();
      await injectAuthTokens(page, MOCK_AUTH_ADMIN_RESPONSE);

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Admin nav should be visible
      await expect(page.locator('.q-item').filter({ hasText: 'Управление' })).toBeVisible();
    });
  });
});
