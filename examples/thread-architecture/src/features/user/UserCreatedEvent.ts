import { BaseDomainEvent } from '../../core/DomainEvent';
import { User } from '../../domains/User';

/**
 * User Created Domain Event
 */
export class UserCreatedEvent extends BaseDomainEvent {
  constructor(user: User) {
    super('USER_CREATED', user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    });
  }
}
