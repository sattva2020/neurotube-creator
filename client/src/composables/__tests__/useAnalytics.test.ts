import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
  },
}));

import posthog from 'posthog-js';
import { useAnalytics, markAnalyticsInitialized } from '../useAnalytics';

describe('useAnalytics (enabled)', () => {
  beforeEach(() => {
    vi.mocked(posthog.capture).mockClear();
    markAnalyticsInitialized();
  });

  describe('trackEvent', () => {
    it('captures event with properties', () => {
      const { trackEvent } = useAnalytics();

      trackEvent('niche_toggled', { niche: 'ambient' });

      expect(posthog.capture).toHaveBeenCalledOnce();
      expect(posthog.capture).toHaveBeenCalledWith('niche_toggled', { niche: 'ambient' });
    });

    it('captures event without properties', () => {
      const { trackEvent } = useAnalytics();

      trackEvent('tool_opened');

      expect(posthog.capture).toHaveBeenCalledWith('tool_opened', undefined);
    });
  });

  describe('trackPageView', () => {
    it('captures $pageview with path and name', () => {
      const { trackPageView } = useAnalytics();

      trackPageView('/plan/123', 'plan');

      expect(posthog.capture).toHaveBeenCalledWith('$pageview', {
        $current_url: expect.stringContaining('/plan/123'),
        page_name: 'plan',
      });
    });
  });
});
