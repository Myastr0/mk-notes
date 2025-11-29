import { Logger } from 'winston';

import { Element, PageElementProperties } from './Element';
import { SupportedEmoji } from './types';

export interface ParseResult {
  mkNotesInternalId?: string;
  title?: string;
  properties?: PageElementProperties[];
  content: Element[];
  icon?: SupportedEmoji;
}

export class ParserRepository {
  protected logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this.logger = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(args: { content: string }): ParseResult {
    throw new Error('Method not implemented.');
  }

  setCurrentFilePath?(filePath: string): void;
}
