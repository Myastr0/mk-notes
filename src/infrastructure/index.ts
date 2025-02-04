import { Logger } from 'winston';

import { FileConverter } from '@/infrastructure/filesystem/file.converter';
import { FileSystemSourceRepository } from '@/infrastructure/filesystem/fileSystem.source';
import { HtmlParser } from '@/infrastructure/html/html.parser';
import { MarkdownParser } from '@/infrastructure/markdown/markdown.parser';
import { NotionConverterRepository } from '@/infrastructure/notion/notion.converter';
import { NotionDestinationRepository } from '@/infrastructure/notion/notion.destination';

let infraInstances: InfrastructureInstances | null;

interface getInfrastructureInstanceProps {
  logger: Logger;
  notionApiKey: string;
}

export interface InfrastructureInstances {
  fileSystemSource: FileSystemSourceRepository;
  fileConverter: FileConverter;
  htmlParser: HtmlParser;
  markdownParser: MarkdownParser;
  notionDestination: NotionDestinationRepository;
  notionConverter: NotionConverterRepository;
}

const buildInstances = ({
  logger,
  notionApiKey,
}: getInfrastructureInstanceProps): InfrastructureInstances => {
  const notionConverter = new NotionConverterRepository({ logger });
  const htmlParser = new HtmlParser({ logger });
  const markdownParser = new MarkdownParser({ htmlParser });

  return {
    fileSystemSource: new FileSystemSourceRepository(),
    fileConverter: new FileConverter({
      logger,
      htmlParser,
      markdownParser,
    }),
    htmlParser: new HtmlParser({ logger }),
    markdownParser: new MarkdownParser({
      htmlParser: new HtmlParser({ logger }),
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
