import { SupportedEmoji } from '@/domains/elements/types';
import { File, FileContent, SourceRepository } from '@/domains/synchronization';

// Define a fake file implementation for testing purposes
export class FakeFile implements File {
  name: string;
  icon?: SupportedEmoji;
  content: FileContent;
  lastUpdated: Date;
  extension: string;

  constructor(
    name: string,
    content: FileContent,
    lastUpdated: Date,
    extension: string,
    icon?: SupportedEmoji
  ) {
    this.name = name;
    this.content = content;
    this.lastUpdated = lastUpdated;
    this.extension = extension;
    if (icon !== undefined) {
      this.icon = icon;
    }
  }
}
