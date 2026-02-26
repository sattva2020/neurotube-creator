/**
 * Page Object Model for AdminPage (/admin).
 * Supports tabbed layout: Dashboard, Users, Activity.
 */
import type { Locator, Page } from '@playwright/test';

export class AdminPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly errorBanner: Locator;

  // Tabs
  readonly dashboardTab: Locator;
  readonly usersTab: Locator;
  readonly activityTab: Locator;

  // Dashboard tab
  readonly statsCards: Locator;
  readonly roleDistribution: Locator;

  // Users tab
  readonly usersTable: Locator;
  readonly usersTableRows: Locator;

  // Activity tab
  readonly activityTable: Locator;
  readonly activityTableRows: Locator;
  readonly activityActionFilter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('.text-h5').filter({ hasText: 'Панель администратора' });
    this.errorBanner = page.locator('.q-banner');

    // Tabs
    this.dashboardTab = page.locator('.q-tab').filter({ hasText: 'Дашборд' });
    this.usersTab = page.locator('.q-tab').filter({ hasText: 'Пользователи' });
    this.activityTab = page.locator('.q-tab').filter({ hasText: 'Журнал активности' });

    // Dashboard
    this.statsCards = page.locator('.q-tab-panel').first().locator('.q-card');
    this.roleDistribution = page.locator('.text-subtitle1').filter({ hasText: 'Распределение ролей' });

    // Users
    this.usersTable = page.locator('.q-tab-panel >> .q-table').first();
    this.usersTableRows = this.usersTable.locator('tbody tr');

    // Activity
    this.activityTable = page.locator('.q-tab-panel:last-child >> .q-table');
    this.activityTableRows = this.activityTable.locator('tbody tr');
    this.activityActionFilter = page.locator('.q-select').filter({ hasText: 'Фильтр по действию' });
  }

  async goto() {
    console.debug('[AdminPage] Navigating to /admin');
    await this.page.goto('/admin');
    await this.page.waitForLoadState('networkidle');
    console.debug('[AdminPage] Page loaded');
  }

  async switchToTab(tab: 'dashboard' | 'users' | 'activity') {
    console.debug(`[AdminPage] Switching to tab: ${tab}`);
    const tabLocator = tab === 'dashboard' ? this.dashboardTab
      : tab === 'users' ? this.usersTab
      : this.activityTab;
    await tabLocator.click();
    await this.page.waitForTimeout(300);
  }
}
