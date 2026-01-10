import 'reflect-metadata';
import { KiqHttpApplication } from '../src/application';
import { RestController, GetMapping, PostMapping } from '../src/decorators';
import { KiqApplication } from '@kiqjs/core';
import Koa from 'koa';

@RestController('/test')
class TestController {
  @GetMapping('/hello')
  getHello() {
    return { message: 'Hello World' };
  }

  @PostMapping('/echo')
  postEcho() {
    return { echo: 'test' };
  }
}

@KiqApplication()
class TestApp {}

describe('KiqHttpApplication', () => {
  describe('Constructor', () => {
    it('should create an instance with default options', () => {
      const app = new KiqHttpApplication(TestApp);
      expect(app).toBeInstanceOf(KiqHttpApplication);
    });

    it('should accept custom options', () => {
      const app = new KiqHttpApplication(TestApp, {
        port: 4000,
        bodyParser: false,
        errorHandler: false,
        logging: false,
      });
      expect(app).toBeInstanceOf(KiqHttpApplication);
    });

    it('should set router prefix when provided', () => {
      const app = new KiqHttpApplication(TestApp, {
        prefix: '/api/v1',
      });
      const router = app.getRouter();
      expect(router.opts.prefix).toBe('/api/v1');
    });
  });

  describe('Getters', () => {
    it('should return Koa instance', () => {
      const app = new KiqHttpApplication(TestApp);
      const koaApp = app.getKoaApp();
      expect(koaApp).toBeInstanceOf(Koa);
    });

    it('should return Router instance', () => {
      const app = new KiqHttpApplication(TestApp);
      const router = app.getRouter();
      expect(router).toBeDefined();
      expect(typeof router.get).toBe('function');
    });
  });

  describe('Custom Middleware', () => {
    it('should allow adding custom middleware', () => {
      const app = new KiqHttpApplication(TestApp, { logging: false });

      const mockMiddleware = jest.fn(async (ctx, next) => {
        await next();
      });

      app.use(mockMiddleware);

      const koaApp = app.getKoaApp();
      expect(koaApp.middleware.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Options', () => {
    it('should allow disabling body parser', () => {
      const app = new KiqHttpApplication(TestApp, {
        bodyParser: false,
        logging: false,
      });
      expect(app).toBeInstanceOf(KiqHttpApplication);
    });

    it('should allow disabling error handler', () => {
      const app = new KiqHttpApplication(TestApp, {
        errorHandler: false,
        logging: false,
      });
      expect(app).toBeInstanceOf(KiqHttpApplication);
    });

    it('should allow custom middlewares in options', () => {
      const customMiddleware: Koa.Middleware = async (ctx, next) => {
        await next();
      };

      const app = new KiqHttpApplication(TestApp, {
        middlewares: [customMiddleware],
        logging: false,
      });
      expect(app).toBeInstanceOf(KiqHttpApplication);
    });
  });
});
