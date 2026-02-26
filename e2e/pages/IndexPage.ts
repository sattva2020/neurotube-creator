/**
 * Page Object Model for IndexPage (/).
 * Provides locators and actions for the home page:
 * niche toggle, idea search, idea cards, saved history.
 */
import type { Locator, Page } from '@playwright/test';

export class IndexPage {
  readonly page: Page;

  // Niche toggle
  readonly nicheToggle: Locator;
  readonly psychologyBtn: Locator;
  readonly ambientBtn: Locator;

  // Search form
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchForm: Locator;

  // Preset chips
  readonly presetChips: Locator;

  // Loading & error states
  readonly loadingIndicator: Locator;
  readonly errorBanner: Locator;

  // Idea cards (generated results)
  readonly ideaCards: Locator;

  // History section (saved ideas)
  readonly historySection: Locator;
  readonly historyCards: Locator;
  readonly deleteButtons: Locator;

  constructor(page: Page) {
    this.page = page;

    // Niche toggle — QBtnToggle with class .niche-toggle
    this.nicheToggle = page.locator('.niche-toggle');
    this.psychologyBtn = this.nicheToggle.locator('.q-btn').filter({ hasText: 'Психология' });
    this.ambientBtn = this.nicheToggle.locator('.q-btn').filter({ hasText: 'Эмбиент' });

    // Search form
    this.searchForm = page.locator('.q-form');
    this.searchInput = page.locator('.q-input input[type="text"]').first();
    this.searchButton = page.locator('.q-input .q-btn[type="submit"]');

    // Preset chips
    this.presetChips = page.locator('.q-chip');

    // Loading
    this.loadingIndicator = page.locator('.q-spinner, .q-linear-progress');

    // Error banner
    this.errorBanner = page.locator('.q-banner.bg-negative');

    // Idea cards — generated results displayed as QCards
    this.ideaCards = page.locator('.q-card').filter({ has: page.locator('.q-badge') });

    // History — saved ideas section with delete buttons
    this.historySection = page.locator('[class*="history"], [data-testid="history"]').first();
    this.historyCards = page.locator('.q-card').filter({ has: page.locator('.q-badge') });
    this.deleteButtons = page.locator('.q-btn[aria-label="delete"], .q-btn .material-icons:has-text("delete")').locator('..');
  }

  /** Navigate to the index page */
  async goto() {
    console.debug('[IndexPage] Navigating to /');
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    console.debug('[IndexPage] Page loaded');
  }

  /** Select a niche (psychology or ambient) */
  async selectNiche(niche: 'psychology' | 'ambient') {
    console.debug(`[IndexPage] Selecting niche: ${niche}`);
    const btn = niche === 'psychology' ? this.psychologyBtn : this.ambientBtn;
    await btn.click();
  }

  /** Type a topic into the search input and submit */
  async searchTopic(topic: string) {
    console.debug(`[IndexPage] Searching for topic: "${topic}"`);
    await this.searchInput.fill(topic);
    await this.searchButton.click();
  }

  /** Click a preset chip by text */
  async clickPresetChip(text: string) {
    console.debug(`[IndexPage] Clicking preset chip: "${text}"`);
    await this.presetChips.filter({ hasText: text }).first().click();
  }

  /** Wait for ideas to appear after search */
  async waitForIdeas() {
    console.debug('[IndexPage] Waiting for idea cards to appear');
    await this.ideaCards.first().waitFor({ state: 'visible', timeout: 15_000 });
    console.debug('[IndexPage] Idea cards visible');
  }

  /** Get the count of displayed idea cards */
  async getIdeaCardsCount(): Promise<number> {
    const count = await this.ideaCards.count();
    console.debug(`[IndexPage] Idea cards count: ${count}`);
    return count;
  }

  /** Click an idea card by index */
  async clickIdeaCard(index: number) {
    console.debug(`[IndexPage] Clicking idea card at index: ${index}`);
    await this.ideaCards.nth(index).click();
  }

  /** Click "Generate Plan" button on an idea card */
  async clickGeneratePlan(index: number) {
    console.debug(`[IndexPage] Clicking "Generate Plan" on card ${index}`);
    const card = this.ideaCards.nth(index);
    await card.locator('.q-btn').filter({ hasText: /план|plan/i }).click();
  }

  /** Check if loading indicator is visible */
  async isLoading(): Promise<boolean> {
    return this.loadingIndicator.isVisible();
  }

  /** Check if error banner is visible */
  async hasError(): Promise<boolean> {
    return this.errorBanner.isVisible();
  }

  /** Get the error banner text */
  async getErrorText(): Promise<string> {
    return this.errorBanner.innerText();
  }
}
