"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfrastructureInstances = void 0;
const filesystem_1 = require("../infrastructure/filesystem");
const html_1 = require("../infrastructure/html");
const markdown_1 = require("../infrastructure/markdown");
const notion_1 = require("../infrastructure/notion");
let infraInstances;
const buildInstances = ({ logger, notionApiKey, }) => {
    const fileUploadService = new notion_1.NotionFileUploadService({
        apiKey: notionApiKey,
        logger,
    });
    const notionConverter = new notion_1.NotionConverterRepository({
        logger,
        fileUploadService,
    });
    const htmlParser = new html_1.HtmlParser({ logger });
    const markdownParser = new markdown_1.MarkdownParser({ htmlParser, logger });
    return {
        fileSystemSource: new filesystem_1.FileSystemSourceRepository(),
        fileConverter: new filesystem_1.FileConverter({
            logger,
            htmlParser,
            markdownParser,
        }),
        htmlParser,
        markdownParser: new markdown_1.MarkdownParser({
            htmlParser,
            logger,
        }),
        notionDestination: new notion_1.NotionDestinationRepository({
            notionConverter,
            apiKey: notionApiKey,
        }),
        notionConverter,
    };
};
const getInfrastructureInstances = (args) => {
    if (!infraInstances) {
        infraInstances = buildInstances(args);
    }
    return infraInstances;
};
exports.getInfrastructureInstances = getInfrastructureInstances;
