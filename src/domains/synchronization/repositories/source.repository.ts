import { SupportedEmoji } from '@/domains/elements/types';

export type FileContent = string;

export class File {
  name: string;
  icon?: SupportedEmoji;
  content: FileContent;
  path: string;
  lastUpdated: Date;
  extension: string;

  constructor({
    name,
    content,
    path,
    lastUpdated,
    extension,
  }: {
    name: string;
    icon?: SupportedEmoji;
    content: FileContent;
    path: string;
    lastUpdated: Date;
    extension: string;
  }) {
    this.name = name;
    this.content = content;
    this.path = path;
    this.lastUpdated = lastUpdated;
    this.extension = extension;
  }
}

export interface SourceRepository<T> {
  getFilePathList: (args: T) => Promise<string[]>;
  getFile: (args: T) => Promise<File>;
  updateFile: (args: File) => Promise<void>;
  sourceIsAccessible: (args: T) => Promise<boolean>;
}
