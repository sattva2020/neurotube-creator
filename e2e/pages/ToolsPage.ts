/**
 * Page Object Model for ToolsPage (/tools).
 * Provides locators and actions for the AI tools grid:
 * tool cards, dialogs (open/submit/close), tool results.
 */
import type { Locator, Page } from '@playwright/test';

export class ToolsPage {
  readonly page: Page;

  // Navigation
  readonly backButton: Locator;

  // Tools grid
  readonly toolsGrid: Locator;
  readonly toolCards: Locator;

  // Dialog
  readonly dialog: Locator;
  readonly dialogCard: Locator;
  readonly dialogCloseButton: Locator;
  readonly dialogSubmitButton: Locator;
  readonly dialogLoading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Back button
    this.backButton = page.locator('.q-btn').filter({ has: page.locator('.material-icons:has-text("arrow_back")') });

    // Tools grid — responsive grid with tool cards
    this.toolsGrid = page.locator('.row.q-col-gutter-md').first();
    this.toolCards = page.locator('.q-card').filter({ has: page.locator('.q-card-section') });

    // Dialog (Quasar dialog overlay)
    this.dialog = page.locator('.q-dialog');
    this.dialogCard = this.dialog.locator('.q-card');
    this.dialogCloseButton = this.dialog.locator('.q-btn').filter({ has: page.locator('.material-icons:has-text("close")') });
    this.dialogSubmitButton = this.dialog.locator('.q-btn[type="submit"], .q-btn.bg-primary, .q-btn[class*="primary"]').first();
    this.dialogLoading = this.dialog.locator('.q-spinner, .q-linear-progress');
  }

  /** Navigate to tools page */
  async goto() {
    console.debug('[ToolsPage] Navigating to /tools');
    await this.page.goto('/tools');
    await this.page.waitForLoadState('networkidle');
    console.debug('[ToolsPage] Page loaded');
  }

  /** Get the count of tool cards */
  async getToolCardsCount(): Promise<number> {
    const count = await this.toolCards.count();
    console.debug(`[ToolsPage] Tool cards count: ${count}`);
    return count;
  }

  /** Open a tool by clicking its card (match by text) */
  async openTool(name: string) {
    console.debug(`[ToolsPage] Opening tool: "${name}"`);
    const card = this.toolCards.filter({ hasText: name }).first();
    await card.click();
  }

  /** Wait for the dialog to appear */
  async waitForDialog() {
    console.debug('[ToolsPage] Waiting for dialog');
    await this.dialog.waitFor({ state: 'visible', timeout: 10_000 });
    console.debug('[ToolsPage] Dialog visible');
  }

  /** Close the dialog via close button */
  async closeDialog() {
    console.debug('[ToolsPage] Closing dialog');
    await this.dialogCloseButton.click();
    await this.dialog.waitFor({ state: 'hidden', timeout: 5_000 });
    console.debug('[ToolsPage] Dialog closed');
  }

  /** Submit the dialog form */
  async submitDialog() {
    console.debug('[ToolsPage] Submitting dialog');
    await this.dialogSubmitButton.click();
  }

  /** Get the dialog content text */
  async getDialogContent(): Promise<string> {
    const content = await this.dialogCard.innerText();
    console.debug(`[ToolsPage] Dialog content length: ${content.length}`);
    return content;
  }

  /** Check if a specific tool result is visible in the dialog */
  async hasToolResult(): Promise<boolean> {
    // Tool results are rendered inside the dialog card
    const resultArea = this.dialogCard.locator('.markdown-body, [v-html], pre, .tool-result');
    return resultArea.isVisible();
  }

  /** Check if dialog is loading */
  async isDialogLoading(): Promise<boolean> {
    return this.dialogLoading.isVisible();
  }

  /** Go back to plan page */
  async goBack() {
    console.debug('[ToolsPage] Clicking back button');
    await this.backButton.click();
  }

  /** Close dialog by pressing Escape */
  async closeDialogByEscape() {
    console.debug('[ToolsPage] Closing dialog with Escape key');
    await this.page.keyboard.press('Escape');
    await this.dialog.waitFor({ state: 'hidden', timeout: 5_000 });
    console.debug('[ToolsPage] Dialog closed via Escape');
  }
}
