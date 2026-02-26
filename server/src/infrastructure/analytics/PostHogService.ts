import { PostHog } from 'posthog-node';
import { createLogger } from '../logger.js';

const logger = createLogger('PostHogService');

export interface AnalyticsEvent {
  event: string;
  distinctId?: string;
  properties?: Record<string, unknown>;
}

export interface ApiCallEvent {
  method: string;
  path: string;
  status: number;
  elapsed: number;
  niche?: string;
  routeGroup?: string;
}

export class PostHogService {
  private client: PostHog | null = null;
  private enabled: boolean;

  constructor(apiKey: string, host: string) {
    this.enabled = Boolean(apiKey);

    if (!this.enabled) {
      logger.info('PostHog analytics disabled (no API key)');
      return;
    }

    logger.debug('Initializing PostHog client', { host });
    this.client = new PostHog(apiKey, { host });
    logger.info('PostHog analytics initialized', { host });
  }

  trackEvent({ event, distinctId = 'server', properties }: AnalyticsEvent): void {
    if (!this.client) {
      logger.debug('Skipping event (analytics disabled)', { event });
      return;
    }

    logger.debug('Tracking event', { event, distinctId, properties });
    this.client.capture({
      distinctId,
      event,
      properties,
    });
  }

  trackApiCall(data: ApiCallEvent): void {
    this.trackEvent({
      event: 'api_call',
      distinctId: 'server',
      properties: {
        method: data.method,
        path: data.path,
        status: data.status,
        elapsed_ms: data.elapsed,
        niche: data.niche,
        route_group: data.routeGroup,
      },
    });
  }

  async shutdown(): Promise<void> {
    if (!this.client) {
      logger.debug('Shutdown skipped (analytics disabled)');
      return;
    }

    logger.info('Flushing PostHog events and shutting down');
    await this.client.shutdown();
    logger.info('PostHog shutdown complete');
  }
}
