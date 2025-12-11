import { Logger } from 'winston';

import { InfrastructureInstances } from '@/infrastructure';

import {
  FakeFileConverter,
  FakeNotionConverter,
} from './elements/fake-converter.repository';
import {
  FakeMarkdownParser,
  FakeParserRepository,
} from './elements/fake-parser.repository';
import { fakeLogger } from './logger/fake-logger';
import { FakeDestinationRepository } from './synchronization/fake-destination.repository';
import { FakeSourceRepository } from './synchronization/fake-source.repository';

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
