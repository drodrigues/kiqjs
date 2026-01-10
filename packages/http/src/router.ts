import 'reflect-metadata';
import Koa from 'koa';
import Router from '@koa/router';
import { Container } from '@kiqjs/core';
import {
  META_REST_CONTROLLER,
  META_ROUTE_HANDLER,
  META_PARAM_METADATA,
  RouteHandlerMetadata,
  ParamMetadata,
} from './metadata-keys';

/**
 * Registers all REST controllers with the Koa router.
 *
 * @param container KiqJS container
 * @param router Koa router instance
 */
export function registerControllers(container: Container, router: Router): void {
  const controllers = findRestControllers(container);

  for (const controller of controllers) {
    registerController(controller, container, router);
  }
}

/**
 * Finds all classes marked with @RestController in the container.
 */
function findRestControllers(container: Container): Function[] {
  const controllers: Function[] = [];
  const registry = (container as any).registry;

  if (!registry || !registry.providers) {
    return controllers;
  }

  for (const provider of registry.providers.values()) {
    const token = provider.token;
    if (typeof token === 'function') {
      const metadata = Reflect.getMetadata(META_REST_CONTROLLER, token);
      if (metadata) {
        controllers.push(token);
      }
    }
  }

  return controllers;
}

/**
 * Registers a single controller with the router.
 */
function registerController(controllerClass: Function, container: Container, router: Router): void {
  const controllerMetadata = Reflect.getMetadata(META_REST_CONTROLLER, controllerClass);
  const basePath = controllerMetadata?.path || '';

  const routes: RouteHandlerMetadata[] =
    Reflect.getMetadata(META_ROUTE_HANDLER, controllerClass) || [];

  const controllerInstance = container.get(controllerClass as any);

  for (const route of routes) {
    const fullPath = normalizePath(basePath, route.path);
    const handler = createRouteHandler(controllerInstance, route);

    // Register route with Koa router
    switch (route.method) {
      case 'GET':
        router.get(fullPath, handler);
        break;
      case 'POST':
        router.post(fullPath, handler);
        break;
      case 'PUT':
        router.put(fullPath, handler);
        break;
      case 'DELETE':
        router.delete(fullPath, handler);
        break;
      case 'PATCH':
        router.patch(fullPath, handler);
        break;
      default:
        console.warn(`Unsupported HTTP method: ${route.method}`);
    }

    console.log(`  ${route.method.padEnd(6)} ${fullPath} -> ${controllerClass.name}.${route.propertyKey}`);
  }
}

/**
 * Creates a Koa route handler from a controller method.
 */
function createRouteHandler(
  controllerInstance: any,
  route: RouteHandlerMetadata
): Router.Middleware {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const paramMetadata: ParamMetadata[] =
      Reflect.getMetadata(META_PARAM_METADATA, controllerInstance, route.propertyKey) || [];

    // Sort by index to maintain parameter order
    paramMetadata.sort((a, b) => a.index - b.index);

    // Extract parameters
    const args: any[] = [];
    for (const param of paramMetadata) {
      args[param.index] = extractParameter(ctx, param);
    }

    try {
      // Call controller method
      const result = await controllerInstance[route.propertyKey](...args);

      // Handle response
      if (result !== undefined && result !== null) {
        // If method returns a value and hasn't set ctx.body, set it
        if (ctx.body === undefined) {
          ctx.body = result;
        }
      }

      await next();
    } catch (error: any) {
      // Rethrow to let Koa's error handling middleware catch it
      throw error;
    }
  };
}

/**
 * Extracts a parameter value from the Koa context based on metadata.
 */
function extractParameter(ctx: Koa.Context, param: ParamMetadata): any {
  switch (param.type) {
    case 'body':
      return (ctx.request as any).body;

    case 'param':
      if (param.name) {
        const value = ctx.params[param.name];
        if (param.required && (value === undefined || value === null)) {
          throw new HttpError(400, `Path variable '${param.name}' is required`);
        }
        return value;
      }
      return ctx.params;

    case 'query':
      if (param.name) {
        const value = ctx.query[param.name];
        if (param.required && (value === undefined || value === null)) {
          throw new HttpError(400, `Query parameter '${param.name}' is required`);
        }
        return value;
      }
      return ctx.query;

    case 'header':
      if (param.name) {
        const value = ctx.get(param.name);
        if (param.required && !value) {
          throw new HttpError(400, `Header '${param.name}' is required`);
        }
        return value;
      }
      return ctx.headers;

    case 'ctx':
      return ctx;

    case 'req':
      return ctx.request;

    case 'res':
      return ctx.response;

    default:
      return undefined;
  }
}

/**
 * Normalizes and combines base path with route path.
 */
function normalizePath(...segments: string[]): string {
  const combined = segments
    .filter((s) => s)
    .join('/')
    .replace(/\/+/g, '/');

  return combined.startsWith('/') ? combined : '/' + combined;
}

/**
 * HTTP error class for request validation errors.
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
