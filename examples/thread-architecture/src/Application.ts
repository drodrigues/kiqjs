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

    const app = new KiqHttpApplication(Application, {
      port: 3000,
      logging: true,
      errorHandler: true,
      bodyParser: true,
      bodyParserOptions: { multipart: true },
      prefix: '/api',
    });

    await app.start();
  }
}

// Bootstrap
new Application().run().catch(console.error);
