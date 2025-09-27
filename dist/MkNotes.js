"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MkNotes = void 0;
const fs = __importStar(require("fs"));
const winston_1 = __importDefault(require("winston"));
const domains_1 = require("./domains");
const infrastructure_1 = require("./infrastructure");
/**
 * MkNotes client
 */
class MkNotes {
    logger;
    infrastructureInstances;
    constructor({ LOG_LEVEL = 'error', logger, notionApiKey, }) {
        this.logger =
            logger ??
                winston_1.default.createLogger({
                    level: LOG_LEVEL,
                    transports: [new winston_1.default.transports.Console()],
                });
        this.infrastructureInstances = (0, infrastructure_1.getInfrastructureInstances)({
            logger: this.logger,
            notionApiKey,
        });
    }
    /**
     * Preview the synchronization of a markdown file to Notion
     */
    async previewSynchronization({ inputPath, format, output, }) {
        const previewSynchronizationFeature = new domains_1.PreviewSynchronization({
            sourceRepository: this.infrastructureInstances.fileSystemSource,
        });
        const result = await previewSynchronizationFeature.execute({
            path: inputPath,
        }, {
            format,
        });
        if (!output) {
            return result;
        }
        fs.writeFileSync(output, result);
        return `Preview saved to ${output}`;
    }
    /**
     * Synchronize a markdown file to Notion
     */
    async synchronizeMarkdownToNotionFromFileSystem({ inputPath, parentNotionPageId, cleanSync = false, }) {
        const synchronizeMarkdownToNotion = new domains_1.SynchronizeMarkdownToNotion({
            logger: this.logger,
            destinationRepository: this.infrastructureInstances.notionDestination,
            elementConverter: this.infrastructureInstances.fileConverter,
            sourceRepository: this.infrastructureInstances.fileSystemSource,
        });
        await synchronizeMarkdownToNotion.execute({
            path: inputPath,
            notionParentPageUrl: parentNotionPageId,
            cleanSync,
        });
    }
}
exports.MkNotes = MkNotes;
