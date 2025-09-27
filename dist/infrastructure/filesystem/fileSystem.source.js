"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemSourceRepository = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class FileSystemSourceRepository {
    isFile(path) {
        try {
            const stats = (0, fs_1.statSync)(path);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
    isDirectory(path) {
        try {
            const stats = (0, fs_1.statSync)(path);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    isReadableRecursiveSync(path) {
        try {
            // Check if the path is readable
            (0, fs_1.accessSync)(path, fs_1.constants.R_OK);
            // Get directory contents
            const entries = (0, fs_1.readdirSync)(path, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = (0, path_1.join)(path, entry.name);
                if (entry.isDirectory()) {
                    // Recursively check subdirectory readability
                    if (!this.isReadableRecursiveSync(fullPath))
                        return false;
                }
                else {
                    // Check if the file is readable
                    try {
                        (0, fs_1.accessSync)(fullPath, fs_1.constants.R_OK);
                    }
                    catch {
                        return false;
                    }
                }
            }
            return true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (error) {
            return false;
        }
    }
    isReadableFile(path) {
        try {
            (0, fs_1.accessSync)(path, fs_1.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async sourceIsAccessible({ path }) {
        if (this.isFile(path)) {
            return this.isReadableFile(path);
        }
        else if (this.isDirectory(path)) {
            return this.isReadableRecursiveSync(path);
        }
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async getFilePathList({ path }) {
        // If it's a single file, return it as a single-item array
        if (this.isFile(path)) {
            if (!path.endsWith('.md')) {
                throw new Error(`File ${path} is not a markdown file. Only .md files are supported.`);
            }
            return [path];
        }
        // If it's a directory, collect all markdown files recursively
        if (!this.isDirectory(path)) {
            throw new Error(`Path ${path} is neither a file nor a directory.`);
        }
        const markdownFiles = [];
        const collectMarkdownFiles = (dirPath) => {
            try {
                const entries = (0, fs_1.readdirSync)(dirPath, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = (0, path_1.join)(dirPath, entry.name);
                    if (entry.isDirectory()) {
                        // Recursively process subdirectories
                        collectMarkdownFiles(fullPath);
                    }
                    else if (entry.isFile() && fullPath.endsWith('.md')) {
                        // Store markdown file path
                        markdownFiles.push(fullPath);
                    }
                }
            }
            catch (error) {
                throw new Error(`Error reading directory ${dirPath}`, { cause: error });
            }
        };
        collectMarkdownFiles(path);
        return markdownFiles;
    }
    getLastUpdatedDate(filePath) {
        const stats = (0, fs_1.statSync)(filePath);
        return stats.mtime; // mtime (modification time) represents last updated date
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async getFile({ path }) {
        // Determine the display name for the Notion page
        const base = (0, path_1.basename)(path);
        let name = base;
        if (base.toLowerCase().endsWith('.md')) {
            // Remove .md extension for all other files
            name = base.slice(0, -3);
        }
        return {
            name,
            content: (0, fs_1.readFileSync)(path, 'utf-8'),
            extension: (0, path_1.extname)(path).slice(1),
            lastUpdated: this.getLastUpdatedDate(path),
        };
    }
}
exports.FileSystemSourceRepository = FileSystemSourceRepository;
