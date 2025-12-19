import { EventLogDefinition } from '@/domains/event-logs/types/event-log-definition.type';

export interface ParsingSourceEvent extends EventLogDefinition {
  id: 'parsing-source';
  type: 'spinner';
  message: 'Parsing source';
}
