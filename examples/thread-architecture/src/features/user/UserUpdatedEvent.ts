import { BaseDomainEvent } from '@/core/DomainEvent';
import { User } from '@/domains/User';

/**
 * User Updated Domain Event
 * Representa o fato de que um usuário foi atualizado no sistema
 */
export class UserUpdatedEvent extends BaseDomainEvent {
  constructor(user: User) {
    super('USER_UPDATED', user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    });
  }
}
