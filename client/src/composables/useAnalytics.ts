import posthog from 'posthog-js';

/** Tracks whether PostHog was initialized by our plugin (avoids relying on internal __loaded property) */
let initialized = false;

export function markAnalyticsInitialized(): void {
  initialized = true;
}

export interface TrackEventOptions {
  event: string;
  properties?: Record<string, unknown>;
}

export function useAnalytics() {
  function trackEvent(event: string, properties?: Record<string, unknown>): void {
    if (!initialized) {
      console.debug('[Analytics] Skipping event (disabled)', event);
      return;
    }

    console.debug('[Analytics] Tracking event', event, properties);
    posthog.capture(event, properties);
  }

  function trackPageView(path: string, name?: string): void {
    if (!initialized) {
      console.debug('[Analytics] Skipping pageview (disabled)', path);
      return;
    }

    console.debug('[Analytics] Tracking pageview', { path, name });
    posthog.capture('$pageview', {
      $current_url: window.location.origin + path,
      page_name: name,
    });
  }

  return { trackEvent, trackPageView };
}
