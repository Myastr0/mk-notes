"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserRepository = void 0;
class ParserRepository {
    logger;
    constructor({ logger }) {
        this.logger = logger;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    parse(args) {
        throw new Error('Method not implemented.');
    }
}
exports.ParserRepository = ParserRepository;
