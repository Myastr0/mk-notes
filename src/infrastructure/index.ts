import { Logger } from 'winston';

import {
  DestinationRepository,
  ElementConverterRepository,
  PageElement,
  SourceRepository,
} from '@/domains';
import {
  FileConverter,
  FileSystemSourceRepository,
} from '@/infrastructure/filesystem';
import { HtmlParser } from '@/infrastructure/html';
import { MarkdownParser } from '@/infrastructure/markdown';
import {
  NotionConverterRepository,
  NotionDestinationRepository,
  NotionFileUploadService,
  NotionPage,
} from '@/infrastructure/notion';

let infraInstances: InfrastructureInstances | null;

interface getInfrastructureInstanceProps {
  logger: Logger;
  notionApiKey: string;
}

export interface InfrastructureInstances {
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
  const notionConverter = new NotionConverterRepository({
    logger,
    fileUploadService,
  });
  const htmlParser = new HtmlParser({ logger });
  const markdownParser = new MarkdownParser({ htmlParser, logger });

  return {
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
      notionConverter,
      apiKey: notionApiKey,
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
