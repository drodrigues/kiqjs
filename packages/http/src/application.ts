import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from '@koa/router';
import { Container, runApplication } from '@kiqjs/core';
import { registerControllers, HttpError } from './router';

export interface KiqHttpApplicationOptions {
  /**
   * Port to listen on (default: 3000)
   */
  port?: number;

  /**
   * Enable body parser middleware (default: true)
   */
  bodyParser?: boolean;

  /**
   * Body parser options
   */
  bodyParserOptions?: bodyParser.Options;

  /**
   * Enable default error handler (default: true)
   */
  errorHandler?: boolean;

  /**
   * Enable request logging (default: false)
   */
  logging?: boolean;

  /**
   * Custom Koa middlewares to apply before routes
   */
  middlewares?: Koa.Middleware[];

  /**
   * Router prefix (e.g., '/api/v1')
   */
  prefix?: string;
}

/**
 * KiqHttpApplication - Spring Boot-like application class for HTTP server.
 *
 * Integrates KiqJS dependency injection with Koa HTTP server.
 *
 * @example
 * ```typescript
 * @KiqApplication()
 * class MyApp {
 *   async run() {
 *     const app = new KiqHttpApplication(MyApp);
 *     await app.start(3000);
 *   }
 * }
 * ```
 */
export class KiqHttpApplication {
  private app: Koa;
  private router: Router;
  private container!: Container;
  private options: Required<KiqHttpApplicationOptions>;

  constructor(
    private appClass: new () => any,
    options: KiqHttpApplicationOptions = {}
  ) {
    this.app = new Koa();
    this.router = new Router();

    this.options = {
      port: options.port ?? 3000,
      bodyParser: options.bodyParser ?? true,
      bodyParserOptions: options.bodyParserOptions ?? {},
      errorHandler: options.errorHandler ?? true,
      logging: options.logging ?? false,
      middlewares: options.middlewares ?? [],
      prefix: options.prefix ?? '',
    };

    if (this.options.prefix) {
      this.router.prefix(this.options.prefix);
    }
  }

  /**
   * Starts the Koa application.
   *
   * @param port Port to listen on (overrides constructor option)
   */
  async start(port?: number): Promise<void> {
    const listenPort = port ?? this.options.port;

    // Initialize KiqJS container
    this.container = await runApplication(this.appClass);

    // Setup middlewares
    this.setupMiddlewares();

    // Register REST controllers
    console.log('\n🔍 Registering REST controllers:');
    registerControllers(this.container, this.router);

    // Apply router
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());

    // Start server
    return new Promise((resolve) => {
      this.app.listen(listenPort, () => {
        console.log(`\n🚀 Server started successfully!`);
        console.log(`📡 Listening on http://localhost:${listenPort}${this.options.prefix}`);
        console.log(`✨ Environment: ${process.env.NODE_ENV || 'development'}\n`);
        resolve();
      });
    });
  }

  /**
   * Returns the Koa instance for advanced configuration.
   */
  getKoaApp(): Koa {
    return this.app;
  }

  /**
   * Returns the Router instance for advanced configuration.
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Returns the KiqJS container.
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Adds a custom middleware.
   */
  use(middleware: Koa.Middleware): void {
    this.app.use(middleware);
  }

  private setupMiddlewares(): void {
    // Error handler (first)
    if (this.options.errorHandler) {
      this.app.use(this.createErrorHandler());
    }

    // Request logging
    if (this.options.logging) {
      this.app.use(this.createLogger());
    }

    // Body parser
    if (this.options.bodyParser) {
      this.app.use(bodyParser(this.options.bodyParserOptions));
    }

    // Custom middlewares
    for (const middleware of this.options.middlewares) {
      this.app.use(middleware);
    }
  }

  private createErrorHandler(): Koa.Middleware {
    return async (ctx, next) => {
      try {
        await next();
      } catch (err: any) {
        if (err instanceof HttpError) {
          ctx.status = err.status;
          ctx.body = {
            success: false,
            error: err.message,
            status: err.status,
          };
        } else {
          ctx.status = err.status || 500;
          ctx.body = {
            success: false,
            error: err.message || 'Internal Server Error',
            status: ctx.status,
          };

          // Log server errors
          if (ctx.status >= 500) {
            console.error('❌ Server Error:', err);
          }
        }

        ctx.app.emit('error', err, ctx);
      }
    };
  }

  private createLogger(): Koa.Middleware {
    return async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;

      const statusColor = ctx.status >= 500 ? '🔴' : ctx.status >= 400 ? '🟡' : '🟢';
      console.log(
        `${statusColor} ${ctx.method.padEnd(6)} ${ctx.url.padEnd(40)} ${ctx.status} - ${ms}ms`
      );
    };
  }
}

/**
 * Helper function to quickly start a KiqJS HTTP application.
 *
 * @param appClass Application class decorated with @KiqApplication
 * @param options Application options
 *
 * @example
 * ```typescript
 * @KiqApplication({ scan: './src' })
 * class MyApp {}
 *
 * startKiqHttpApplication(MyApp, { port: 3000, logging: true });
 * ```
 */
export async function startKiqHttpApplication(
  appClass: new () => any,
  options?: KiqHttpApplicationOptions
): Promise<KiqHttpApplication> {
  const app = new KiqHttpApplication(appClass, options);
  await app.start();
  return app;
}
