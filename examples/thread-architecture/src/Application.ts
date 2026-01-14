import { KiqApplication } from '@kiqjs/core';
import { KiqHttpApplication } from '@kiqjs/http';

import './config/AppConfig';
import './features/user/UserHttpController';

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

new Application().run().catch(console.error);
