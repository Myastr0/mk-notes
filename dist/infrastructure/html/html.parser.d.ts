import { Logger } from 'winston';
import { type ParseResult, ParserRepository } from '../../domains/elements';
export declare class HtmlParser extends ParserRepository {
    constructor({ logger }: {
        logger: Logger;
    });
    parse({ content }: {
        content: string;
    }): ParseResult;
}
