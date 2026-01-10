"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.User = void 0;
/**
 * User Domain Entity
 * Representa o modelo de negócio puro de um usuário
 * Não depende de framework, banco de dados ou serviços externos
 */
class User {
    id;
    name;
    email;
    status;
    createdAt;
    constructor(id, name, email, status, createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.status = status;
        this.createdAt = createdAt;
        this.validate();
    }
    validate() {
        if (!this.name || this.name.trim().length === 0) {
            throw new Error('User name cannot be empty');
        }
        if (!this.email || !this.isValidEmail(this.email)) {
            throw new Error('Invalid email format');
        }
    }
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    /**
     * Business rule: User can only be activated if status is PENDING
     */
    activate() {
        if (this.status !== UserStatus.PENDING) {
            throw new Error('Only pending users can be activated');
        }
        return new User(this.id, this.name, this.email, UserStatus.ACTIVE, this.createdAt);
    }
    /**
     * Business rule: User can be deactivated from any status except DELETED
     */
    deactivate() {
        if (this.status === UserStatus.DELETED) {
            throw new Error('Deleted users cannot be deactivated');
        }
        return new User(this.id, this.name, this.email, UserStatus.INACTIVE, this.createdAt);
    }
    isActive() {
        return this.status === UserStatus.ACTIVE;
    }
}
exports.User = User;
/**
 * User Status Value Object
 */
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING"] = "PENDING";
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["DELETED"] = "DELETED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=User.js.map