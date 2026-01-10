"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedEvent = void 0;
const DomainEvent_1 = require("@/core/DomainEvent");
/**
 * User Created Domain Event
 * Representa o fato de que um usuário foi criado no sistema
 */
class UserCreatedEvent extends DomainEvent_1.BaseDomainEvent {
    constructor(user) {
        super('USER_CREATED', user.id, {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
            createdAt: user.createdAt.toISOString(),
        });
    }
}
exports.UserCreatedEvent = UserCreatedEvent;
//# sourceMappingURL=UserCreatedEvent.js.map