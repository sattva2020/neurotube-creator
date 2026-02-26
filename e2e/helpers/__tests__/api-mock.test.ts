import { describe, it, expect } from 'vitest';
import * as apiMock from '../api-mock';

describe('api-mock: exported functions', () => {
  const expectedMockFunctions = [
    'mockIdeasGeneration',
    'mockPlanGeneration',
    'mockTitlesGeneration',
    'mockDescriptionGeneration',
    'mockBrandingGeneration',
    'mockShortsGeneration',
    'mockMarkdownTool',
    'mockIdeasList',
    'mockIdeaById',
    'mockIdeaDelete',
    'mockPlansList',
    'mockPlanById',
    'mockPlanDelete',
    'mockHealth',
    'mockApiError',
    'mockAllApiRoutes',
  ];

  it('exports all expected mock functions', () => {
    for (const fn of expectedMockFunctions) {
      expect(apiMock).toHaveProperty(fn);
      expect(typeof (apiMock as Record<string, unknown>)[fn]).toBe('function');
    }
  });

  it('all exported values are functions', () => {
    for (const [key, value] of Object.entries(apiMock)) {
      expect(typeof value).toBe('function');
    }
  });

  describe('function signatures', () => {
    it('mockIdeasGeneration accepts page as first argument', () => {
      expect(apiMock.mockIdeasGeneration.length).toBeGreaterThanOrEqual(1);
    });

    it('mockPlanGeneration accepts page as first argument', () => {
      expect(apiMock.mockPlanGeneration.length).toBeGreaterThanOrEqual(1);
    });

    it('mockApiError accepts page, urlPattern, status', () => {
      expect(apiMock.mockApiError.length).toBeGreaterThanOrEqual(3);
    });

    it('mockAllApiRoutes accepts page as first argument', () => {
      expect(apiMock.mockAllApiRoutes.length).toBe(1);
    });

    it('mockMarkdownTool accepts page and endpoint', () => {
      expect(apiMock.mockMarkdownTool.length).toBeGreaterThanOrEqual(2);
    });
  });
});
