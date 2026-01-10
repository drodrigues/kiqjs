import { BaseDomainEvent } from '@/core/DomainEvent';
import { User } from '@/domains/User';
/**
 * User Updated Domain Event
 * Representa o fato de que um usuário foi atualizado no sistema
 */
export declare class UserUpdatedEvent extends BaseDomainEvent {
    constructor(user: User);
}
