import type { MiddlewareHandler } from 'hono';
import type { PostHogService } from '../../infrastructure/analytics/index.js';
import { createLogger } from '../../infrastructure/logger.js';

const logger = createLogger('AnalyticsMiddleware');

/** Derive route group from path: /api/ideas/generate → ideas */
function getRouteGroup(path: string): string {
  const match = path.match(/^\/api\/([^/]+)/);
  return match ? match[1] : 'unknown';
}

/** Extract niche from request body if present */
async function extractNiche(c: { req: { raw: Request } }): Promise<string | undefined> {
  try {
    const cloned = c.req.raw.clone();
    const body = (await cloned.json()) as Record<string, unknown>;
    return typeof body?.niche === 'string' ? body.niche : undefined;
  } catch {
    return undefined;
  }
}

export function createAnalyticsMiddleware(analytics: PostHogService): MiddlewareHandler {
  logger.debug('Analytics middleware created');

  return async (c, next) => {
    const { method, path } = c.req;

    // Skip health checks
    if (path === '/api/health' || path.startsWith('/api/health/')) {
      return next();
    }

    // Only track /api/* routes
    if (!path.startsWith('/api/')) {
      return next();
    }

    const start = Date.now();
    // Only parse body for POST /generate endpoints to avoid unnecessary clone overhead
    const shouldExtractNiche = method === 'POST' && path.endsWith('/generate');
    const niche = shouldExtractNiche ? await extractNiche(c) : undefined;

    await next();

    const elapsed = Date.now() - start;
    const status = c.res.status;
    const routeGroup = getRouteGroup(path);

    logger.debug('Tracking API call', { method, path, status, elapsed, routeGroup, niche });

    analytics.trackApiCall({
      method,
      path,
      status,
      elapsed,
      niche,
      routeGroup,
    });
  };
}
