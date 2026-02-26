import type { App, Plugin } from 'vue';
import type { Router } from 'vue-router';
import posthog from 'posthog-js';
import { markAnalyticsInitialized } from '@/composables/useAnalytics';

export interface PostHogPluginOptions {
  apiKey: string;
  host?: string;
  router?: Router;
}

export const posthogPlugin: Plugin<PostHogPluginOptions> = {
  install(app: App, options: PostHogPluginOptions) {
    if (!options.apiKey) {
      console.debug('[PostHog] Plugin disabled (no API key)');
      return;
    }

    console.debug('[PostHog] Initializing', { host: options.host });

    posthog.init(options.apiKey, {
      api_host: options.host || 'https://us.i.posthog.com',
      capture_pageview: false, // We handle pageviews via router
      capture_pageleave: true,
      // Note: for EU audiences, consider adding a cookie consent banner
      // or switching to persistence: 'memory' for cookieless tracking
      persistence: 'localStorage',
    });

    markAnalyticsInitialized();
    console.info('[PostHog] Initialized successfully');

    // Auto-track pageviews on route change
    if (options.router) {
      options.router.afterEach((to) => {
        console.debug('[PostHog] Auto-tracking pageview', to.fullPath);
        posthog.capture('$pageview', {
          $current_url: window.location.origin + to.fullPath,
          page_name: String(to.name || ''),
        });
      });
      console.debug('[PostHog] Router pageview tracking registered');
    }

    app.provide('posthog', posthog);
  },
};
