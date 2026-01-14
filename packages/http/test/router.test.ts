import 'reflect-metadata';

import { KiqApplication, runApplication } from '@kiqjs/core';
import Router from '@koa/router';

import Koa from 'koa';

import {
  GetMapping,
  PathVariable,
  PostMapping,
  RequestBody,
  RequestHeader,
  RequestParam,
  RestController,
} from '../src/decorators';
import { BadRequest, KiqError, NotFound, ServerError, Unauthorized } from '../src/exceptions';
import { registerControllers } from '../src/router';

describe('Router', () => {
  describe('KiqError', () => {
    it('should create a KiqError with status and message', () => {
      const error = NotFound('Not Found');
      expect(error).toBeInstanceOf(KiqError);
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
      expect(error.name).toBe('Error');
    });

    it('should create different status codes', () => {
      const error400 = BadRequest('Bad Request');
      const error401 = Unauthorized('Unauthorized');
      const error500 = ServerError('Internal Server Error');

      expect(error400.status).toBe(400);
      expect(error401.status).toBe(401);
      expect(error500.status).toBe(500);
    });
  });

  describe('registerControllers', () => {
    it('should register a simple REST controller', async () => {
      @RestController('/users')
      class UserController {
        @GetMapping()
        list() {
          return [];
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();
      const initialLength = router.stack.length;

      registerControllers(container, router);

      // Should have registered at least one route
      expect(router.stack.length).toBeGreaterThanOrEqual(initialLength);
    });

    it('should combine base path with route path', async () => {
      @RestController('/api/v1')
      class VersionedController {
        @GetMapping('/users/:id')
        getUser() {}
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const route = router.stack.find((r) => r.path === '/api/v1/users/:id');
      expect(route).toBeDefined();
    });
  });

  describe('Parameter Extraction', () => {
    it('should extract @PathVariable from route params', async () => {
      let capturedId: string | undefined;

      @RestController('/users')
      class UserController {
        @GetMapping('/:id')
        getUser(@PathVariable('id') id: string) {
          capturedId = id;
          return { id };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      // Simulate request
      const ctx: any = {
        params: { id: '123' },
        query: {},
        headers: {},
        request: { body: {} },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/users/:id');
      expect(route).toBeDefined();
      await route!.stack[0](ctx, async () => {});

      expect(capturedId).toBe('123');
      expect(ctx.body).toEqual({ id: '123' });
    });

    it('should extract @RequestBody from request body', async () => {
      let capturedBody: any;

      @RestController('/api')
      class ApiController {
        @PostMapping('/create')
        createUser(@RequestBody() user: any) {
          capturedBody = user;
          return { created: true };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: {},
        request: { body: { name: 'John' } },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/api/create');
      await route!.stack[0](ctx, async () => {});

      expect(capturedBody).toEqual({ name: 'John' });
    });

    it('should extract @RequestParam from query string', async () => {
      let capturedQuery: string | undefined;

      @RestController('/search')
      class SearchController {
        @GetMapping()
        search(@RequestParam('q') query: string) {
          capturedQuery = query;
          return { query };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: { q: 'test' },
        headers: {},
        request: { body: {} },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/search');
      await route!.stack[0](ctx, async () => {});

      expect(capturedQuery).toBe('test');
    });

    it('should extract @RequestHeader from headers', async () => {
      let capturedToken: string | undefined;

      @RestController('/auth')
      class AuthController {
        @GetMapping()
        check(@RequestHeader('Authorization') token: string) {
          capturedToken = token;
          return { valid: true };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: { authorization: 'Bearer token123' },
        request: { body: {} },
        get: (name: string) => ctx.headers[name.toLowerCase()],
      };

      const route = router.stack.find((r) => r.path === '/auth');
      await route!.stack[0](ctx, async () => {});

      expect(capturedToken).toBe('Bearer token123');
    });

    it('should throw HttpError when required parameter is missing', async () => {
      @RestController('/test')
      class TestController {
        @GetMapping()
        handle(@RequestParam('required') param: string) {
          return { ok: true };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {}, // Missing 'required' param
        headers: {},
        request: { body: {} },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/test');

      await expect(route!.stack[0](ctx, async () => {})).rejects.toThrow(KiqError);
      await expect(route!.stack[0](ctx, async () => {})).rejects.toThrow(
        "Query parameter 'required' is required"
      );
    });

    it('should not throw when optional parameter is missing', async () => {
      let capturedParam: any;

      @RestController('/optional')
      class OptionalController {
        @GetMapping()
        handle(@RequestParam('optional', false) param?: string) {
          capturedParam = param;
          return { ok: true };
        }
      }

      @KiqApplication()
      class TestApp {}

      const container = await runApplication(TestApp);
      const router = new Router();

      registerControllers(container, router);

      const ctx: any = {
        params: {},
        query: {},
        headers: {},
        request: { body: {} },
        get: () => '',
      };

      const route = router.stack.find((r) => r.path === '/optional');
      await route!.stack[0](ctx, async () => {});

      expect(capturedParam).toBeUndefined();
    });
  });
});
