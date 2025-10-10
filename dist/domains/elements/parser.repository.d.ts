import { Logger } from 'winston';
import { Element } from './Element';
import { SupportedEmoji } from './types';
export interface ParseResult {
    title?: string;
    content: Element[];
    icon?: SupportedEmoji;
}
export declare class ParserRepository {
    protected logger: Logger;
    constructor({ logger }: {
        logger: Logger;
    });
    parse(args: {
        content: string;
    }): ParseResult;
    setCurrentFilePath?(filePath: string): void;
}
