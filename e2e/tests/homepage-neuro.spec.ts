/**
 * E2E tests for the redesigned Neuro-Futurism homepage.
 * Tests cover: dark theme, neural canvas, hero animation elements,
 * niche toggle, search form, chips, idea cards, features section.
 */
import { test, expect } from '../fixtures/test-fixtures';
import { MOCK_IDEAS, TEST_TOPICS } from '../helpers/test-data';
import { mockIdeasList } from '../helpers/api-mock';

test.describe('Homepage — Neuro-Futurism Design', () => {
  test.describe('Dark Theme & Layout', () => {
    test('body has neuro-theme class applied', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const hasDark = await indexPage.hasDarkTheme();
      expect(hasDark).toBe(true);
      console.debug('[test] neuro-theme class: OK');
    });

    test('page background is dark (neuro-bg color)', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const bgColor = await page.evaluate(() =>
        window.getComputedStyle(document.body).getPropertyValue('--neuro-bg').trim(),
      );
      expect(bgColor).toBe('#0a0a1a');
      console.debug('[test] neuro-bg CSS variable:', bgColor);
    });
  });

  test.describe('Neural Canvas Background', () => {
    test('canvas.neural-bg exists in the hero section', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.neuralCanvas).toBeVisible({ timeout: 5000 });
      console.debug('[test] canvas.neural-bg visible: OK');
    });

    test('canvas has non-zero dimensions', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const { width, height } = await page.evaluate(() => {
        const canvas = document.querySelector('canvas.neural-bg') as HTMLCanvasElement | null;
        return { width: canvas?.width ?? 0, height: canvas?.height ?? 0 };
      });

      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      console.debug('[test] canvas dimensions:', width, 'x', height);
    });
  });

  test.describe('Hero Section', () => {
    test('hero title is visible', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.heroTitle).toBeVisible({ timeout: 5000 });
    });

    test('hero title shows psychology text by default', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.heroTitle).toContainText('Видео');
    });

    test('hero subtitle is visible', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.heroSubtitle).toBeVisible();
      await expect(indexPage.heroSubtitle).toContainText('психологии');
    });

    test('hero section has neural background canvas', async ({ page, setupMocks, indexPage }) => {
      await setupMocks();
      await indexPage.goto();

      const heroHasCanvas = await page.evaluate(() => {
        const hero = document.querySelector('.hero-section');
        return !!hero?.querySelector('canvas.neural-bg');
      });
      expect(heroHasCanvas).toBe(true);
    });
  });

  test.describe('Niche Toggle', () => {
    test('niche toggle is visible with psychology and ambient buttons', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.nicheToggle).toBeVisible();
      await expect(indexPage.psychologyBtn).toBeVisible();
      await expect(indexPage.ambientBtn).toBeVisible();
    });

    test('psychology button is active by default', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const cls = await indexPage.psychologyBtn.getAttribute('class');
      expect(cls).toContain('niche-btn--active');
    });

    test('can switch to ambient niche', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.selectNiche('ambient');
      await indexPage.page.waitForTimeout(400); // wait for animation

      const cls = await indexPage.ambientBtn.getAttribute('class');
      expect(cls).toContain('niche-btn--active');
    });

    test('niche switch updates hero title', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.selectNiche('ambient');
      await indexPage.page.waitForTimeout(500); // animation

      await expect(indexPage.heroTitle).toContainText('RPM');
    });

    test('niche switch updates subtitle text', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.selectNiche('ambient');
      await indexPage.page.waitForTimeout(300);

      await expect(indexPage.heroSubtitle).toContainText('Эмбиент');
    });
  });

  test.describe('Search Form', () => {
    test('search input and button are visible', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.searchInput).toBeVisible();
      await expect(indexPage.searchButton).toBeVisible();
    });

    test('submit button is disabled when input is empty', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.searchButton).toBeDisabled();
    });

    test('submit button enables when topic is typed', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchInput.fill('Dopamine');
      await expect(indexPage.searchButton).not.toBeDisabled();
    });

    test('empty topic does not trigger API call', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      let apiCalled = false;
      await page.route('**/api/ideas/generate', async (route) => {
        apiCalled = true;
        await route.continue();
      });

      await indexPage.searchButton.click({ force: true });
      await page.waitForTimeout(800);
      expect(apiCalled).toBe(false);
    });
  });

  test.describe('Preset Chips', () => {
    test('preset chips are visible', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const count = await indexPage.presetChips.count();
      expect(count).toBeGreaterThan(0);
      console.debug('[test] preset chips count:', count);
    });

    test('clicking a chip fills the search input', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const firstChip = indexPage.presetChips.first();
      const chipText = await firstChip.innerText();
      await firstChip.click();

      const inputValue = await indexPage.searchInput.inputValue();
      expect(inputValue).toBe(chipText.trim());
    });

    test('ambient niche shows different chips', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const psychChips = await indexPage.presetChips.first().innerText();

      await indexPage.selectNiche('ambient');
      await indexPage.page.waitForTimeout(300);

      const ambientChips = await indexPage.presetChips.first().innerText();
      expect(psychChips).not.toBe(ambientChips);
    });
  });

  test.describe('Idea Cards (Neuro Design)', () => {
    test('idea cards appear after search', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      const count = await indexPage.getIdeaCardsCount();
      expect(count).toBe(MOCK_IDEAS.length);
    });

    test('idea cards display title from mock data', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      const firstCard = indexPage.ideaCards.first();
      await expect(firstCard).toContainText(MOCK_IDEAS[0].title);
    });

    test('idea cards have hook section', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      const firstCard = indexPage.ideaCards.first();
      await expect(firstCard.locator('.idea-card__hook')).toBeVisible();
    });

    test('idea cards have "generate plan" button', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      const firstCard = indexPage.ideaCards.first();
      await expect(firstCard.locator('.idea-card__plan-btn')).toBeVisible();
    });

    test('clicking "generate plan" navigates to /plan', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);
      await indexPage.waitForIdeas();

      await indexPage.clickGeneratePlan(0);
      await page.waitForURL(/\/plan/, { timeout: 10_000 });
      expect(page.url()).toContain('/plan');
    });
  });

  test.describe('Features Section', () => {
    test('features section exists in the DOM', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await expect(indexPage.featuresSection).toBeAttached();
    });

    test('features section has feature cards', async ({ indexPage, page, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      const cards = page.locator('.feature-card');
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(3);
      console.debug('[test] feature cards count:', count);
    });

    test('features section is visible after scroll', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.scrollToFeatures();
      await expect(indexPage.featuresSection).toBeVisible({ timeout: 5000 });
    });

    test('features section contains expected headings', async ({ indexPage, setupMocks }) => {
      await setupMocks();
      await indexPage.goto();

      await indexPage.scrollToFeatures();
      await expect(indexPage.featuresSection).toContainText('Возможности');
    });
  });

  test.describe('Error Handling', () => {
    test('shows error banner on API failure', async ({ indexPage, page }) => {
      const { mockApiError } = await import('../helpers/api-mock');
      await mockApiError(page, '**/api/ideas/generate', 500, 'Internal Server Error');
      await mockIdeasList(page, []);
      await indexPage.goto();

      await indexPage.searchTopic(TEST_TOPICS.psychology);

      await expect(indexPage.errorBanner).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe('Responsive Layout', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      test(`renders correctly on ${vp.name} (${vp.width}x${vp.height})`, async ({ indexPage, page, setupMocks }) => {
        await setupMocks();
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await indexPage.goto();

        await expect(indexPage.nicheToggle).toBeVisible();
        await expect(indexPage.searchInput).toBeVisible();
        await expect(indexPage.heroTitle).toBeVisible();
        await expect(indexPage.neuralCanvas).toBeVisible();
      });
    }
  });
});
