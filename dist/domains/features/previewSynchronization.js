"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewSynchronization = exports.isValidFormat = void 0;
const sitemap_1 = require("../../domains/sitemap");
const serializers_1 = require("../../domains/sitemap/serializers");
const isValidFormat = (format) => {
    return (typeof format === 'string' && (format === 'plainText' || format === 'json'));
};
exports.isValidFormat = isValidFormat;
class PreviewSynchronization {
    sourceRepository;
    constructor(params) {
        this.sourceRepository = params.sourceRepository;
    }
    async execute(args, { format } = {}) {
        // Check if the GitHub repository is accessible
        try {
            await this.sourceRepository.sourceIsAccessible(args);
        }
        catch (err) {
            throw new Error(`Source is not accessible:`, {
                cause: err,
            });
        }
        let sitemapSerializer;
        if (!format) {
            sitemapSerializer = serializers_1.serializeInPlainText;
        }
        else {
            switch (format) {
                case 'plainText':
                    sitemapSerializer = serializers_1.serializeInPlainText;
                    break;
                case 'json':
                    sitemapSerializer = serializers_1.serializeInJson;
                    break;
                default:
                    throw new Error(`Invalid serialization format:`, format);
            }
        }
        const filePaths = await this.sourceRepository.getFilePathList(args);
        const siteMap = sitemap_1.SiteMap.buildFromFilePaths(filePaths);
        return sitemapSerializer(siteMap);
    }
}
exports.PreviewSynchronization = PreviewSynchronization;
