/**
 * Page Object Model for LoginPage (/login).
 */
import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"], .q-input input').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.submitButton = page.locator('.q-btn').filter({ hasText: 'Войти' });
    this.errorBanner = page.locator('.q-banner');
    this.registerLink = page.locator('a').filter({ hasText: 'Зарегистрироваться' });
  }

  async goto() {
    console.debug('[LoginPage] Navigating to /login');
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
    console.debug('[LoginPage] Page loaded');
  }

  async login(email: string, password: string) {
    console.debug(`[LoginPage] Logging in as ${email}`);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
