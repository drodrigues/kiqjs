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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const core_1 = require("@kiqjs/core");
const User_1 = require("@/domains/User");
/**
 * User Repository
 * Responsável pela persistência de usuários
 * Camada de infraestrutura da feature
 */
let UserRepository = class UserRepository {
    users = new Map();
    constructor() {
        // Seed data for demo
        this.save(new User_1.User('1', 'John Doe', 'john@example.com', User_1.UserStatus.ACTIVE, new Date('2024-01-01')));
        this.save(new User_1.User('2', 'Jane Smith', 'jane@example.com', User_1.UserStatus.PENDING, new Date('2024-01-02')));
    }
    async findById(id) {
        return this.users.get(id) || null;
    }
    async findAll() {
        return Array.from(this.users.values());
    }
    async findByEmail(email) {
        return Array.from(this.users.values()).find((u) => u.email === email) || null;
    }
    async save(user) {
        this.users.set(user.id, user);
        return user;
    }
    async delete(id) {
        return this.users.delete(id);
    }
    async existsByEmail(email) {
        return Array.from(this.users.values()).some((u) => u.email === email);
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, core_1.Service)(),
    __metadata("design:paramtypes", [])
], UserRepository);
//# sourceMappingURL=UserRepository.js.map