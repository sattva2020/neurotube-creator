/**
 * Page Object Model for RegisterPage (/register).
 */
import type { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  readonly displayNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.displayNameInput = page.locator('.q-input input').first();
    this.emailInput = page.locator('input[type="email"]').first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    this.submitButton = page.locator('.q-btn').filter({ hasText: 'Зарегистрироваться' });
    this.errorBanner = page.locator('.q-banner');
    this.loginLink = page.locator('a').filter({ hasText: 'Войти' });
  }

  async goto() {
    console.debug('[RegisterPage] Navigating to /register');
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
    console.debug('[RegisterPage] Page loaded');
  }

  async register(displayName: string, email: string, password: string) {
    console.debug(`[RegisterPage] Registering ${email}`);
    await this.displayNameInput.fill(displayName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitButton.click();
  }
}
