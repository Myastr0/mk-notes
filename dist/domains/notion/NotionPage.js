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
    isLocked;
    constructor({ pageId, children, createdAt, icon, updatedAt, properties, isLocked, }) {
        this.pageId = pageId;
        this.children = children;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt || createdAt;
        this.icon = icon;
        this.properties = properties;
        this.isLocked = isLocked;
    }
    static fromPartialCreatePageBodyParameters(args) {
        return new NotionPage({
            children: args.children ?? [],
            properties: args.properties,
            icon: args.icon !== undefined && args.icon !== null ? args.icon : undefined,
            // Notion page is not locked on creation
            isLocked: false,
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
