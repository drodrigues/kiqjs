import { KiqApplication } from '@kiqjs/core';
import { KiqHttpApplication } from '@kiqjs/http';

import './config/AppConfig';
import './features/user/UserHttpController';

@KiqApplication()
class Application {
  async run() {
    console.log('Starting THREAD Architecture Application...\n');

    // Server configuration (port, host, prefix) is read automatically from resources/application.yml
    const app = new KiqHttpApplication(Application, {
      logging: true,
      errorHandler: true,
      bodyParser: true,
      bodyParserOptions: { multipart: true },
    });

    await app.start();
  }
}

new Application().run().catch(console.error);
