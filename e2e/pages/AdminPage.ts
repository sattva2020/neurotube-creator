/**
 * Page Object Model for AdminPage (/admin).
 */
import type { Locator, Page } from '@playwright/test';

export class AdminPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly table: Locator;
  readonly tableRows: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.text-h5').filter({ hasText: 'Управление' });
    this.table = page.locator('.q-table');
    this.tableRows = page.locator('.q-table tbody tr');
    this.errorBanner = page.locator('.q-banner');
  }

  async goto() {
    console.debug('[AdminPage] Navigating to /admin');
    await this.page.goto('/admin');
    await this.page.waitForLoadState('networkidle');
    console.debug('[AdminPage] Page loaded');
  }
}
