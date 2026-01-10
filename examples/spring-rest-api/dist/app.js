"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SpringRestApiApplication_1;
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@kiqjs/core");
const http_1 = require("@kiqjs/http");
// ============================================
// REPOSITORY LAYER (Like Spring Data JPA)
// ============================================
let UserRepository = class UserRepository {
    users = new Map();
    constructor() {
        // Initialize with some sample data
        this.save({
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: new Date('2024-01-01'),
        });
        this.save({
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            createdAt: new Date('2024-01-02'),
        });
    }
    save(user) {
        this.users.set(user.id, user);
        return user;
    }
    findAll() {
        return Array.from(this.users.values());
    }
    findById(id) {
        return this.users.get(id);
    }
    existsByEmail(email) {
        return Array.from(this.users.values()).some((u) => u.email === email);
    }
    deleteById(id) {
        return this.users.delete(id);
    }
};
UserRepository = __decorate([
    (0, core_1.Service)(),
    __metadata("design:paramtypes", [])
], UserRepository);
// ============================================
// SERVICE LAYER (Like Spring @Service)
// ============================================
let UserService = class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    getAllUsers(search) {
        const users = this.userRepository.findAll();
        if (search) {
            return users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()));
        }
        return users;
    }
    getUserById(id) {
        const user = this.userRepository.findById(id);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return user;
    }
    createUser(dto) {
        if (this.userRepository.existsByEmail(dto.email)) {
            throw new Error(`User with email ${dto.email} already exists`);
        }
        const user = {
            id: Math.random().toString(36).substring(2, 9),
            name: dto.name,
            email: dto.email,
            createdAt: new Date(),
        };
        return this.userRepository.save(user);
    }
    updateUser(id, dto) {
        const user = this.getUserById(id);
        const updated = {
            ...user,
            ...(dto.name && { name: dto.name }),
            ...(dto.email && { email: dto.email }),
        };
        return this.userRepository.save(updated);
    }
    deleteUser(id) {
        const exists = this.userRepository.findById(id);
        if (!exists) {
            throw new Error(`User with id ${id} not found`);
        }
        this.userRepository.deleteById(id);
    }
};
UserService = __decorate([
    (0, core_1.Service)(),
    __metadata("design:paramtypes", [UserRepository])
], UserService);
// ============================================
// CONTROLLER LAYER (Like Spring @RestController)
// ============================================
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    /**
     * GET /api/users
     * GET /api/users?search=john
     */
    getAllUsers(search) {
        const users = this.userService.getAllUsers(search);
        return {
            success: true,
            data: users,
            count: users.length,
        };
    }
    /**
     * GET /api/users/:id
     */
    getUserById(id) {
        const user = this.userService.getUserById(id);
        return {
            success: true,
            data: user,
        };
    }
    /**
     * POST /api/users
     */
    createUser(dto) {
        if (!dto.name || !dto.email) {
            throw new Error('Name and email are required');
        }
        const user = this.userService.createUser(dto);
        return {
            success: true,
            data: user,
            message: 'User created successfully',
        };
    }
    /**
     * PUT /api/users/:id
     */
    updateUser(id, dto) {
        const user = this.userService.updateUser(id, dto);
        return {
            success: true,
            data: user,
            message: 'User updated successfully',
        };
    }
    /**
     * DELETE /api/users/:id
     */
    deleteUser(id) {
        this.userService.deleteUser(id);
        return {
            success: true,
            message: 'User deleted successfully',
        };
    }
};
__decorate([
    (0, http_1.GetMapping)(),
    __param(0, (0, http_1.RequestParam)('search', false)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getAllUsers", null);
__decorate([
    (0, http_1.GetMapping)('/:id'),
    __param(0, (0, http_1.PathVariable)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, http_1.PostMapping)(),
    __param(0, (0, http_1.RequestBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "createUser", null);
__decorate([
    (0, http_1.PutMapping)('/:id'),
    __param(0, (0, http_1.PathVariable)('id')),
    __param(1, (0, http_1.RequestBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, http_1.DeleteMapping)('/:id'),
    __param(0, (0, http_1.PathVariable)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "deleteUser", null);
UserController = __decorate([
    (0, http_1.RestController)('/api/users'),
    __metadata("design:paramtypes", [UserService])
], UserController);
// ============================================
// HEALTH CHECK CONTROLLER
// ============================================
let HealthController = class HealthController {
    healthCheck(userAgent) {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            userAgent,
        };
    }
};
__decorate([
    (0, http_1.GetMapping)(),
    __param(0, (0, http_1.RequestHeader)('User-Agent', false)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "healthCheck", null);
HealthController = __decorate([
    (0, http_1.RestController)('/api/health')
], HealthController);
// ============================================
// APPLICATION (Like Spring Boot @SpringBootApplication)
// ============================================
let SpringRestApiApplication = SpringRestApiApplication_1 = class SpringRestApiApplication {
    async run() {
        const app = new http_1.KiqHttpApplication(SpringRestApiApplication_1, {
            port: 3000,
            logging: true,
            errorHandler: true,
            bodyParser: true,
        });
        await app.start();
        console.log('📝 Try these endpoints:');
        console.log('   GET    http://localhost:3000/api/users');
        console.log('   GET    http://localhost:3000/api/users/1');
        console.log('   GET    http://localhost:3000/api/users?search=john');
        console.log('   POST   http://localhost:3000/api/users');
        console.log('   PUT    http://localhost:3000/api/users/1');
        console.log('   DELETE http://localhost:3000/api/users/1');
        console.log('   GET    http://localhost:3000/api/health');
    }
};
SpringRestApiApplication = SpringRestApiApplication_1 = __decorate([
    (0, core_1.KiqApplication)()
], SpringRestApiApplication);
// Bootstrap the application
new SpringRestApiApplication().run().catch(console.error);
//# sourceMappingURL=app.js.map