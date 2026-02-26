/**
 * Page Object Model for PlanPage (/plan/:id?).
 * Provides locators and actions for the video plan viewer:
 * plan title, markdown content, tools button, back button.
 */
import type { Locator, Page } from '@playwright/test';

export class PlanPage {
  readonly page: Page;

  // Navigation
  readonly backButton: Locator;

  // States
  readonly warningBanner: Locator;
  readonly loadingSpinner: Locator;
  readonly errorBanner: Locator;
  readonly retryButton: Locator;

  // Plan content
  readonly planTitle: Locator;
  readonly markdownContent: Locator;
  readonly copyButton: Locator;

  // Tools navigation
  readonly toolsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Back button — flat QBtn with arrow_back icon
    this.backButton = page.locator('.q-btn').filter({ has: page.locator('.material-icons:has-text("arrow_back")') });

    // Warning — no idea selected
    this.warningBanner = page.locator('.q-banner.bg-warning');

    // Loading
    this.loadingSpinner = page.locator('.q-spinner-dots');

    // Error
    this.errorBanner = page.locator('.q-banner.bg-negative');
    this.retryButton = this.errorBanner.locator('.q-btn');

    // Plan content
    this.planTitle = page.locator('.text-h5').first();
    this.markdownContent = page.locator('[class*="plan-content"], .markdown-body, [v-html]').first();
    this.copyButton = page.locator('.q-btn').filter({ has: page.locator('.material-icons:has-text("content_copy")') });

    // AI tools button
    this.toolsButton = page.locator('.q-btn.bg-primary, .q-btn[class*="primary"]').filter({ hasText: /инструмент|tool/i });
  }

  /** Navigate to plan page (no ID — requires idea in store) */
  async goto() {
    console.debug('[PlanPage] Navigating to /plan');
    await this.page.goto('/plan');
    await this.page.waitForLoadState('networkidle');
    console.debug('[PlanPage] Page loaded');
  }

  /** Navigate to plan page with a specific plan ID */
  async gotoWithId(planId: string) {
    console.debug(`[PlanPage] Navigating to /plan/${planId}`);
    await this.page.goto(`/plan/${planId}`);
    await this.page.waitForLoadState('networkidle');
    console.debug('[PlanPage] Page loaded');
  }

  /** Wait for the plan content to be rendered */
  async waitForPlan() {
    console.debug('[PlanPage] Waiting for plan content');
    await this.planTitle.waitFor({ state: 'visible', timeout: 15_000 });
    console.debug('[PlanPage] Plan content visible');
  }

  /** Get the plan title text */
  async getTitle(): Promise<string> {
    const title = await this.planTitle.innerText();
    console.debug(`[PlanPage] Title: "${title}"`);
    return title;
  }

  /** Get the rendered markdown content */
  async getMarkdownContent(): Promise<string> {
    const content = await this.markdownContent.innerText();
    console.debug(`[PlanPage] Markdown content length: ${content.length}`);
    return content;
  }

  /** Click the copy button */
  async clickCopy() {
    console.debug('[PlanPage] Clicking copy button');
    await this.copyButton.click();
  }

  /** Click the AI tools button to navigate to tools page */
  async clickToolsButton() {
    console.debug('[PlanPage] Clicking tools button');
    await this.toolsButton.click();
  }

  /** Go back to index page */
  async goBack() {
    console.debug('[PlanPage] Clicking back button');
    await this.backButton.click();
  }

  /** Check if loading spinner is visible */
  async isLoading(): Promise<boolean> {
    return this.loadingSpinner.isVisible();
  }

  /** Check if error banner is visible */
  async hasError(): Promise<boolean> {
    return this.errorBanner.isVisible();
  }

  /** Click retry button on error banner */
  async clickRetry() {
    console.debug('[PlanPage] Clicking retry');
    await this.retryButton.click();
  }
}
