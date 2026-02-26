import { describe, it, expect } from 'vitest';
import { IndexPage } from '../IndexPage';
import { PlanPage } from '../PlanPage';
import { ToolsPage } from '../ToolsPage';

// We test structure and constructor signatures without a real Playwright Page.
// Page objects should be constructible and expose the expected API shape.

describe('Page Object Models: structure', () => {
  describe('IndexPage', () => {
    it('constructor requires a Page argument', () => {
      expect(IndexPage.length).toBe(1);
    });

    it('prototype has expected action methods', () => {
      const methods = Object.getOwnPropertyNames(IndexPage.prototype).filter(
        (m) => m !== 'constructor',
      );

      const expectedMethods = [
        'goto',
        'selectNiche',
        'searchTopic',
        'clickPresetChip',
        'waitForIdeas',
        'getIdeaCardsCount',
        'clickIdeaCard',
        'clickGeneratePlan',
        'isLoading',
        'hasError',
        'getErrorText',
      ];

      for (const method of expectedMethods) {
        expect(methods).toContain(method);
      }
    });
  });

  describe('PlanPage', () => {
    it('constructor requires a Page argument', () => {
      expect(PlanPage.length).toBe(1);
    });

    it('prototype has expected action methods', () => {
      const methods = Object.getOwnPropertyNames(PlanPage.prototype).filter(
        (m) => m !== 'constructor',
      );

      const expectedMethods = [
        'goto',
        'gotoWithId',
        'waitForPlan',
        'getTitle',
        'getMarkdownContent',
        'clickCopy',
        'clickToolsButton',
        'goBack',
        'isLoading',
        'hasError',
        'clickRetry',
      ];

      for (const method of expectedMethods) {
        expect(methods).toContain(method);
      }
    });
  });

  describe('ToolsPage', () => {
    it('constructor requires a Page argument', () => {
      expect(ToolsPage.length).toBe(1);
    });

    it('prototype has expected action methods', () => {
      const methods = Object.getOwnPropertyNames(ToolsPage.prototype).filter(
        (m) => m !== 'constructor',
      );

      const expectedMethods = [
        'goto',
        'getToolCardsCount',
        'openTool',
        'waitForDialog',
        'closeDialog',
        'submitDialog',
        'getDialogContent',
        'hasToolResult',
        'isDialogLoading',
        'goBack',
        'closeDialogByEscape',
      ];

      for (const method of expectedMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
