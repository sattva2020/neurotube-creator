/**
 * Custom Playwright fixtures for E2E tests.
 * Auto-instantiates page objects and provides API mock helpers.
 */
import { test as base } from '@playwright/test';
import { IndexPage } from '../pages/IndexPage';
import { PlanPage } from '../pages/PlanPage';
import { ToolsPage } from '../pages/ToolsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AdminPage } from '../pages/AdminPage';
import {
  mockAllApiRoutes,
  mockIdeasGeneration,
  mockPlanGeneration,
  mockApiError,
  mockIdeasList,
  mockPlansList,
  mockIdeaDelete,
  mockPlanDelete,
  mockIdeaById,
  mockPlanById,
  mockTitlesGeneration,
  mockDescriptionGeneration,
  mockBrandingGeneration,
  mockShortsGeneration,
  mockMarkdownTool,
  mockAllAuthRoutes,
  mockAuthLogin,
  mockAuthRegister,
  mockAuthLogout,
  mockAuthMe,
  mockAdminUsers,
  injectAuthTokens,
} from '../helpers/api-mock';

/** Extended test fixtures with page objects and mock helpers */
type TestFixtures = {
  indexPage: IndexPage;
  planPage: PlanPage;
  toolsPage: ToolsPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  adminPage: AdminPage;
  /** Set up all common API mocks (ideas, plans, tools) */
  setupMocks: () => Promise<void>;
  /** Set up all auth API mocks */
  setupAuthMocks: () => Promise<void>;
  /** Inject auth tokens into localStorage for authenticated state */
  injectAuth: () => Promise<void>;
  /** Mock helpers for fine-grained control */
  mocks: {
    ideasGeneration: typeof mockIdeasGeneration;
    planGeneration: typeof mockPlanGeneration;
    ideasList: typeof mockIdeasList;
    plansList: typeof mockPlansList;
    ideaDelete: typeof mockIdeaDelete;
    planDelete: typeof mockPlanDelete;
    ideaById: typeof mockIdeaById;
    planById: typeof mockPlanById;
    titlesGeneration: typeof mockTitlesGeneration;
    descriptionGeneration: typeof mockDescriptionGeneration;
    brandingGeneration: typeof mockBrandingGeneration;
    shortsGeneration: typeof mockShortsGeneration;
    markdownTool: typeof mockMarkdownTool;
    apiError: typeof mockApiError;
    authLogin: typeof mockAuthLogin;
    authRegister: typeof mockAuthRegister;
    authLogout: typeof mockAuthLogout;
    authMe: typeof mockAuthMe;
    adminUsers: typeof mockAdminUsers;
  };
};

export const test = base.extend<TestFixtures>({
  indexPage: async ({ page }, use) => {
    console.debug('[fixtures] Creating IndexPage');
    const indexPage = new IndexPage(page);
    await use(indexPage);
  },

  planPage: async ({ page }, use) => {
    console.debug('[fixtures] Creating PlanPage');
    const planPage = new PlanPage(page);
    await use(planPage);
  },

  toolsPage: async ({ page }, use) => {
    console.debug('[fixtures] Creating ToolsPage');
    const toolsPage = new ToolsPage(page);
    await use(toolsPage);
  },

  loginPage: async ({ page }, use) => {
    console.debug('[fixtures] Creating LoginPage');
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  registerPage: async ({ page }, use) => {
    console.debug('[fixtures] Creating RegisterPage');
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  adminPage: async ({ page }, use) => {
    console.debug('[fixtures] Creating AdminPage');
    const adminPage = new AdminPage(page);
    await use(adminPage);
  },

  setupMocks: async ({ page }, use) => {
    const setup = async () => {
      console.debug('[fixtures] Setting up all API mocks');
      await mockAllApiRoutes(page);
    };
    await use(setup);
  },

  setupAuthMocks: async ({ page }, use) => {
    const setup = async () => {
      console.debug('[fixtures] Setting up all auth API mocks');
      await mockAllAuthRoutes(page);
    };
    await use(setup);
  },

  injectAuth: async ({ page }, use) => {
    const inject = async () => {
      console.debug('[fixtures] Injecting auth tokens');
      await injectAuthTokens(page);
    };
    await use(inject);
  },

  mocks: async ({ page }, use) => {
    console.debug('[fixtures] Providing mock helpers');
    await use({
      ideasGeneration: (p, ideas?) => mockIdeasGeneration(p ?? page, ideas),
      planGeneration: (p, plan?) => mockPlanGeneration(p ?? page, plan),
      ideasList: (p, ideas?) => mockIdeasList(p ?? page, ideas),
      plansList: (p, plans?) => mockPlansList(p ?? page, plans),
      ideaDelete: (p?) => mockIdeaDelete(p ?? page),
      planDelete: (p?) => mockPlanDelete(p ?? page),
      ideaById: (p, idea?) => mockIdeaById(p ?? page, idea),
      planById: (p, plan?) => mockPlanById(p ?? page, plan),
      titlesGeneration: (p, titles?) => mockTitlesGeneration(p ?? page, titles),
      descriptionGeneration: (p, desc?) => mockDescriptionGeneration(p ?? page, desc),
      brandingGeneration: (p, brand?) => mockBrandingGeneration(p ?? page, brand),
      shortsGeneration: (p, shorts?) => mockShortsGeneration(p ?? page, shorts),
      markdownTool: (p, endpoint, md?) => mockMarkdownTool(p ?? page, endpoint, md),
      apiError: (p, url, status, msg?) => mockApiError(p ?? page, url, status, msg),
      authLogin: (p, auth?) => mockAuthLogin(p ?? page, auth),
      authRegister: (p, auth?) => mockAuthRegister(p ?? page, auth),
      authLogout: (p?) => mockAuthLogout(p ?? page),
      authMe: (p, user?) => mockAuthMe(p ?? page, user),
      adminUsers: (p, users?) => mockAdminUsers(p ?? page, users),
    });
  },
});

export { expect } from '@playwright/test';
