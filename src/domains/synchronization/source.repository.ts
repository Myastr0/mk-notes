import { SupportedEmoji } from '@/domains/elements/types';

export type FileContent = string;

export interface File {
  name: string;
  icon?: SupportedEmoji;
  content: FileContent;
  lastUpdated: Date;
  extension: string;
}

export interface SourceRepository<T> {
  getFilePathList: (args: T) => Promise<string[]>;
  getFile: (args: T) => Promise<File>;
  sourceIsAccessible: (args: T) => Promise<boolean>;
}
