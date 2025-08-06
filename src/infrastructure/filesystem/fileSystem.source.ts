import { accessSync, constants, readdirSync, readFileSync, statSync } from 'fs';
import { basename, extname, join } from 'path';

import { File } from '@/domains/synchronization';
import { SourceRepository } from '@/domains/synchronization';

export class FileSystemSourceRepository
  implements SourceRepository<{ path: string }>
{
  private isFile(path: string): boolean {
    try {
      const stats = statSync(path);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  private isDirectory(path: string): boolean {
    try {
      const stats = statSync(path);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  private isReadableRecursiveSync(path: string): boolean {
    try {
      // Check if the path is readable
      accessSync(path, constants.R_OK);

      // Get directory contents
      const entries = readdirSync(path, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(path, entry.name);

        if (entry.isDirectory()) {
          // Recursively check subdirectory readability
          if (!this.isReadableRecursiveSync(fullPath)) return false;
        } else {
          // Check if the file is readable
          try {
            accessSync(fullPath, constants.R_OK);
          } catch {
            return false;
          }
        }
      }

      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }

  private isReadableFile(path: string): boolean {
    try {
      accessSync(path, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async sourceIsAccessible({ path }: { path: string }) {
    if (this.isFile(path)) {
      return this.isReadableFile(path);
    } else if (this.isDirectory(path)) {
      return this.isReadableRecursiveSync(path);
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getFilePathList({ path }: { path: string }): Promise<string[]> {
    // If it's a single file, return it as a single-item array
    if (this.isFile(path)) {
      if (!path.endsWith('.md')) {
        throw new Error(
          `File ${path} is not a markdown file. Only .md files are supported.`
        );
      }
      return [path];
    }

    // If it's a directory, collect all markdown files recursively
    if (!this.isDirectory(path)) {
      throw new Error(`Path ${path} is neither a file nor a directory.`);
    }

    const markdownFiles: string[] = [];

    const collectMarkdownFiles = (dirPath: string) => {
      try {
        const entries = readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          if (entry.isDirectory()) {
            // Recursively process subdirectories
            collectMarkdownFiles(fullPath);
          } else if (entry.isFile() && fullPath.endsWith('.md')) {
            // Store markdown file path
            markdownFiles.push(fullPath);
          }
        }
      } catch (error) {
        throw new Error(`Error reading directory ${dirPath}`, { cause: error });
      }
    };

    collectMarkdownFiles(path);
    return markdownFiles;
  }

  private getLastUpdatedDate(filePath: string): Date {
    const stats = statSync(filePath);
    return stats.mtime; // mtime (modification time) represents last updated date
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getFile({ path }: { path: string }): Promise<File> {
    // Determine the display name for the Notion page
    const base = basename(path);
    let name = base;
    if (base.toLowerCase() === 'index.md') {
      // Use parent folder name for index.md
      const parts = path.split(/[\\/]/); // handle both / and \
      if (parts.length > 1) {
        name = parts[parts.length - 2];
      } else {
        name = 'index'; // fallback if no parent
      }
    } else if (base.toLowerCase().endsWith('.md')) {
      // Remove .md extension for all other files
      name = base.slice(0, -3);
    }
    return {
      name,
      content: readFileSync(path, 'utf-8'),
      extension: extname(path).slice(1),
      lastUpdated: this.getLastUpdatedDate(path),
    };
  }
}
