"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPageObjectResponse = void 0;
const isPageObjectResponse = (obj) => {
    return (typeof obj === 'object' &&
        obj !== null &&
        obj.object === 'page' &&
        typeof obj.id === 'string' &&
        typeof obj.created_time === 'string' &&
        typeof obj.last_edited_time === 'string' &&
        typeof obj.archived === 'boolean' &&
        typeof obj.in_trash === 'boolean' &&
        typeof obj.url === 'string' &&
        (typeof obj.public_url === 'string' || obj.public_url === null) &&
        isParent(obj.parent) &&
        typeof obj.properties === 'object' &&
        isIcon(obj.icon) &&
        isCover(obj.cover) &&
        isCreatedBy(obj.created_by) &&
        isLastEditedBy(obj.last_edited_by));
};
exports.isPageObjectResponse = isPageObjectResponse;
// Helper function to check the parent field
function isParent(parent) {
    return (typeof parent === 'object' &&
        parent !== null &&
        'type' in parent &&
        'database_id' in parent &&
        ((parent.type === 'database_id' &&
            typeof parent.database_id === 'string') ||
            (parent.type === 'page_id' &&
                'page_id' in parent &&
                typeof parent.page_id === 'string') ||
            (parent.type === 'block_id' &&
                'block_id' in parent &&
                typeof parent.block_id === 'string') ||
            (parent.type === 'workspace' &&
                'workspace' in parent &&
                parent.workspace === true)));
}
// Helper function to check the icon field
function isIcon(icon) {
    return (icon === null ||
        (typeof icon === 'object' &&
            (('type' in icon &&
                typeof icon.type === 'string' &&
                icon.type === 'emoji' &&
                'emoji' in icon &&
                typeof icon.emoji === 'string') ||
                ('type' in icon &&
                    typeof icon.type === 'string' &&
                    icon.type === 'external' &&
                    'external' in icon &&
                    typeof icon.external === 'object' &&
                    icon.external !== null &&
                    'url' in icon.external &&
                    typeof icon.external.url === 'string') ||
                ('type' in icon &&
                    typeof icon.type === 'string' &&
                    icon.type === 'file' &&
                    'file' in icon &&
                    typeof icon.file === 'object' &&
                    icon.file !== null &&
                    'url' in icon.file &&
                    'expiry_time' in icon.file &&
                    typeof icon.file.url === 'string' &&
                    typeof icon.file.expiry_time === 'string'))));
}
// Helper function to check the cover field
function isCover(cover) {
    return (cover === null ||
        (typeof cover === 'object' &&
            (('type' in cover &&
                typeof cover.type === 'string' &&
                cover.type === 'external' &&
                'external' in cover &&
                typeof cover.external === 'object' &&
                cover.external !== null &&
                'url' in cover.external &&
                typeof cover.external.url === 'string') ||
                ('type' in cover &&
                    typeof cover.type === 'string' &&
                    cover.type === 'file' &&
                    'file' in cover &&
                    cover.file !== null &&
                    typeof cover.file === 'object' &&
                    'url' in cover.file &&
                    'expiry_time' in cover.file &&
                    typeof cover.file.url === 'string' &&
                    typeof cover.file.expiry_time === 'string'))));
}
// Helper function to check created_by field
function isCreatedBy(created_by) {
    return typeof created_by === 'object'; // Assuming PartialUserObjectResponse is an object, refine this if needed
}
// Helper function to check last_edited_by field
function isLastEditedBy(last_edited_by) {
    return typeof last_edited_by === 'object'; // Assuming PartialUserObjectResponse is an object, refine this if needed
}
