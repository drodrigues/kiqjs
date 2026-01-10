import { Service } from '@kiqjs/core';
import { logger } from '@kiqjs/http';

import { UserCreatedEvent } from './UserCreatedEvent';
import { UserUpdatedEvent } from './UserUpdatedEvent';

/**
 * User Event Publisher
 * Responsável por publicar eventos de domínio do usuário
 * Na implementação real, integraria com Kafka/Redis
 */
@Service()
export class UserEventPublisher {
  async publishUserCreated(event: UserCreatedEvent): Promise<void> {
    logger.info(
      {
        aggregateId: event.aggregateId,
        occurredAt: event.occurredAt,
        payload: event.payload,
      },
      `Publishing event: ${event.eventType}`
    );

    // TODO: Integrate with Kafka
    // await this.kafkaProducer.send('user.created', event);
  }

  async publishUserUpdated(event: UserUpdatedEvent): Promise<void> {
    console.log(`Publishing event: ${event.eventType}`, {
      aggregateId: event.aggregateId,
      occurredAt: event.occurredAt,
      payload: event.payload,
    });

    // TODO: Integrate with Kafka
    // await this.kafkaProducer.send('user.updated', event);
  }
}
