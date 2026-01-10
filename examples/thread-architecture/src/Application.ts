import { KiqApplication } from '@kiqjs/core';
import { KiqHttpApplication } from '@kiqjs/http';

// Import controllers to register them
import './features/user/UserHttpController';
import './config/AppConfig';

/**
 * Application Entry Point
 * Bootstrap da aplicação seguindo THREAD Architecture
 */
@KiqApplication()
class Application {
  async run() {
    console.log('🧵 Starting THREAD Architecture Application...\n');

    const app = new KiqHttpApplication(Application, {
      port: 3000,
      logging: true,
      errorHandler: true,
      bodyParser: true,
      prefix: '/api',
    });

    await app.start();

    this.printWelcomeMessage();
  }

  private printWelcomeMessage() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('   🧵 THREAD Architecture - Example Application');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📝 Available Endpoints:');
    console.log('');
    console.log('   User Management:');
    console.log('   ├─ GET    /api/users');
    console.log('   ├─ GET    /api/users?status=ACTIVE');
    console.log('   ├─ GET    /api/users/:id');
    console.log('   ├─ POST   /api/users');
    console.log('   ├─ PUT    /api/users/:id');
    console.log('   ├─ PATCH  /api/users/:id/activate');
    console.log('   ├─ PATCH  /api/users/:id/deactivate');
    console.log('   └─ DELETE /api/users/:id');
    console.log('');
    console.log('💡 Architecture Highlights:');
    console.log('   ✓ Domain-driven design');
    console.log('   ✓ Vertical slice per feature');
    console.log('   ✓ Events as system language');
    console.log('   ✓ Clear naming conventions');
    console.log('   ✓ One responsibility per file');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
  }
}

// Bootstrap
new Application().run().catch(console.error);
