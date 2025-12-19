import * as fs from 'fs';
import winston from 'winston';

import {
  PreviewSynchronization,
  PreviewSynchronizationOptions,
  SynchronizeMarkdownToNotion,
  SynchronizeOptions,
} from '@/domains';
import {
  getInfrastructureInstances,
  InfrastructureInstances,
} from '@/infrastructure';

import { LogLevel } from './domains/logger/types';

/**
 * MkNotes client
 */
export class MkNotes {
  public readonly logger: winston.Logger;
  private infrastructureInstances: InfrastructureInstances;

  constructor({
    LOG_LEVEL = 'error',
    logger,
    notionApiKey,
  }: {
    logger?: winston.Logger;
    LOG_LEVEL?: LogLevel;
    notionApiKey: string;
  }) {
    this.logger =
      logger ??
      winston.createLogger({
        level: LOG_LEVEL,
        transports: [new winston.transports.Console()],
      });
    this.infrastructureInstances = getInfrastructureInstances({
      logger: this.logger,
      notionApiKey,
    });
  }

  /**
   * Preview the synchronization of a markdown file to Notion
   */
  async previewSynchronization({
    inputPath,
    format,
    output,
  }: {
    inputPath: string;
    output?: string;
  } & PreviewSynchronizationOptions): Promise<string> {
    const previewSynchronizationFeature = new PreviewSynchronization({
      sourceRepository: this.infrastructureInstances.fileSystemSource,
      eventLogger: this.infrastructureInstances.eventLogger,
    });

    const result = await previewSynchronizationFeature.execute(
      {
        path: inputPath,
      },
      {
        format,
      }
    );

    if (!output) {
      return result;
    }

    fs.writeFileSync(output, result);

    return `Preview saved to ${output}`;
  }

  /**
   * Synchronize a markdown file to Notion
   */
  async synchronizeMarkdownToNotionFromFileSystem({
    inputPath,
    parentNotionPageId,
    cleanSync = false,
    lockPage = false,
    saveId = false,
    forceNew = false,
    flatten = false,
  }: {
    inputPath: string;
    parentNotionPageId: string;
  } & SynchronizeOptions): Promise<void> {
    const synchronizeMarkdownToNotion = new SynchronizeMarkdownToNotion({
      logger: this.logger,
      destinationRepository: this.infrastructureInstances.notionDestination,
      elementConverter: this.infrastructureInstances.fileConverter,
      sourceRepository: this.infrastructureInstances.fileSystemSource,
      eventLogger: this.infrastructureInstances.eventLogger,
    });

    await synchronizeMarkdownToNotion.execute({
      path: inputPath,
      notionParentPageUrl: parentNotionPageId,
      cleanSync,
      lockPage,
      saveId,
      forceNew,
      flatten,
    });
  }
}
