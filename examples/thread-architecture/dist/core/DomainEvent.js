"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDomainEvent = void 0;
class BaseDomainEvent {
    eventType;
    aggregateId;
    payload;
    occurredAt;
    constructor(eventType, aggregateId, payload) {
        this.eventType = eventType;
        this.aggregateId = aggregateId;
        this.payload = payload;
        this.occurredAt = new Date();
    }
}
exports.BaseDomainEvent = BaseDomainEvent;
//# sourceMappingURL=DomainEvent.js.map