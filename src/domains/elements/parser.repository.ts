import { Logger } from 'winston';

import { Element } from './Element';
import { SupportedEmoji } from './types';

export interface ParseResult {
  title?: string;
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
