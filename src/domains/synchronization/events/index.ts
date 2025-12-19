import { CheckDestinationIsAccessibleEvent } from './check-destination-is-accessible.event';
import { CheckSourceIsAccessibleEvent } from './check-source-is-accessible.event';
import { SynchronizationProcessEvent } from './synchronization-process.event';

export type SynchronizationEvents =
  | CheckSourceIsAccessibleEvent
  | CheckDestinationIsAccessibleEvent
  | SynchronizationProcessEvent;
