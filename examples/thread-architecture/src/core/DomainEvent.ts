/**
 * Domain Event Base
 * Representa um fato que aconteceu no domínio
 */
export interface DomainEvent {
  eventType: string;
  occurredAt: Date;
  aggregateId: string;
  payload: any;
}

export abstract class BaseDomainEvent implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly eventType: string,
    public readonly aggregateId: string,
    public readonly payload: any
  ) {
    this.occurredAt = new Date();
  }
}
