import { Logger } from 'winston';

import { Element } from '@/domains/elements/entities/Element';
import {
  ParseResult,
  ParserRepository,
} from '@/domains/elements/repositories/parser.repository';
import { SupportedEmoji } from '@/domains/elements/types';

import { MarkdownParser } from '../../../src/infrastructure/parsers/markdown';
import { ElementFixture } from '../../__fixtures__/element.fixture';

// Fake implementation of the ParserRepository
export class FakeParserRepository extends ParserRepository {
  constructor({ logger }: { logger: Logger }) {
    super({ logger });
  }

  // Simulate parsing content into a ParseResult
  parse({ content }: { content: string }): ParseResult {
    // Here you would implement the logic to parse the content into elements and other properties
    // For demonstration purposes, let's create a fake ParseResult with some fake elements and icon
    const fakeElements: Element[] = [
      new ElementFixture({ id: 'fakeId1', name: 'Fake Name 1' }),
      new ElementFixture({ id: 'fakeId2', name: 'Fake Name 2' }),
    ];
    const fakeIcon: SupportedEmoji = '😊'; // Example of a supported emoji

    return {
      content: fakeElements,
      icon: fakeIcon,
    };
  }
}

export class FakeMarkdownParser extends MarkdownParser {
  parse({ content }: { content: string }): ParseResult {
    const fakeElements: Element[] = [
      new ElementFixture({ id: 'fakeId1', name: 'Fake Name 1' }),
      new ElementFixture({ id: 'fakeId2', name: 'Fake Name 2' }),
    ];
    const fakeIcon: SupportedEmoji = '😊';

    return {
      content: fakeElements,
      icon: fakeIcon,
    };
  }
}
