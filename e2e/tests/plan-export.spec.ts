import { test, expect } from '../fixtures/test-fixtures';
import { MOCK_PLAN } from '../helpers/test-data';

test.describe('Plan Export', () => {
  test.beforeEach(async ({ setupAuthMocks, setupMocks, injectAuth, mocks, page }) => {
    await setupAuthMocks();
    await setupMocks();
    await mocks.planById(page);
    await mocks.planExport(page);
    await injectAuth();
  });

  test.describe('Export Buttons', () => {
    test('export dropdown is visible on plan page', async ({ planPage }) => {
      await planPage.gotoWithId(MOCK_PLAN.id);
      await planPage.waitForPlan();

      await expect(planPage.exportDropdown).toBeVisible();
    });

    test('export dropdown shows PDF and DOCX options', async ({ planPage }) => {
      await planPage.gotoWithId(MOCK_PLAN.id);
      await planPage.waitForPlan();

      await planPage.exportDropdown.click();

      await expect(planPage.exportPdfItem).toBeVisible();
      await expect(planPage.exportDocxItem).toBeVisible();
    });
  });

  test.describe('PDF Export', () => {
    test('clicking PDF triggers download request', async ({ planPage, page }) => {
      await planPage.gotoWithId(MOCK_PLAN.id);
      await planPage.waitForPlan();

      const downloadPromise = page.waitForEvent('download');
      await planPage.clickExportPdf();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('DOCX Export', () => {
    test('clicking DOCX triggers download request', async ({ planPage, page }) => {
      await planPage.gotoWithId(MOCK_PLAN.id);
      await planPage.waitForPlan();

      const downloadPromise = page.waitForEvent('download');
      await planPage.clickExportDocx();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toContain('.docx');
    });
  });

  test.describe('Error Handling', () => {
    test('shows error when export fails', async ({ planPage, page, mocks }) => {
      // Override export mock with error
      await mocks.apiError(page, new RegExp('/api/plans/[^/]+/export'), 500, 'Export failed');

      await planPage.gotoWithId(MOCK_PLAN.id);
      await planPage.waitForPlan();

      await planPage.exportDropdown.click();
      await planPage.exportPdfItem.click();

      // Wait for error to appear
      await page.waitForTimeout(1000);
      await expect(planPage.exportError).toBeVisible();
    });
  });
});
