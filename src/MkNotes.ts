import winston from 'winston';

import { PreviewSynchronization, SynchronizeMarkdownToNotion } from '@/domains';
import { serializeInPlainText } from '@/domains/sitemap/serializers/plainText.serializer';
import {
  getInfrastructureInstances,
  InfrastructureInstances,
} from '@/infrastructure';

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
    LOG_LEVEL?: string;
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
   *
   */
  async previewSynchronization({
    inputPath,
  }: {
    inputPath: string;
  }): Promise<string> {
    const previewSynchronizationFeature = new PreviewSynchronization({
      sourceRepository: this.infrastructureInstances.fileSystemSource,
    });

    const siteMap = await previewSynchronizationFeature.execute({
      path: inputPath,
    });

    return serializeInPlainText(siteMap);
  }

  /**
   *
   */
  async synchronizeMardownToNotionFromFileSystem({
    inputPath,
    parentNotionPageId,
  }: {
    inputPath: string;
    parentNotionPageId: string;
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
    });
  }
}
