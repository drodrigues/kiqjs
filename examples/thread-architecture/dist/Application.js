"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Application_1;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@kiqjs/core");
const http_1 = require("@kiqjs/http");
/**
 * Application Entry Point
 * Bootstrap da aplicação seguindo THREAD Architecture
 */
let Application = Application_1 = class Application {
    async run() {
        console.log('🧵 Starting THREAD Architecture Application...\n');
        const app = new http_1.KiqHttpApplication(Application_1, {
            port: 3000,
            logging: true,
            errorHandler: true,
            bodyParser: true,
            prefix: '/api',
        });
        await app.start();
        this.printWelcomeMessage();
    }
    printWelcomeMessage() {
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
};
Application = Application_1 = __decorate([
    (0, core_1.KiqApplication)()
], Application);
// Bootstrap
new Application().run().catch(console.error);
//# sourceMappingURL=Application.js.map