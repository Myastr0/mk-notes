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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlParser = void 0;
const DomSerializer = __importStar(require("dom-serializer"));
const domelementtype_1 = require("domelementtype");
const htmlparser2_1 = require("htmlparser2");
const elements_1 = require("../../domains/elements");
class HtmlParser extends elements_1.ParserRepository {
    constructor({ logger }) {
        super({ logger });
    }
    parse({ content }) {
        const document = (0, htmlparser2_1.parseDocument)(content);
        const elements = [];
        for (const node of document.children) {
            if (node.type === domelementtype_1.ElementType.Tag) {
                switch (node.name) {
                    case 'details': {
                        const summaryNode = htmlparser2_1.DomUtils.findOne((n) => n.name === 'summary', node.children);
                        const detailsContent = DomSerializer.render(node);
                        elements.push(new elements_1.ToggleElement({
                            title: summaryNode ? htmlparser2_1.DomUtils.textContent(summaryNode) : '',
                            content: [new elements_1.TextElement({ text: detailsContent })],
                        }));
                        break;
                    }
                    case 'kbd':
                    case 'samp':
                        const codeElement = new elements_1.CodeElement({
                            text: htmlparser2_1.DomUtils.textContent(node),
                            language: elements_1.ElementCodeLanguage.PlainText,
                        });
                        elements.push(codeElement);
                        break;
                    case 'sub':
                        this.logger.warn('<sub> tag is not supported');
                        break;
                    case 'sup':
                        this.logger.warn('<sup> tag is not supported');
                        break;
                    case 'ins':
                        elements.push(new elements_1.TextElement({
                            text: htmlparser2_1.DomUtils.textContent(node),
                            styles: { underline: true },
                        }));
                        break;
                    case 'del':
                        elements.push(new elements_1.TextElement({
                            text: htmlparser2_1.DomUtils.textContent(node),
                            styles: { strikethrough: true },
                        }));
                        break;
                    case 'var':
                        elements.push(new elements_1.TextElement({
                            text: htmlparser2_1.DomUtils.textContent(node),
                            styles: { italic: true },
                        }));
                        break;
                    case 'q':
                        elements.push(new elements_1.QuoteElement({
                            text: htmlparser2_1.DomUtils.textContent(node),
                        }));
                        break;
                    case 'div':
                        elements.push(new elements_1.DividerElement());
                        break;
                    default:
                        break;
                }
            }
        }
        return {
            content: elements,
        };
    }
}
exports.HtmlParser = HtmlParser;
