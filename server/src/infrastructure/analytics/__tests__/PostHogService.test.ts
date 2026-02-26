import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCapture = vi.fn();
const mockShutdown = vi.fn().mockResolvedValue(undefined);

vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: mockCapture,
    shutdown: mockShutdown,
  })),
}));

import { PostHogService } from '../PostHogService.js';

describe('PostHogService', () => {
  beforeEach(() => {
    mockCapture.mockClear();
    mockShutdown.mockClear();
  });

  describe('when API key is provided', () => {
    it('tracks events via PostHog client', () => {
      const service = new PostHogService('phc_test_key', 'https://test.posthog.com');

      service.trackEvent({ event: 'test_event', properties: { foo: 'bar' } });

      expect(mockCapture).toHaveBeenCalledOnce();
      expect(mockCapture).toHaveBeenCalledWith({
        distinctId: 'server',
        event: 'test_event',
        properties: { foo: 'bar' },
      });
    });

    it('tracks API calls with structured properties', () => {
      const service = new PostHogService('phc_test_key', 'https://test.posthog.com');

      service.trackApiCall({
        method: 'POST',
        path: '/api/ideas/generate',
        status: 200,
        elapsed: 150,
        niche: 'psychology',
        routeGroup: 'ideas',
      });

      expect(mockCapture).toHaveBeenCalledWith({
        distinctId: 'server',
        event: 'api_call',
        properties: {
          method: 'POST',
          path: '/api/ideas/generate',
          status: 200,
          elapsed_ms: 150,
          niche: 'psychology',
          route_group: 'ideas',
        },
      });
    });

    it('uses custom distinctId when provided', () => {
      const service = new PostHogService('phc_test_key', 'https://test.posthog.com');

      service.trackEvent({ event: 'custom', distinctId: 'user-123' });

      expect(mockCapture).toHaveBeenCalledWith(
        expect.objectContaining({ distinctId: 'user-123' }),
      );
    });

    it('flushes and shuts down on shutdown()', async () => {
      const service = new PostHogService('phc_test_key', 'https://test.posthog.com');

      await service.shutdown();

      expect(mockShutdown).toHaveBeenCalledOnce();
    });
  });

  describe('when API key is empty (disabled)', () => {
    it('does not track events', () => {
      const service = new PostHogService('', 'https://test.posthog.com');

      service.trackEvent({ event: 'test_event' });

      expect(mockCapture).not.toHaveBeenCalled();
    });

    it('does not track API calls', () => {
      const service = new PostHogService('', 'https://test.posthog.com');

      service.trackApiCall({
        method: 'GET',
        path: '/api/health',
        status: 200,
        elapsed: 5,
      });

      expect(mockCapture).not.toHaveBeenCalled();
    });

    it('shutdown is a no-op', async () => {
      const service = new PostHogService('', 'https://test.posthog.com');

      await service.shutdown();

      expect(mockShutdown).not.toHaveBeenCalled();
    });
  });
});
