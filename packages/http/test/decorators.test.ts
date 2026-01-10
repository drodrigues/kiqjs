import 'reflect-metadata';
import {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PatchMapping,
  PathVariable,
  RequestBody,
  RequestParam,
  RequestHeader,
  RequestPart,
  Context,
  Request,
  Response,
  RequestMapping,
} from '../src/decorators';
import {
  META_REST_CONTROLLER,
  META_ROUTE_HANDLER,
  META_PARAM_METADATA,
  META_REQUEST_MAPPING,
} from '../src/metadata-keys';

describe('HTTP Decorators', () => {
  describe('@RestController', () => {
    it('should mark class as REST controller with base path', () => {
      @RestController('/users')
      class UserController {}

      const metadata = Reflect.getMetadata(META_REST_CONTROLLER, UserController);
      expect(metadata).toBeDefined();
      expect(metadata.path).toBe('/users');
    });

    it('should work without path', () => {
      @RestController()
      class RootController {}

      const metadata = Reflect.getMetadata(META_REST_CONTROLLER, RootController);
      expect(metadata).toBeDefined();
      expect(metadata.path).toBe('');
    });
  });

  describe('HTTP Method Decorators', () => {
    it('@GetMapping should register GET route', () => {
      @RestController('/users')
      class UserController {
        @GetMapping('/:id')
        getUser() {}
      }

      const routes = Reflect.getMetadata(META_ROUTE_HANDLER, UserController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        path: '/:id',
        method: 'GET',
        propertyKey: 'getUser',
      });
    });

    it('@PostMapping should register POST route', () => {
      @RestController('/users')
      class UserController {
        @PostMapping()
        createUser() {}
      }

      const routes = Reflect.getMetadata(META_ROUTE_HANDLER, UserController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        path: '',
        method: 'POST',
        propertyKey: 'createUser',
      });
    });

    it('@PutMapping should register PUT route', () => {
      @RestController('/users')
      class UserController {
        @PutMapping('/:id')
        updateUser() {}
      }

      const routes = Reflect.getMetadata(META_ROUTE_HANDLER, UserController);
      expect(routes[0].method).toBe('PUT');
    });

    it('@DeleteMapping should register DELETE route', () => {
      @RestController('/users')
      class UserController {
        @DeleteMapping('/:id')
        deleteUser() {}
      }

      const routes = Reflect.getMetadata(META_ROUTE_HANDLER, UserController);
      expect(routes[0].method).toBe('DELETE');
    });

    it('@PatchMapping should register PATCH route', () => {
      @RestController('/users')
      class UserController {
        @PatchMapping('/:id')
        patchUser() {}
      }

      const routes = Reflect.getMetadata(META_ROUTE_HANDLER, UserController);
      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        path: '/:id',
        method: 'PATCH',
        propertyKey: 'patchUser',
      });
    });

    it('should support multiple routes on same controller', () => {
      @RestController('/users')
      class UserController {
        @GetMapping()
        list() {}

        @GetMapping('/:id')
        getOne() {}

        @PostMapping()
        create() {}
      }

      const routes = Reflect.getMetadata(META_ROUTE_HANDLER, UserController);
      expect(routes).toHaveLength(3);
      expect(routes.map((r: any) => r.propertyKey)).toEqual(['list', 'getOne', 'create']);
    });
  });

  describe('Parameter Decorators', () => {
    it('@PathVariable should register path parameter', () => {
      @RestController('/users')
      class UserController {
        @GetMapping('/:id')
        getUser(@PathVariable('id') id: string) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        UserController.prototype,
        'getUser'
      );
      expect(params).toHaveLength(1);
      expect(params[0]).toMatchObject({
        index: 0,
        type: 'param',
        name: 'id',
        required: true,
      });
    });

    it('@RequestBody should register body parameter', () => {
      @RestController('/users')
      class UserController {
        @PostMapping()
        createUser(@RequestBody() user: any) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        UserController.prototype,
        'createUser'
      );
      expect(params[0].type).toBe('body');
    });

    it('@RequestParam should register query parameter', () => {
      @RestController('/users')
      class UserController {
        @GetMapping()
        search(@RequestParam('query') query: string) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        UserController.prototype,
        'search'
      );
      expect(params[0]).toMatchObject({
        type: 'query',
        name: 'query',
      });
    });

    it('@RequestHeader should register header parameter', () => {
      @RestController('/users')
      class UserController {
        @GetMapping()
        getProfile(@RequestHeader('Authorization') token: string) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        UserController.prototype,
        'getProfile'
      );
      expect(params[0]).toMatchObject({
        type: 'header',
        name: 'Authorization',
      });
    });

    it('should support multiple parameters', () => {
      @RestController('/users')
      class UserController {
        @PutMapping('/:id')
        updateUser(
          @PathVariable('id') id: string,
          @RequestBody() user: any,
          @RequestHeader('Authorization') token: string
        ) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        UserController.prototype,
        'updateUser'
      );
      expect(params).toHaveLength(3);

      // Sort by index to check correct parameter mapping
      const sortedParams = [...params].sort((a, b) => a.index - b.index);
      expect(sortedParams.map((p: any) => p.type)).toEqual(['param', 'body', 'header']);
      expect(sortedParams[0].name).toBe('id');
      expect(sortedParams[2].name).toBe('Authorization');
    });

    it('@RequestPart should register files parameter', () => {
      @RestController('/upload')
      class UploadController {
        @PostMapping()
        uploadFile(@RequestPart('file') file: any) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        UploadController.prototype,
        'uploadFile'
      );
      expect(params).toHaveLength(1);
      expect(params[0]).toMatchObject({
        index: 0,
        type: 'files',
        name: 'file',
        required: true,
      });
    });

    it('@Context should register ctx parameter', () => {
      @RestController('/test')
      class TestController {
        @GetMapping()
        handle(@Context() ctx: any) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        TestController.prototype,
        'handle'
      );
      expect(params).toHaveLength(1);
      expect(params[0]).toMatchObject({
        index: 0,
        type: 'ctx',
      });
    });

    it('@Request should register req parameter', () => {
      @RestController('/test')
      class TestController {
        @GetMapping()
        handle(@Request() req: any) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        TestController.prototype,
        'handle'
      );
      expect(params).toHaveLength(1);
      expect(params[0]).toMatchObject({
        index: 0,
        type: 'req',
      });
    });

    it('@Response should register res parameter', () => {
      @RestController('/test')
      class TestController {
        @GetMapping()
        handle(@Response() res: any) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        TestController.prototype,
        'handle'
      );
      expect(params).toHaveLength(1);
      expect(params[0]).toMatchObject({
        index: 0,
        type: 'res',
      });
    });

    it('@RequestParam with required=false should mark parameter as optional', () => {
      @RestController('/users')
      class UserController {
        @GetMapping()
        search(@RequestParam('query', false) query?: string) {}
      }

      const params = Reflect.getMetadata(
        META_PARAM_METADATA,
        UserController.prototype,
        'search'
      );
      expect(params[0]).toMatchObject({
        type: 'query',
        name: 'query',
        required: false,
      });
    });
  });

  describe('@RequestMapping', () => {
    it('should register method-level request mapping', () => {
      @RestController('/users')
      class UserController {
        @RequestMapping('/test', 'GET')
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(
        META_REQUEST_MAPPING,
        UserController.prototype,
        'testMethod'
      );
      expect(metadata).toMatchObject({
        path: '/test',
        method: 'GET',
      });
    });

    it('should register class-level request mapping', () => {
      @RequestMapping('/api')
      class ApiController {}

      const metadata = Reflect.getMetadata(META_REQUEST_MAPPING, ApiController);
      expect(metadata).toMatchObject({
        path: '/api',
      });
    });

    it('should work with multiple HTTP methods', () => {
      @RestController('/users')
      class UserController {
        @RequestMapping('/test', ['GET', 'POST'])
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(
        META_REQUEST_MAPPING,
        UserController.prototype,
        'testMethod'
      );
      expect(metadata).toMatchObject({
        path: '/test',
        method: ['GET', 'POST'],
      });
    });
  });
});
