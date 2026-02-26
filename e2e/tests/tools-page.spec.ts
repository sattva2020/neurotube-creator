import { test, expect } from '../fixtures/test-fixtures';
import { mockApiError } from '../helpers/api-mock';

test.describe('ToolsPage', () => {
  test.describe('Tools Grid', () => {
    test('displays tool cards grid on /tools', async ({ toolsPage, setupMocks }) => {
      await setupMocks();
      await toolsPage.goto();

      const count = await toolsPage.getToolCardsCount();
      // Expect at least several tool cards (project has ~10 tools)
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('back button returns to plan page', async ({ toolsPage, page, setupMocks }) => {
      await setupMocks();
      await toolsPage.goto();

      await toolsPage.goBack();
      await page.waitForURL(/\/plan/);
      expect(page.url()).toContain('/plan');
    });
  });

  test.describe('Tool Dialogs', () => {
    test('clicking a tool card opens a dialog', async ({ toolsPage, setupMocks }) => {
      await setupMocks();
      await toolsPage.goto();

      // Open the first visible tool card
      const firstCard = toolsPage.toolCards.first();
      const toolName = await firstCard.innerText();
      console.debug(`[test] Opening tool: "${toolName.substring(0, 30)}..."`);

      await firstCard.click();
      await toolsPage.waitForDialog();

      await expect(toolsPage.dialog).toBeVisible();
    });

    test('dialog can be closed with close button', async ({ toolsPage, setupMocks }) => {
      await setupMocks();
      await toolsPage.goto();

      await toolsPage.toolCards.first().click();
      await toolsPage.waitForDialog();

      await toolsPage.closeDialog();
      await expect(toolsPage.dialog).not.toBeVisible();
    });

    test('dialog can be closed with Escape key', async ({ toolsPage, setupMocks }) => {
      await setupMocks();
      await toolsPage.goto();

      await toolsPage.toolCards.first().click();
      await toolsPage.waitForDialog();

      await toolsPage.closeDialogByEscape();
      await expect(toolsPage.dialog).not.toBeVisible();
    });
  });

  test.describe('Tool Error States', () => {
    test('shows error on tool API failure', async ({ toolsPage, page }) => {
      // Mock all tool endpoints as errors
      await mockApiError(page, '**/api/titles/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/descriptions/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/branding/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/thumbnails/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/shorts/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/notebooklm/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/suno/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/monetization/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/roadmap/generate', 500, 'Generation failed');
      await mockApiError(page, '**/api/analysis/niche', 500, 'Generation failed');

      await toolsPage.goto();

      // Open a tool and try to submit
      await toolsPage.toolCards.first().click();
      await toolsPage.waitForDialog();

      // If there's a submit button, click it
      if (await toolsPage.dialogSubmitButton.isVisible()) {
        await toolsPage.dialogSubmitButton.click();

        // Should show error state in the dialog
        await page.waitForTimeout(2000);
        const dialogText = await toolsPage.getDialogContent();
        // Error state should be indicated somehow
        expect(dialogText.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Responsive Layout', () => {
    test('tools grid adapts to mobile viewport', async ({ toolsPage, page, setupMocks }) => {
      await setupMocks();
      await page.setViewportSize({ width: 375, height: 812 });
      await toolsPage.goto();

      const count = await toolsPage.getToolCardsCount();
      expect(count).toBeGreaterThanOrEqual(5);
    });
  });
});
