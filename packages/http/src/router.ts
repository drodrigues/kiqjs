import 'reflect-metadata';

import { Container, GlobalRegistry } from '@kiqjs/core';
import Router from '@koa/router';

import Koa from 'koa';
import { ScalarOrArrayFiles } from 'koa-body';

import {
  META_PARAM_METADATA,
  META_REST_CONTROLLER,
  META_ROUTE_HANDLER,
  ParamMetadata,
  RouteHandlerMetadata,
} from './metadata-keys';
import { transformAndValidate } from './validation';

/**
 * Registers all REST controllers with the Koa router.
 *
 * @param container KiqJS container
 * @param router Koa router instance
 */
export function registerControllers(container: Container, router: Router): void {
  const controllers = findRestControllers();

  for (const controller of controllers) {
    registerController(controller, container, router);
  }
}

/**
 * Finds all classes marked with @RestController in the registry.
 */
function findRestControllers(): Function[] {
  const controllers: Function[] = [];
  const providers = GlobalRegistry.instance.list();

  for (const provider of providers) {
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
  }
}

/**
 * Creates a Koa route handler from a controller method.
 */
function createRouteHandler(controllerInstance: any, route: RouteHandlerMetadata) {
  return async (ctx: Koa.Context, next: Koa.Next) => {
    const paramMetadata: ParamMetadata[] =
      Reflect.getMetadata(META_PARAM_METADATA, controllerInstance, route.propertyKey) || [];

    // Sort by index to maintain parameter order
    paramMetadata.sort((a, b) => a.index - b.index);

    // Extract parameters
    const args: any[] = [];
    for (const param of paramMetadata) {
      args[param.index] = await extractParameter(ctx, param);
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
async function extractParameter(ctx: Koa.Context, param: ParamMetadata): Promise<any> {
  switch (param.type) {
    case 'body':
      const body = (ctx.request as any).body;

      // If a DTO class is specified, validate and transform
      if (param.dtoClass) {
        return await transformAndValidate(param.dtoClass, body);
      }

      return body;

    case 'files':
      type TRequest = typeof ctx.request;
      type TRequestWithFiles = TRequest & { files?: ScalarOrArrayFiles };
      const request = ctx.request as TRequestWithFiles;
      if (param.name) {
        const value = (request.files || {})[param.name];
        if (value === undefined || value === null) {
          if (param.defaultValue !== undefined) {
            return param.defaultValue;
          }
          if (param.required) {
            throw new HttpError(400, `File parameter '${param.name}' is required`);
          }
        }
        return value;
      }
      return request.files;

    case 'param':
      if (param.name) {
        const value = ctx.params[param.name];
        if (value === undefined || value === null) {
          if (param.defaultValue !== undefined) {
            return param.defaultValue;
          }
          if (param.required) {
            throw new HttpError(400, `Path variable '${param.name}' is required`);
          }
        }
        return value;
      }
      return ctx.params;

    case 'query':
      if (param.name) {
        const value = ctx.query[param.name];
        if (value === undefined || value === null) {
          if (param.defaultValue !== undefined) {
            return param.defaultValue;
          }
          if (param.required) {
            throw new HttpError(400, `Query parameter '${param.name}' is required`);
          }
        }
        return value;
      }
      return ctx.query;

    case 'header':
      if (param.name) {
        const value = ctx.get(param.name);
        if (!value) {
          if (param.defaultValue !== undefined) {
            return param.defaultValue;
          }
          if (param.required) {
            throw new HttpError(400, `Header '${param.name}' is required`);
          }
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
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
