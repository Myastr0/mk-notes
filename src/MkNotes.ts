import * as fs from 'fs';
import winston from 'winston';

import {
  PreviewFormat,
  PreviewSynchronization,
  SynchronizeMarkdownToNotion,
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
    flat = false,
  }: {
    inputPath: string;
    format: PreviewFormat;
    output?: string;
    flat?: boolean;
  }): Promise<string> {
    const previewSynchronizationFeature = new PreviewSynchronization({
      sourceRepository: this.infrastructureInstances.fileSystemSource,
    });

    const result = await previewSynchronizationFeature.execute(
      {
        path: inputPath,
      },
      {
        format,
        flat,
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
    flat = false,
  }: {
    inputPath: string;
    parentNotionPageId: string;
    cleanSync?: boolean;
    lockPage?: boolean;
    flat?: boolean;
  }): Promise<void> {
    const synchronizeMarkdownToNotion = new SynchronizeMarkdownToNotion({
      logger: this.logger,
      destinationRepository: this.infrastructureInstances.notionDestination,
      elementConverter: this.infrastructureInstances.fileConverter,
      sourceRepository: this.infrastructureInstances.fileSystemSource,
    });

    await synchronizeMarkdownToNotion.execute({
      path: inputPath,
      notionParentPageUrl: parentNotionPageId,
      cleanSync,
      lockPage,
      flat,
    });
  }
}
