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
export declare abstract class BaseDomainEvent implements DomainEvent {
    readonly eventType: string;
    readonly aggregateId: string;
    readonly payload: any;
    readonly occurredAt: Date;
    constructor(eventType: string, aggregateId: string, payload: any);
}
