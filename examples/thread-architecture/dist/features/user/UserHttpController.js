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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHttpController = void 0;
const http_1 = require("@kiqjs/http");
const UserService_1 = require("@/features/user/UserService");
/**
 * User HTTP Controller
 * Expõe endpoints REST para operações de usuário
 * Camada de entrada da feature
 */
let UserHttpController = class UserHttpController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    /**
     * GET /api/users
     * Lista todos os usuários
     */
    async getAllUsers(status) {
        const result = await this.userService.getAllUsers();
        if (!result.success) {
            return { success: false, error: result.error };
        }
        let users = result.data;
        // Filter by status if provided
        if (status) {
            users = users.filter((u) => u.status === status);
        }
        return {
            success: true,
            data: users.map(this.toResponseDto),
            count: users.length,
        };
    }
    /**
     * GET /api/users/:id
     * Busca um usuário por ID
     */
    async getUserById(id) {
        const result = await this.userService.getUserById(id);
        if (!result.success) {
            return { success: false, error: result.error, status: 404 };
        }
        return {
            success: true,
            data: this.toResponseDto(result.data),
        };
    }
    /**
     * POST /api/users
     * Cria um novo usuário
     */
    async createUser(dto) {
        const result = await this.userService.createUser(dto);
        if (!result.success) {
            return { success: false, error: result.error, status: 400 };
        }
        return {
            success: true,
            data: this.toResponseDto(result.data),
            message: 'User created successfully',
        };
    }
    /**
     * PUT /api/users/:id
     * Atualiza um usuário
     */
    async updateUser(id, dto) {
        const result = await this.userService.updateUser(id, dto);
        if (!result.success) {
            return { success: false, error: result.error, status: 400 };
        }
        return {
            success: true,
            data: this.toResponseDto(result.data),
            message: 'User updated successfully',
        };
    }
    /**
     * PATCH /api/users/:id/activate
     * Ativa um usuário
     */
    async activateUser(id) {
        const result = await this.userService.activateUser(id);
        if (!result.success) {
            return { success: false, error: result.error, status: 400 };
        }
        return {
            success: true,
            data: this.toResponseDto(result.data),
            message: 'User activated successfully',
        };
    }
    /**
     * PATCH /api/users/:id/deactivate
     * Desativa um usuário
     */
    async deactivateUser(id) {
        const result = await this.userService.deactivateUser(id);
        if (!result.success) {
            return { success: false, error: result.error, status: 400 };
        }
        return {
            success: true,
            data: this.toResponseDto(result.data),
            message: 'User deactivated successfully',
        };
    }
    /**
     * DELETE /api/users/:id
     * Remove um usuário
     */
    async deleteUser(id) {
        const result = await this.userService.deleteUser(id);
        if (!result.success) {
            return { success: false, error: result.error, status: 404 };
        }
        return {
            success: true,
            message: 'User deleted successfully',
        };
    }
    toResponseDto(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            createdAt: user.createdAt.toISOString(),
        };
    }
};
exports.UserHttpController = UserHttpController;
__decorate([
    (0, http_1.GetMapping)(),
    __param(0, (0, http_1.RequestParam)('status', false)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserHttpController.prototype, "getAllUsers", null);
__decorate([
    (0, http_1.GetMapping)('/:id'),
    __param(0, (0, http_1.PathVariable)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserHttpController.prototype, "getUserById", null);
__decorate([
    (0, http_1.PostMapping)(),
    __param(0, (0, http_1.RequestBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserHttpController.prototype, "createUser", null);
__decorate([
    (0, http_1.PutMapping)('/:id'),
    __param(0, (0, http_1.PathVariable)('id')),
    __param(1, (0, http_1.RequestBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserHttpController.prototype, "updateUser", null);
__decorate([
    (0, http_1.PatchMapping)('/:id/activate'),
    __param(0, (0, http_1.PathVariable)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserHttpController.prototype, "activateUser", null);
__decorate([
    (0, http_1.PatchMapping)('/:id/deactivate'),
    __param(0, (0, http_1.PathVariable)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserHttpController.prototype, "deactivateUser", null);
__decorate([
    (0, http_1.DeleteMapping)('/:id'),
    __param(0, (0, http_1.PathVariable)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserHttpController.prototype, "deleteUser", null);
exports.UserHttpController = UserHttpController = __decorate([
    (0, http_1.RestController)('/api/users'),
    __metadata("design:paramtypes", [UserService_1.UserService])
], UserHttpController);
//# sourceMappingURL=UserHttpController.js.map