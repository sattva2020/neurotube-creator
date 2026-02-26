/**
 * Custom Playwright fixtures for E2E tests.
 * Auto-instantiates page objects and provides API mock helpers.
 */
import { test as base } from '@playwright/test';
import { IndexPage } from '../pages/IndexPage';
import { PlanPage } from '../pages/PlanPage';
import { ToolsPage } from '../pages/ToolsPage';
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
} from '../helpers/api-mock';

/** Extended test fixtures with page objects and mock helpers */
type TestFixtures = {
  indexPage: IndexPage;
  planPage: PlanPage;
  toolsPage: ToolsPage;
  /** Set up all common API mocks (ideas, plans, tools) */
  setupMocks: () => Promise<void>;
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

  setupMocks: async ({ page }, use) => {
    const setup = async () => {
      console.debug('[fixtures] Setting up all API mocks');
      await mockAllApiRoutes(page);
    };
    await use(setup);
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
    });
  },
});

export { expect } from '@playwright/test';
