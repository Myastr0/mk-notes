import { SupportedEmoji } from '@/domains/elements/types';
import { File, FileContent, SourceRepository } from '@/domains/synchronization';

// Define a fake file implementation for testing purposes
export class FakeFile implements File {
  name: string;
  icon?: SupportedEmoji;
  content: FileContent;
  lastUpdated: Date;
  extension: string;

  constructor({
    name,
    content,
    lastUpdated,
    extension,
    icon,
  }: {
    name?: string;
    content?: FileContent;
    lastUpdated?: Date;
    extension?: string;
    icon?: SupportedEmoji;
  } = {}) {
    this.name = name ?? 'fake-file-name';
    this.content = content ?? '# Test';
    this.lastUpdated = lastUpdated ?? new Date();
    this.extension = extension ?? 'md';
    if (icon !== undefined) {
      this.icon = icon;
    }
  }
}
