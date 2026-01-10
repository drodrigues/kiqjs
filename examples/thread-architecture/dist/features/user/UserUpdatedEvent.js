"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUpdatedEvent = void 0;
const DomainEvent_1 = require("@/core/DomainEvent");
/**
 * User Updated Domain Event
 * Representa o fato de que um usuário foi atualizado no sistema
 */
class UserUpdatedEvent extends DomainEvent_1.BaseDomainEvent {
    constructor(user) {
        super('USER_UPDATED', user.id, {
            id: user.id,
            name: user.name,
            email: user.email,
            status: user.status,
        });
    }
}
exports.UserUpdatedEvent = UserUpdatedEvent;
//# sourceMappingURL=UserUpdatedEvent.js.map