import 'reflect-metadata';

import { Controller } from '@kiqjs/core';

import {
  HttpMethod,
  META_PARAM_METADATA,
  META_REQUEST_MAPPING,
  META_REST_CONTROLLER,
  META_ROUTE_HANDLER,
  ParamMetadata,
  ParamDecoratorOptions,
  RequestMappingMetadata,
  RouteHandlerMetadata,
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
  return function (nameOrOptions?: string | ParamDecoratorOptions, legacyRequired?: boolean) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
      const existingParams: ParamMetadata[] =
        Reflect.getMetadata(META_PARAM_METADATA, target, propertyKey) || [];

      // Parse options from either new API or legacy API
      let name: string | undefined;
      let required: boolean = true;
      let defaultValue: any = undefined;

      if (typeof nameOrOptions === 'string') {
        // Legacy API: @RequestParam('name', false)
        name = nameOrOptions;
        if (legacyRequired !== undefined) {
          required = legacyRequired;
        }
      } else if (typeof nameOrOptions === 'object' && nameOrOptions !== null) {
        // New API: @RequestParam({ name: 'name', required: false, defaultValue: '1' })
        name = nameOrOptions.name;
        required = nameOrOptions.required !== undefined ? nameOrOptions.required : true;
        defaultValue = nameOrOptions.defaultValue;
      }

      const param: ParamMetadata = {
        index: parameterIndex,
        type,
        name,
        required,
        defaultValue,
      };

      // Check if @Valid() was used on this parameter
      // @Valid() runs before this decorator (right-to-left execution)
      const key = Symbol.for(`kiq:http:dto-class:${propertyKey}:${parameterIndex}`);
      const dtoClass = Reflect.getMetadata(key, target);
      if (dtoClass) {
        param.dtoClass = dtoClass;
      }

      existingParams.push(param);

      Reflect.defineMetadata(META_PARAM_METADATA, existingParams, target, propertyKey);
    };
  };
}

/**
 * Binds method parameter to request body (Spring-like).
 *
 * @example Without validation:
 * ```typescript
 * @PostMapping()
 * createUser(@RequestBody() user: any) {
 *   return user;
 * }
 * ```
 *
 * @example With validation (use with @Valid()):
 * ```typescript
 * class CreateUserDto {
 *   @IsString()
 *   @MinLength(3)
 *   name: string;
 *
 *   @IsEmail()
 *   email: string;
 * }
 *
 * @PostMapping()
 * createUser(@RequestBody() @Valid() user: CreateUserDto) {
 *   // user is automatically validated and transformed
 *   return user;
 * }
 * ```
 */
export const RequestBody = createParamDecorator('body');

/**
 * Marks a parameter for automatic validation using class-validator (Spring-like).
 * Must be used together with @RequestBody() decorator.
 *
 * @example
 * ```typescript
 * class CreateUserDto {
 *   @IsString()
 *   @MinLength(3)
 *   name: string;
 *
 *   @IsEmail()
 *   email: string;
 * }
 *
 * @PostMapping()
 * createUser(@RequestBody() @Valid() user: CreateUserDto) {
 *   // user is validated and transformed to CreateUserDto instance
 *   return user;
 * }
 * ```
 */
export function Valid() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    // Get the parameter type from TypeScript metadata
    const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
    const dtoClass = paramTypes[parameterIndex];

    // Store the DTO class for this specific parameter using a unique key
    // Since decorators execute right-to-left, @Valid() runs before @RequestBody()
    // We store the class here, and @RequestBody() will retrieve it
    const key = Symbol.for(`kiq:http:dto-class:${propertyKey}:${parameterIndex}`);
    Reflect.defineMetadata(key, dtoClass, target);
  };
}

/**
 * Binds method parameter to multipart file upload (Spring-like).
 *
 * @example
 * ```typescript
 * @PostMapping()
 * uploadFile(@RequestPart('file') file: File) {
 *   return { uploaded: true };
 * }
 * ```
 */
export const RequestPart = createParamDecorator('files');

/**
 * Binds method parameter to path variable (Spring-like).
 *
 * @param nameOrOptions Path variable name or options object
 *
 * @example
 * ```typescript
 * @GetMapping('/:id')
 * getUser(@PathVariable('id') id: string) {
 *   return { id };
 * }
 * ```
 *
 * @example With defaultValue:
 * ```typescript
 * @GetMapping('/:id?')
 * getUser(@PathVariable({ name: 'id', required: false, defaultValue: '0' }) id: string) {
 *   return { id };
 * }
 * ```
 */
export const PathVariable = createParamDecorator('param');

/**
 * Binds method parameter to query parameter (Spring-like).
 *
 * @param nameOrOptions Query parameter name or options object
 *
 * @example Basic usage:
 * ```typescript
 * @GetMapping()
 * searchUsers(@RequestParam('query') query: string) {
 *   return [];
 * }
 * ```
 *
 * @example With required and defaultValue (Spring Boot style):
 * ```typescript
 * @GetMapping()
 * searchUsers(
 *   @RequestParam({ name: 'page', required: false, defaultValue: '1' }) page: string,
 *   @RequestParam({ name: 'limit', required: false, defaultValue: '10' }) limit: string
 * ) {
 *   return [];
 * }
 * ```
 */
export const RequestParam = createParamDecorator('query');

/**
 * Binds method parameter to request header (Spring-like).
 *
 * @param nameOrOptions Header name or options object
 *
 * @example
 * ```typescript
 * @GetMapping()
 * getProfile(@RequestHeader('Authorization') token: string) {
 *   return { token };
 * }
 * ```
 *
 * @example With defaultValue:
 * ```typescript
 * @GetMapping()
 * getProfile(@RequestHeader({ name: 'Content-Type', required: false, defaultValue: 'application/json' }) contentType: string) {
 *   return { contentType };
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
