import { Logger } from 'winston';

import { Element } from './Element';
import { SupportedEmoji } from './types';

export interface ParseResult {
  title?: string;
  content: Element[];
  icon?: SupportedEmoji;
}

export interface ParserRepository {
  parse: ({
    content,
    logger,
  }: {
    content: string;
    logger: Logger;
  }) => ParseResult;
}
