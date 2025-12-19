import ora from 'ora';

import { EventLoggerRepository } from '@/domains/event-logs/repositories/event-logger.repository';
import { EventLogId } from '@/domains/event-logs/types/event-log.type';

export class ProgressState {
  private spinner: ora.Ora;

  constructor(
    public message: string,
    public total: number,
    public current: number
  ) {
    this.spinner = ora({
      text: this.toText(),
      spinner: 'dots',
    }).start();
  }

  public increment(value: number): void {
    this.current += value;
    this.spinner.text = this.toText();
  }

  public toText(): string {
    return `${this.message} ${this.current}/${this.total}`;
  }

  public succeed(): void {
    this.spinner.succeed();
  }

  public fail(): void {
    this.spinner.fail();
  }
}

export class TerminalUiEventLoggerRepository implements EventLoggerRepository {
  private spinners: Map<EventLogId, ora.Ora> = new Map();
  private progress: Map<EventLogId, ProgressState> = new Map();
  /**
   * ------------------------------------------------------------
   * SPINNERS METHODS
   * ------------------------------------------------------------
   */
  start(eventId: EventLogId, message: string): void {
    if (this.spinners.has(eventId)) {
      this.spinners.get(eventId)!.text = message;
      return;
    }

    const spinner = ora({
      text: message,
      spinner: 'dots',
    }).start();

    this.spinners.set(eventId, spinner);
  }

  update(eventId: EventLogId, message: string): void {
    if (!this.spinners.has(eventId)) {
      return;
    }

    this.spinners.get(eventId)!.text = message;
  }

  succeed(eventId: EventLogId, message?: string): void {
    if (!this.spinners.has(eventId)) {
      return;
    }

    this.spinners.get(eventId)!.succeed(message);
  }

  fail(eventId: EventLogId, message?: string): void {
    if (!this.spinners.has(eventId)) {
      return;
    }

    this.spinners.get(eventId)!.fail(message);
  }

  /**
   * ------------------------------------------------------------
   * PROGRESS METHODS
   * ------------------------------------------------------------
   */
  startProgress(eventId: EventLogId, message: string, total: number): void {
    if (this.progress.has(eventId)) {
      return;
    }

    const progressState = new ProgressState(message, total, 0);
    this.progress.set(eventId, progressState);
  }

  updateProgress(eventId: EventLogId, progress: number): void {
    if (!this.progress.has(eventId)) {
      return;
    }

    this.progress.get(eventId)!.increment(progress);
  }

  succeedProgress(eventId: EventLogId): void {
    if (!this.progress.has(eventId)) {
      return;
    }

    this.progress.get(eventId)!.succeed();
    this.progress.delete(eventId);
  }

  failProgress(eventId: EventLogId): void {
    if (!this.progress.has(eventId)) {
      return;
    }

    this.progress.get(eventId)!.fail();
    this.progress.delete(eventId);
  }
  /**
   * ------------------------------------------------------------
   * CLEAR METHODS
   * ------------------------------------------------------------
   */
  clear(): void {
    this.spinners.forEach((spinner) => {
      spinner.stop();
    });
  }
}
