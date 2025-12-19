// Fake implementation of the EventLoggerRepository
import { EventLoggerRepository } from '@/domains/event-logs/repositories/event-logger.repository';
import { EventLogId } from '@/domains/event-logs/types/event-log.type';

export class FakeEventLoggerRepository implements EventLoggerRepository {
  // Track events for testing purposes
  private events: Map<EventLogId, { message: string; progress?: number }> =
    new Map();

  start(eventId: EventLogId, message: string): void {
    this.events.set(eventId, { message });
  }

  update(eventId: EventLogId, message: string): void {
    const existing = this.events.get(eventId);
    if (existing) {
      this.events.set(eventId, { ...existing, message });
    }
  }

  succeed(eventId: EventLogId, message?: string): void {
    const existing = this.events.get(eventId);
    if (existing) {
      this.events.set(eventId, {
        ...existing,
        message: message ?? existing.message,
      });
    }
  }

  fail(eventId: EventLogId, message?: string): void {
    const existing = this.events.get(eventId);
    if (existing) {
      this.events.set(eventId, {
        ...existing,
        message: message ?? existing.message,
      });
    }
  }

  startProgress(eventId: EventLogId, message: string, total: number): void {
    this.events.set(eventId, { message, progress: 0 });
  }

  updateProgress(eventId: EventLogId, progress: number): void {
    const existing = this.events.get(eventId);
    if (existing) {
      this.events.set(eventId, { ...existing, progress });
    }
  }

  succeedProgress(eventId: EventLogId, message?: string): void {
    const existing = this.events.get(eventId);
    if (existing) {
      this.events.set(eventId, {
        ...existing,
        message: message ?? existing.message,
      });
    }
  }

  failProgress(eventId: EventLogId, message?: string): void {
    const existing = this.events.get(eventId);
    if (existing) {
      this.events.set(eventId, {
        ...existing,
        message: message ?? existing.message,
      });
    }
  }

  clear(): void {
    this.events.clear();
  }

  // Helper methods for testing
  getEvent(
    eventId: EventLogId
  ): { message: string; progress?: number } | undefined {
    return this.events.get(eventId);
  }

  getAllEvents(): Map<EventLogId, { message: string; progress?: number }> {
    return new Map(this.events);
  }

  hasEvent(eventId: EventLogId): boolean {
    return this.events.has(eventId);
  }
}
