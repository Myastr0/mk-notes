import { EventLogId } from '../types/event-log.type';

export interface EventLoggerRepository {
  start: (eventId: EventLogId, message: string) => void;
  update: (eventId: EventLogId, message: string) => void;
  succeed: (eventId: EventLogId, message?: string) => void;
  fail: (eventId: EventLogId, message?: string) => void;

  startProgress: (eventId: EventLogId, message: string, total: number) => void;
  updateProgress: (eventId: EventLogId, progress: number) => void;
  succeedProgress: (eventId: EventLogId, message?: string) => void;
  failProgress: (eventId: EventLogId, message?: string) => void;

  clear: () => void;
}
