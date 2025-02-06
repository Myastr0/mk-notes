import { Logger } from 'winston';

import { InfrastructureInstances } from '@/infrastructure';

import {
  FakeFileConverter,
  FakeNotionConverter,
} from './fakeConverter.repository';
import { FakeDestinationRepository } from './fakeDestination.repository';
import { fakeLogger } from './fakeLogger';
import {
  FakeMarkdownParser,
  FakeParserRepository,
} from './fakeParser.repository';
import { FakeSourceRepository } from './fakeSource.repository';

export type FakeInfrastructureInstances = ReturnType<
  typeof getFakeInfrastructureInstances
>;
export const getFakeInfrastructureInstances = () => {
  const logger = fakeLogger;
  const htmlParser = new FakeParserRepository({ logger });
  const markdownParser = new FakeMarkdownParser({ htmlParser, logger });
  return {
    fileSystemSource: new FakeSourceRepository(),
    notionDestination: new FakeDestinationRepository(),
    htmlParser,
    markdownParser,
    fileConverter: new FakeFileConverter({
      logger,
      htmlParser,
      markdownParser,
    }),
    notionConverter: new FakeNotionConverter({ logger }),
  } satisfies InfrastructureInstances;
};
