import 'reflect-metadata';
import { Controller } from '@kiqjs/core';
import {
  META_REST_CONTROLLER,
  META_REQUEST_MAPPING,
  META_ROUTE_HANDLER,
  META_PARAM_METADATA,
  HttpMethod,
  RequestMappingMetadata,
  RouteHandlerMetadata,
  ParamMetadata,
} from './metadata-keys';

// ============================================
// CONTROLLER DECORATORS
// ============================================

/**
 * Marks a class as a REST controller (Spring-like).
 * Automatically registers the class as a @Controller component.
 *
 * @param path Base path for all routes in this controller
 *
 * @example
 * ```typescript
 * @RestController('/users')
 * class UserController {
 *   @GetMapping('/:id')
 *   getUser(@PathVariable('id') id: string) {
 *     return { id, name: 'John' };
 *   }
 * }
 * ```
 */
export function RestController(path: string = '') {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    // Register as a Controller component
    Controller()(target);

    // Mark as REST controller with base path
    Reflect.defineMetadata(META_REST_CONTROLLER, { path }, target);
  };
}

/**
 * Maps HTTP requests to handler methods (Spring-like).
 * Can be used at class level or method level.
 *
 * @param path Request path
 * @param method HTTP method(s)
 *
 * @example
 * ```typescript
 * @RequestMapping('/users', 'GET')
 * getUserList() {
 *   return [];
 * }
 * ```
 */
export function RequestMapping(path: string, method?: HttpMethod | HttpMethod[]) {
  return function (target: any, propertyKey?: string) {
    const metadata: RequestMappingMetadata = { path, method };

    if (propertyKey) {
      // Method level
      Reflect.defineMetadata(META_REQUEST_MAPPING, metadata, target, propertyKey);
    } else {
      // Class level
      Reflect.defineMetadata(META_REQUEST_MAPPING, metadata, target);
    }
  };
}

// ============================================
// HTTP METHOD DECORATORS
// ============================================

function createMethodDecorator(method: HttpMethod) {
  return function (path: string = '') {
    return function (target: any, propertyKey: string) {
      const existingRoutes: RouteHandlerMetadata[] =
        Reflect.getMetadata(META_ROUTE_HANDLER, target.constructor) || [];

      const route: RouteHandlerMetadata = {
        path,
        method,
        propertyKey,
      };

      existingRoutes.push(route);
      Reflect.defineMetadata(META_ROUTE_HANDLER, existingRoutes, target.constructor);
    };
  };
}

/**
 * Maps GET requests to handler method (Spring-like).
 *
 * @param path Request path (relative to controller base path)
 *
 * @example
 * ```typescript
 * @GetMapping('/:id')
 * getUser(@PathVariable('id') id: string) {
 *   return { id, name: 'John' };
 * }
 * ```
 */
export const GetMapping = createMethodDecorator('GET');

/**
 * Maps POST requests to handler method (Spring-like).
 *
 * @param path Request path (relative to controller base path)
 *
 * @example
 * ```typescript
 * @PostMapping()
 * createUser(@RequestBody() user: CreateUserDto) {
 *   return { id: '123', ...user };
 * }
 * ```
 */
export const PostMapping = createMethodDecorator('POST');

/**
 * Maps PUT requests to handler method (Spring-like).
 *
 * @param path Request path (relative to controller base path)
 */
export const PutMapping = createMethodDecorator('PUT');

/**
 * Maps DELETE requests to handler method (Spring-like).
 *
 * @param path Request path (relative to controller base path)
 */
export const DeleteMapping = createMethodDecorator('DELETE');

/**
 * Maps PATCH requests to handler method (Spring-like).
 *
 * @param path Request path (relative to controller base path)
 */
export const PatchMapping = createMethodDecorator('PATCH');

// ============================================
// PARAMETER DECORATORS
// ============================================

function createParamDecorator(type: ParamMetadata['type']) {
  return function (name?: string, required: boolean = true) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
      const existingParams: ParamMetadata[] =
        Reflect.getMetadata(META_PARAM_METADATA, target, propertyKey) || [];

      existingParams.push({
        index: parameterIndex,
        type,
        name,
        required,
      });

      Reflect.defineMetadata(META_PARAM_METADATA, existingParams, target, propertyKey);
    };
  };
}

/**
 * Binds method parameter to request body (Spring-like).
 *
 * @example
 * ```typescript
 * @PostMapping()
 * createUser(@RequestBody() user: CreateUserDto) {
 *   return user;
 * }
 * ```
 */
export const RequestBody = createParamDecorator('body');

/**
 * Binds method parameter to path variable (Spring-like).
 *
 * @param name Path variable name
 *
 * @example
 * ```typescript
 * @GetMapping('/:id')
 * getUser(@PathVariable('id') id: string) {
 *   return { id };
 * }
 * ```
 */
export const PathVariable = createParamDecorator('param');

/**
 * Binds method parameter to query parameter (Spring-like).
 *
 * @param name Query parameter name
 * @param required Whether the parameter is required (default: true)
 *
 * @example
 * ```typescript
 * @GetMapping()
 * searchUsers(@RequestParam('query') query: string) {
 *   return [];
 * }
 * ```
 */
export const RequestParam = createParamDecorator('query');

/**
 * Binds method parameter to request header (Spring-like).
 *
 * @param name Header name
 *
 * @example
 * ```typescript
 * @GetMapping()
 * getProfile(@RequestHeader('Authorization') token: string) {
 *   return { token };
 * }
 * ```
 */
export const RequestHeader = createParamDecorator('header');

/**
 * Injects the Koa context object.
 *
 * @example
 * ```typescript
 * @GetMapping()
 * handle(@Context() ctx: Koa.Context) {
 *   ctx.body = 'Hello';
 * }
 * ```
 */
export const Context = createParamDecorator('ctx');

/**
 * Injects the Koa request object.
 *
 * @example
 * ```typescript
 * @GetMapping()
 * handle(@Request() req: Koa.Request) {
 *   return { method: req.method };
 * }
 * ```
 */
export const Request = createParamDecorator('req');

/**
 * Injects the Koa response object.
 *
 * @example
 * ```typescript
 * @GetMapping()
 * handle(@Response() res: Koa.Response) {
 *   res.status = 201;
 * }
 * ```
 */
export const Response = createParamDecorator('res');
