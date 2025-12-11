import { Logger } from 'winston';

import { Element, PageElementProperties } from '../entities/Element';
import { SupportedEmoji } from '../types';

export interface ParseResult {
  id?: string;
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
  parse(args: { content: string; filepath?: string }): ParseResult {
    throw new Error('Method not implemented.');
  }
}
