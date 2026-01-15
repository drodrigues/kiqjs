import 'reflect-metadata';

import { getConfiguration } from '@kiqjs/core';
import { Context, Next } from 'koa';

import { KiqError } from './exceptions';
import { META_SECURITY, SecurityMetadata } from './metadata-keys';

/**
 * Security decorator - marks a route as requiring authentication
 *
 * Routes marked with @Security will return 403 unless they match a public URL pattern
 * configured in application.yml under server.security.public
 *
 * @example
 * ```typescript
 * @RestController('/api/users')
 * class UserController {
 *   @GetMapping('/:id')
 *   @Security()
 *   getUser(@PathVariable('id') id: string) {
 *     // Requires authentication
 *   }
 *
 *   @GetMapping('/health')
 *   healthCheck() {
 *     // Public - no @Security decorator
 *   }
 * }
 * ```
 */
export function Security(): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const metadata: SecurityMetadata = {
      requiresAuth: true,
    };
    Reflect.defineMetadata(META_SECURITY, metadata, target, propertyKey);
    return descriptor;
  };
}

/**
 * Check if a route requires authentication based on @Security decorator
 */
export function requiresAuthentication(target: any, propertyKey: string | symbol): boolean {
  const metadata = Reflect.getMetadata(META_SECURITY, target, propertyKey) as
    | SecurityMetadata
    | undefined;
  return metadata?.requiresAuth ?? false;
}

/**
 * Check if a URL is public based on configuration
 *
 * Reads from server.security.public in application.yml
 * Supports:
 * - Exact matches: /health-check
 * - Wildcard patterns: /posts, /posts/, /news/show
 *
 * @param url The URL path to check
 * @returns true if the URL is public
 */
export function isPublicUrl(url: string): boolean {
  try {
    const config = getConfiguration();
    const publicUrls = config.get<string[]>('server.security.public', []);

    return publicUrls.some((pattern) => matchesPattern(url, pattern));
  } catch {
    // Configuration not loaded, all URLs are private by default
    return false;
  }
}

/**
 * Match a URL against a pattern
 *
 * Supports exact matches and wildcard patterns
 *
 * @param url The URL to match
 * @param pattern The pattern to match against
 * @returns true if the URL matches the pattern
 */
function matchesPattern(url: string, pattern: string): boolean {
  // Remove query string and trailing slash for comparison
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');
  const cleanPattern = pattern.replace(/\/$/, '');

  // Exact match
  if (cleanPattern === cleanUrl) {
    return true;
  }

  // Convert pattern to regex
  // Escape special regex characters except * and /
  let regexPattern = cleanPattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');

  // Ensure pattern matches from start
  regexPattern = '^' + regexPattern;

  // If pattern ends with *, don't require exact end match
  if (!cleanPattern.endsWith('*')) {
    regexPattern += '$';
  }

  const regex = new RegExp(regexPattern);
  return regex.test(cleanUrl);
}

/**
 * Security middleware factory
 *
 * Creates a Koa middleware that checks if routes require authentication
 * and returns 403 if they do and are not public URLs
 *
 * @example
 * ```typescript
 * const app = new KiqHttpApplication(Application);
 * app.use(createSecurityMiddleware());
 * ```
 */
export function createSecurityMiddleware() {
  return async (ctx: Context, next: Next) => {
    const url = ctx.path;

    // Check if this is a public URL
    if (isPublicUrl(url)) {
      return next();
    }

    // Check if route requires authentication
    // This will be checked during route handling
    // For now, just pass through - the router will check per-route

    await next();
  };
}

/**
 * Check if a request should be allowed based on security settings
 *
 * @param ctx Koa context
 * @param requiresAuth Whether the route requires authentication
 * @throws KiqError with 403 status if access is denied
 */
export function checkSecurity(ctx: Context, requiresAuth: boolean): void {
  // If route doesn't require auth, allow
  if (!requiresAuth) {
    return;
  }

  // Check if URL is public
  if (isPublicUrl(ctx.path)) {
    return;
  }

  // Route requires auth and is not public - deny access
  throw new KiqError('Forbidden: Authentication required', 403);
}
