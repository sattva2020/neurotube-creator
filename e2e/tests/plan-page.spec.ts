import { test, expect } from '../fixtures/test-fixtures';
import { MOCK_PLAN, MOCK_IDEAS } from '../helpers/test-data';
import { mockPlanById, mockApiError, mockPlanGeneration, mockIdeasList, mockPlansList } from '../helpers/api-mock';

test.describe('PlanPage', () => {
  test.describe('Plan Display via Direct URL', () => {
    test('loads plan by ID from /plan/:id', async ({ planPage, page }) => {
      await mockPlanById(page, MOCK_PLAN);
      await mockIdeasList(page, MOCK_IDEAS);
      await mockPlansList(page, [MOCK_PLAN]);
      await planPage.gotoWithId(MOCK_PLAN.id);

      await planPage.waitForPlan();
      const title = await planPage.getTitle();
      expect(title).toContain(MOCK_PLAN.title);
    });

    test('renders markdown content correctly', async ({ planPage, page }) => {
      await mockPlanById(page, MOCK_PLAN);
      await mockIdeasList(page, MOCK_IDEAS);
      await mockPlansList(page, [MOCK_PLAN]);
      await planPage.gotoWithId(MOCK_PLAN.id);

      await planPage.waitForPlan();
      const content = await planPage.getMarkdownContent();
      // Markdown should contain chapter headings from mock plan
      expect(content).toContain('Hook');
      expect(content).toContain('Dopamine');
    });

    test('markdown formatting is rendered (not raw)', async ({ planPage, page }) => {
      await mockPlanById(page, MOCK_PLAN);
      await mockIdeasList(page, MOCK_IDEAS);
      await mockPlansList(page, [MOCK_PLAN]);
      await planPage.gotoWithId(MOCK_PLAN.id);

      await planPage.waitForPlan();
      // Check that markdown is rendered as HTML (headers, lists, etc.)
      const htmlContent = await page.locator('[v-html], .markdown-body, .plan-content').first().innerHTML();
      // Should contain HTML tags, not raw markdown
      expect(htmlContent).toMatch(/<h[1-6]|<ul|<li|<strong|<p/);
    });
  });

  test.describe('Plan Navigation', () => {
    test('back button returns to index page', async ({ planPage, page }) => {
      await mockPlanById(page, MOCK_PLAN);
      await mockIdeasList(page, MOCK_IDEAS);
      await mockPlansList(page, [MOCK_PLAN]);
      await planPage.gotoWithId(MOCK_PLAN.id);

      await planPage.waitForPlan();
      await planPage.goBack();

      await page.waitForURL(/\/$/);
      expect(page.url()).not.toContain('/plan');
    });

    test('copy button is visible on plan page', async ({ planPage, page }) => {
      await mockPlanById(page, MOCK_PLAN);
      await mockIdeasList(page, MOCK_IDEAS);
      await mockPlansList(page, [MOCK_PLAN]);
      await planPage.gotoWithId(MOCK_PLAN.id);

      await planPage.waitForPlan();
      await expect(planPage.copyButton).toBeVisible();
    });
  });

  test.describe('Tool Integration', () => {
    test('AI tools button navigates to /tools', async ({ planPage, page }) => {
      await mockPlanById(page, MOCK_PLAN);
      await mockIdeasList(page, MOCK_IDEAS);
      await mockPlansList(page, [MOCK_PLAN]);
      await planPage.gotoWithId(MOCK_PLAN.id);

      await planPage.waitForPlan();
      await planPage.clickToolsButton();

      await page.waitForURL(/\/tools/);
      expect(page.url()).toContain('/tools');
    });
  });

  test.describe('Error States', () => {
    test('shows warning when accessing /plan without context', async ({ planPage, page }) => {
      await mockIdeasList(page, []);
      await mockPlansList(page, []);
      await planPage.goto();

      // Should show warning banner or error state
      const hasWarning = await planPage.warningBanner.isVisible();
      const hasError = await planPage.errorBanner.isVisible();
      expect(hasWarning || hasError).toBeTruthy();
    });

    test('shows error on API failure for plan by ID', async ({ planPage, page }) => {
      await mockApiError(page, new RegExp('/api/plans/[^/]+$'), 500, 'Plan not found');
      await mockIdeasList(page, []);
      await planPage.gotoWithId('nonexistent-id');

      await expect(planPage.errorBanner).toBeVisible({ timeout: 10_000 });
    });
  });
});
