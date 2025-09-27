"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileConverter = void 0;
const elements_1 = require("../../domains/elements");
class FileConverter {
    htmlParser;
    markdownParser;
    logger;
    constructor({ htmlParser, markdownParser, logger, }) {
        this.htmlParser = htmlParser;
        this.markdownParser = markdownParser;
        this.logger = logger;
    }
    setCurrentFilePath(filePath) {
        if (this.markdownParser.setCurrentFilePath) {
            this.markdownParser.setCurrentFilePath(filePath);
        }
    }
    convertToElement(file) {
        const { content } = file;
        const args = {
            title: file.name,
            content: [],
            icon: undefined,
        };
        let parser = null;
        if (file.extension === 'md') {
            parser = this.markdownParser;
        }
        if (file.extension === 'html') {
            parser = this.htmlParser;
        }
        if (!parser) {
            throw new Error('File extension not supported');
        }
        const result = parser.parse({ content });
        return new elements_1.PageElement({
            ...args,
            ...result,
        });
    }
}
exports.FileConverter = FileConverter;
