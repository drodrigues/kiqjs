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
exports.UserService = void 0;
const core_1 = require("@kiqjs/core");
const User_1 = require("@/domains/User");
const Result_1 = require("@/core/Result");
const UserRepository_1 = require("@/features/user/UserRepository");
const UserEventPublisher_1 = require("@/features/user/UserEventPublisher");
const UserCreatedEvent_1 = require("@/features/user/UserCreatedEvent");
const UserUpdatedEvent_1 = require("@/features/user/UserUpdatedEvent");
/**
 * User Service
 * Orquestra as operações de negócio relacionadas a usuários
 * Coordena entre domínio, repositório e eventos
 */
let UserService = class UserService {
    userRepository;
    userEventPublisher;
    constructor(userRepository, userEventPublisher) {
        this.userRepository = userRepository;
        this.userEventPublisher = userEventPublisher;
    }
    async createUser(dto) {
        // Business rule: email must be unique
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            return (0, Result_1.failure)(`User with email ${dto.email} already exists`);
        }
        try {
            // Create domain entity
            const user = new User_1.User(this.generateId(), dto.name, dto.email, User_1.UserStatus.PENDING, new Date());
            // Persist
            await this.userRepository.save(user);
            // Publish event
            await this.userEventPublisher.publishUserCreated(new UserCreatedEvent_1.UserCreatedEvent(user));
            return (0, Result_1.success)(user);
        }
        catch (error) {
            return (0, Result_1.failure)(error.message);
        }
    }
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            return (0, Result_1.failure)(`User with id ${id} not found`);
        }
        return (0, Result_1.success)(user);
    }
    async getAllUsers() {
        const users = await this.userRepository.findAll();
        return (0, Result_1.success)(users);
    }
    async updateUser(id, dto) {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return (0, Result_1.failure)(`User with id ${id} not found`);
        }
        try {
            // Check email uniqueness if changing email
            if (dto.email && dto.email !== existingUser.email) {
                const emailTaken = await this.userRepository.findByEmail(dto.email);
                if (emailTaken) {
                    return (0, Result_1.failure)(`Email ${dto.email} is already in use`);
                }
            }
            // Create updated user
            const updatedUser = new User_1.User(existingUser.id, dto.name ?? existingUser.name, dto.email ?? existingUser.email, existingUser.status, existingUser.createdAt);
            // Persist
            await this.userRepository.save(updatedUser);
            // Publish event
            await this.userEventPublisher.publishUserUpdated(new UserUpdatedEvent_1.UserUpdatedEvent(updatedUser));
            return (0, Result_1.success)(updatedUser);
        }
        catch (error) {
            return (0, Result_1.failure)(error.message);
        }
    }
    async activateUser(id) {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return (0, Result_1.failure)(`User with id ${id} not found`);
        }
        try {
            // Use domain logic
            const activatedUser = existingUser.activate();
            await this.userRepository.save(activatedUser);
            await this.userEventPublisher.publishUserUpdated(new UserUpdatedEvent_1.UserUpdatedEvent(activatedUser));
            return (0, Result_1.success)(activatedUser);
        }
        catch (error) {
            return (0, Result_1.failure)(error.message);
        }
    }
    async deactivateUser(id) {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return (0, Result_1.failure)(`User with id ${id} not found`);
        }
        try {
            // Use domain logic
            const deactivatedUser = existingUser.deactivate();
            await this.userRepository.save(deactivatedUser);
            await this.userEventPublisher.publishUserUpdated(new UserUpdatedEvent_1.UserUpdatedEvent(deactivatedUser));
            return (0, Result_1.success)(deactivatedUser);
        }
        catch (error) {
            return (0, Result_1.failure)(error.message);
        }
    }
    async deleteUser(id) {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return (0, Result_1.failure)(`User with id ${id} not found`);
        }
        await this.userRepository.delete(id);
        return (0, Result_1.success)(undefined);
    }
    generateId() {
        return Math.random().toString(36).substring(2, 11);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, core_1.Service)(),
    __metadata("design:paramtypes", [UserRepository_1.UserRepository,
        UserEventPublisher_1.UserEventPublisher])
], UserService);
//# sourceMappingURL=UserService.js.map