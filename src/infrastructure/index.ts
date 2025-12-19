import { Logger } from 'winston';

import {
  DestinationRepository,
  ElementConverterRepository,
  PageElement,
  SourceRepository,
} from '@/domains';
import { EventLoggerRepository } from '@/domains/event-logs/repositories/event-logger.repository';
import { NotionPage } from '@/domains/notion/entities/NotionPage';
// Infrastructure imports
import { FileConverter } from '@/infrastructure/converters/file/file.converter';
import { NotionConverterRepository } from '@/infrastructure/converters/notion/notion.converter';
import { NotionFileUploadService } from '@/infrastructure/destinations/notion/file-upload.service';
import { NotionDestinationRepository } from '@/infrastructure/destinations/notion/notion.destination';
import { NotionClientRepository } from '@/infrastructure/notion/notion-client.repository';
import { HtmlParser } from '@/infrastructure/parsers/html';
import { MarkdownParser } from '@/infrastructure/parsers/markdown';
import { FileSystemSourceRepository } from '@/infrastructure/sources/filesystem/fileSystem.source';

import { TerminalUiEventLoggerRepository } from './tui/terminal-ui-event-logger.repository';

let infraInstances: InfrastructureInstances | null;

interface getInfrastructureInstanceProps {
  logger: Logger;
  notionApiKey: string;
}

export interface InfrastructureInstances {
  eventLogger: EventLoggerRepository;
  fileSystemSource: SourceRepository<{ path: string }>;
  fileConverter: FileConverter;
  htmlParser: HtmlParser;
  markdownParser: MarkdownParser;
  notionDestination: DestinationRepository<NotionPage>;
  notionConverter: ElementConverterRepository<PageElement, NotionPage>;
}

const buildInstances = ({
  logger,
  notionApiKey,
}: getInfrastructureInstanceProps): InfrastructureInstances => {
  const fileUploadService = new NotionFileUploadService({
    apiKey: notionApiKey,
    logger,
  });
  const notionClient = new NotionClientRepository({
    apiKey: notionApiKey,
  });
  const notionConverter = new NotionConverterRepository({
    logger,
    fileUploadService,
  });
  const htmlParser = new HtmlParser({ logger });
  const markdownParser = new MarkdownParser({ htmlParser, logger });

  return {
    eventLogger: new TerminalUiEventLoggerRepository(),
    fileSystemSource: new FileSystemSourceRepository(),
    fileConverter: new FileConverter({
      logger,
      htmlParser,
      markdownParser,
    }),
    htmlParser,
    markdownParser: new MarkdownParser({
      htmlParser,
      logger,
    }),
    notionDestination: new NotionDestinationRepository({
      logger,
      notionConverter,
      notionClient,
    }),
    notionConverter,
  };
};
export const getInfrastructureInstances = (
  args: getInfrastructureInstanceProps
): InfrastructureInstances => {
  if (!infraInstances) {
    infraInstances = buildInstances(args);
  }

  return infraInstances;
};
