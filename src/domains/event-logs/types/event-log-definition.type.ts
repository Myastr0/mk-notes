export type EventLogType = 'spinner' | 'progress' | 'text';

export interface EventLogDefinition {
  id: string;
  type: EventLogType;
  message: string;
  progress?: number;
}
