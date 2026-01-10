import { BaseDomainEvent } from '@/core/DomainEvent';
import { User } from '@/domains/User';
/**
 * User Created Domain Event
 * Representa o fato de que um usuário foi criado no sistema
 */
export declare class UserCreatedEvent extends BaseDomainEvent {
    constructor(user: User);
}
