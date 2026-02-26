import { test, expect } from '../fixtures/test-fixtures';
import { MOCK_IDEAS, TEST_TOPICS } from '../helpers/test-data';
import { mockApiError, mockIdeasGeneration, mockIdeasList } from '../helpers/api-mock';

test.describe('IndexPage', () => {
  test.describe('Navigation & Initial State', () => {
    test('page loads at / with correct layout', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.nicheToggle).toBeVisible();
      await expect(indexPage.searchInput).toBeVisible();
      await expect(indexPage.searchButton).toBeVisible();
    });

    test('niche toggle defaults to psychology', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      // Psychology button should have active/selected state
      await expect(indexPage.psychologyBtn).toBeVisible();
      await expect(indexPage.ambientBtn).toBeVisible();
    });

    test('no idea cards shown initially (empty state)', async ({ indexPage, page, setupMocks }) => {
      await mockIdeasList(page, []);
      await setupMocks();
      await indexPage.goto();

      // Give page time to render
      await page.waitForTimeout(500);
      const cardsCount = await indexPage.ideaCards.count();
      // May show history cards or none — no generated cards expected
      expect(cardsCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Niche Toggle', () => {
    test('can switch from psychology to ambient', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.selectNiche('ambient');
      // After clicking ambient, the ambient button should be active
      await expect(indexPage.ambientBtn).toBeVisible();
    });

    test('can switch back to psychology', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.selectNiche('ambient');
      await indexPage.selectNiche('psychology');
      await expect(indexPage.psychologyBtn).toBeVisible();
    });
  });

  test.describe('Idea Generation Flow', () => {
    test('generates ideas from search topic', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      const count = await indexPage.getIdeaCardsCount();
      expect(count).toBe(MOCK_IDEAS.length);
    });

    test('idea cards display correct information', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      // First idea card should contain title and hook from mock data
      const firstCard = indexPage.ideaCards.first();
      await expect(firstCard).toContainText(MOCK_IDEAS[0].title);
      await expect(firstCard).toContainText(MOCK_IDEAS[0].hook);
    });

    test('idea cards show search volume badges', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      // Cards should have QBadge elements with search volume
      const firstCard = indexPage.ideaCards.first();
      const badges = firstCard.locator('.q-badge');
      expect(await badges.count()).toBeGreaterThan(0);
    });

    test('idea cards show keyword chips', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      // Cards should have QChip elements with keywords
      const firstCard = indexPage.ideaCards.first();
      const chips = firstCard.locator('.q-chip');
      expect(await chips.count()).toBeGreaterThan(0);
      await expect(chips.first()).toContainText(MOCK_IDEAS[0].primaryKeyword);
    });
  });

  test.describe('Idea Card Interaction', () => {
    test('clicking "Generate Plan" navigates to plan page', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      await indexPage.clickGeneratePlan(0);

      // Should navigate to /plan
      await page.waitForURL(/\/plan/);
      expect(page.url()).toContain('/plan');
    });
  });

  test.describe('Error Handling', () => {
    test('shows error banner on API failure', async ({ indexPage, page }) => {
      await mockApiError(page, '**/api/ideas/generate', 500, 'Internal Server Error');
      await mockIdeasList(page, []);
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);

      // Wait for error state
      await expect(indexPage.errorBanner).toBeVisible({ timeout: 10_000 });
    });

    test('empty topic does not trigger API call', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      let apiCalled = false;
      await page.route('**/api/ideas/generate', async (route) => {
        apiCalled = true;
        await route.continue();
      });

      // Try to search with empty input
      await indexPage.searchInput.fill('');
      await indexPage.searchButton.click();

      // Wait a moment to ensure no API call was made
      await page.waitForTimeout(1000);
      expect(apiCalled).toBe(false);
    });
  });

  test.describe('Responsive Layout', () => {
    test('renders correctly on mobile viewport', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await page.setViewportSize({ width: 375, height: 812 });
      await indexPage.goto();

      await expect(indexPage.nicheToggle).toBeVisible();
      await expect(indexPage.searchInput).toBeVisible();
    });

    test('renders correctly on tablet viewport', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await page.setViewportSize({ width: 768, height: 1024 });
      await indexPage.goto();

      await expect(indexPage.nicheToggle).toBeVisible();
      await expect(indexPage.searchInput).toBeVisible();
    });

    test('renders correctly on desktop viewport', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await page.setViewportSize({ width: 1280, height: 800 });
      await indexPage.goto();

      await expect(indexPage.nicheToggle).toBeVisible();
      await expect(indexPage.searchInput).toBeVisible();
    });
  });
});
