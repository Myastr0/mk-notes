"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionPage = void 0;
class NotionPage {
    pageId;
    icon;
    title;
    properties;
    children;
    createdAt;
    updatedAt;
    constructor({ pageId, children, createdAt, icon, updatedAt, properties, }) {
        this.pageId = pageId;
        this.children = children;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt || createdAt;
        this.icon = icon;
        this.properties = properties;
    }
    static fromPartialCreatePageBodyParameters(args) {
        return new NotionPage({
            children: args.children ?? [],
            properties: args.properties,
            icon: args.icon !== undefined && args.icon !== null ? args.icon : undefined,
        });
    }
    toCreatePageBodyParameters() {
        return {
            children: this.children,
            properties: this.properties,
            icon: this.icon,
        };
    }
}
exports.NotionPage = NotionPage;
