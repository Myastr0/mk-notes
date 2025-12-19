import { EventLogDefinition } from '@/domains/event-logs/types/event-log-definition.type';

export interface SynchronizationProcessEvent extends EventLogDefinition {
  id: 'synchronization-process';
  message: string;
}
