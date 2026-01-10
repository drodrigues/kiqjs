import { UserCreatedEvent } from './UserCreatedEvent';
import { UserUpdatedEvent } from './UserUpdatedEvent';
/**
 * User Event Publisher
 * Responsável por publicar eventos de domínio do usuário
 * Na implementação real, integraria com Kafka/Redis
 */
export declare class UserEventPublisher {
    publishUserCreated(event: UserCreatedEvent): Promise<void>;
    publishUserUpdated(event: UserUpdatedEvent): Promise<void>;
}
