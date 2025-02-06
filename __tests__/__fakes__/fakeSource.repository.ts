// Fake implementation of the SourceRepository
import { SupportedEmoji } from '@/domains/elements';
import { File, FileContent, SourceRepository } from '@/domains/synchronization';

import { FakeFile } from './fakeFile';

export class FakeSourceRepository<T> implements SourceRepository<T> {
  // Simulate getting a list of file paths from the source

  // eslint-disable-next-line @typescript-eslint/require-await
  async getFilePathList(args: T): Promise<string[]> {
    // Here you would implement the logic to fetch file paths from the fake source
    return ['fakeFilePath1', 'fakeFilePath2'];
  }

  // Simulate getting a file content from the source
  // eslint-disable-next-line @typescript-eslint/require-await
  async getFile(args: T): Promise<File> {
    // Here you would implement the logic to fetch file content from the fake source
    const fakeContent: FileContent = 'Fake file content';
    const fakeLastUpdated = new Date();
    const fakeExtension = '.txt';
    const fakeIcon: SupportedEmoji = '😊'; // Example of a supported emoji

    return new FakeFile(
      'fakeFileName',
      fakeContent,
      fakeLastUpdated,
      fakeExtension,
      fakeIcon
    );
  }

  // Simulate checking if the source is accessible

  // eslint-disable-next-line @typescript-eslint/require-await
  async sourceIsAccessible(args: T): Promise<boolean> {
    // Here you would implement the logic to check if the source is accessible
    // For demonstration purposes, let's return a boolean value
    return true;
  }
}
