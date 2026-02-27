/**
 * Page Object Model for IndexPage (/).
 * Provides locators and actions for the home page:
 * niche toggle, idea search, idea cards, neural background, features section.
 */
import type { Locator, Page } from '@playwright/test';

export class IndexPage {
  readonly page: Page;

  // Niche toggle (custom .niche-toggle with .niche-btn)
  readonly nicheToggle: Locator;
  readonly psychologyBtn: Locator;
  readonly ambientBtn: Locator;

  // Search form
  readonly searchForm: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  // Preset chips
  readonly presetChips: Locator;

  // Loading & error states
  readonly loadingIndicator: Locator;
  readonly errorBanner: Locator;

  // Idea cards (generated results — .idea-card-wrapper)
  readonly ideaCards: Locator;

  // History section (saved ideas)
  readonly historySection: Locator;
  readonly historyCards: Locator;
  readonly deleteButtons: Locator;

  // Neuro design elements
  readonly neuralCanvas: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly featuresSection: Locator;

  constructor(page: Page) {
    this.page = page;

    // Niche toggle — custom .niche-toggle with .niche-btn buttons
    this.nicheToggle = page.locator('.niche-toggle');
    this.psychologyBtn = this.nicheToggle.locator('.niche-btn').filter({ hasText: 'Психология' });
    this.ambientBtn = this.nicheToggle.locator('.niche-btn').filter({ hasText: 'Эмбиент' });

    // Search form
    this.searchForm = page.locator('.search-form');
    this.searchInput = page.locator('.search-input input').first();
    this.searchButton = page.locator('.search-btn');

    // Preset chips — .neuro-chip inside .chips-wrapper
    this.presetChips = page.locator('.chips-wrapper .neuro-chip');

    // Loading indicator
    this.loadingIndicator = page.locator('.q-spinner, .q-linear-progress');

    // Error banner
    this.errorBanner = page.locator('.error-banner');

    // Idea cards — .idea-card-wrapper elements
    this.ideaCards = page.locator('.idea-card-wrapper');

    // History
    this.historySection = page.locator('.ideas-section');
    this.historyCards = page.locator('.idea-card-wrapper');
    this.deleteButtons = page.locator('.q-btn').filter({ has: page.locator('i.material-icons:has-text("delete")') });

    // Neuro design elements
    this.neuralCanvas = page.locator('canvas.neural-bg');
    this.heroTitle = page.locator('.hero-title');
    this.heroSubtitle = page.locator('.hero-subtitle');
    this.featuresSection = page.locator('.features-section');
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

  /** Click "Сгенерировать план" button on an idea card */
  async clickGeneratePlan(index: number) {
    console.debug(`[IndexPage] Clicking "Generate Plan" on card ${index}`);
    const card = this.ideaCards.nth(index);
    await card.locator('.idea-card__plan-btn').click();
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

  /** Check whether the dark neuro-theme body class is applied */
  async hasDarkTheme(): Promise<boolean> {
    const cls = await this.page.locator('body').getAttribute('class');
    return (cls ?? '').includes('neuro-theme');
  }

  /** Scroll to features section */
  async scrollToFeatures() {
    console.debug('[IndexPage] Scrolling to features section');
    await this.featuresSection.scrollIntoViewIfNeeded();
  }
}
