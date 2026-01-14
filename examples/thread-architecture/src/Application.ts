import { KiqApplication } from '@kiqjs/core';
import { KiqHttpApplication } from '@kiqjs/http';

import './config/AppConfig';
// Import controllers to register them
import './features/user/UserHttpController';

/**
 * Application Entry Point
 * Bootstrap da aplicação seguindo THREAD Architecture
 */
@KiqApplication()
class Application {
  async run() {
    console.log('Starting THREAD Architecture Application...\n');

    // Configuration is automatically loaded from application.yml
    // and application-{profile}.yml based on NODE_ENV
    const app = new KiqHttpApplication(Application, {
      port: 3000, // Can be overridden by application.yml or SERVER_PORT env var
      logging: true,
      errorHandler: true,
      bodyParser: true,
      bodyParserOptions: { multipart: true },
      prefix: '/api', // Can be overridden by application.yml or SERVER_PREFIX env var
    });

    await app.start();
  }
}

// Bootstrap
new Application().run().catch(console.error);
