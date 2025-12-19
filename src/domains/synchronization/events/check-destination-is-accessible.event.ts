import { EventLogDefinition } from '@/domains/event-logs/types/event-log-definition.type';

export interface CheckDestinationIsAccessibleEvent extends EventLogDefinition {
  id: 'check-destination-is-accessible';
  message: string;
}
