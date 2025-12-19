import { EventLogDefinition } from '@/domains/event-logs/types/event-log-definition.type';

export interface CheckSourceIsAccessibleEvent extends EventLogDefinition {
  id: 'check-source-is-accessible';
  message: string;
}
