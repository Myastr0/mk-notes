import { SupportedEmoji } from '@/domains/elements/types';
import { File, FileContent, SourceRepository } from '@/domains/synchronization';

// Define a fake file implementation for testing purposes
export class FileFixture implements File {
  name: string;
  icon?: SupportedEmoji;
  content: FileContent;
  lastUpdated: Date;
  extension: string;
  path: string = 'fake-file-path';

  constructor({
    name,
    content,
    lastUpdated,
    extension,
    icon,
    path,
  }: {
    name?: string;
    content?: FileContent;
    lastUpdated?: Date;
    extension?: string;
    icon?: SupportedEmoji;
    path?: string;
  } = {}) {
    this.name = name ?? 'fake-file-name';
    this.content = content ?? '# Test';
    this.lastUpdated = lastUpdated ?? new Date();
    this.extension = extension ?? 'md';
    if (icon !== undefined) {
      this.icon = icon;
    }
    this.path = path ?? this.path;
  }
}
