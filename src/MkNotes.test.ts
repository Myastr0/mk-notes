import fs from 'fs';

import { getFakeInfrastructureInstances } from '../__tests__/__fakes__/fakeInfrastructureInstances';
import { FakeInfrastructureInstances } from '../__tests__/__fakes__/fakeInfrastructureInstances';
import { fakeLogger } from '../__tests__/__fakes__/logger/fake-logger';
import { MkNotes } from './MkNotes';
import { getInfrastructureInstances } from './infrastructure';

// Mock dependencies
jest.mock('fs');
jest.mock('@/infrastructure', () => ({
  getInfrastructureInstances: jest.fn().mockImplementation(() => {
    return getFakeInfrastructureInstances();
  }),
}));

describe('MkNotes', () => {
  let mkNotes: MkNotes;
  let infrastructureInstances: FakeInfrastructureInstances;

  beforeEach(() => {
    jest.clearAllMocks();
    infrastructureInstances = getFakeInfrastructureInstances();

    // Mock getInfrastructureInstances to return our specific instance
    jest
      .mocked(getInfrastructureInstances)
      .mockReturnValue(infrastructureInstances);

    mkNotes = new MkNotes({
      logger: fakeLogger,
      notionApiKey: 'fake-api-key',
    });
  });

  describe('previewSynchronization', () => {
    it('should display preview in console when no output file is specified', async () => {

      const result = await mkNotes.previewSynchronization({
        inputPath: 'fake/input/path.md',
        format: 'json',
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toEqual(expect.any(Object));
    });

    it('should save preview to file when output file is specified', async () => {
      const writeFileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation();
      const outputPath = 'fake/output/path.json';

      await mkNotes.previewSynchronization({
        inputPath: 'fake/input/path.md',
        format: 'json',
        output: outputPath,
      });

      expect(writeFileSpy).toHaveBeenCalledWith(outputPath, expect.any(String));
    });

    it('should support flatten option', async () => {
      const result = await mkNotes.previewSynchronization({
        inputPath: 'fake/input/path.md',
        format: 'json',
        flatten: true,
      });

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toEqual(expect.any(Object));
    });
  });

  describe('synchronizeMarkdownToNotionFromFileSystem', () => {
    it('should synchronize markdown file to Notion', async () => {
      const updatePageSpy = jest.spyOn(
        infrastructureInstances.notionDestination,
        'updatePage'
      );

      const notionPageUrl =
        'https://www.notion.so/workspace/Test-Page-12345678901234567890123456789012';

      await mkNotes.synchronizeMarkdownToNotionFromFileSystem({
        inputPath: 'fake/input/path.md',
        parentNotionPageId: notionPageUrl,
        cleanSync: false,
        lockPage: false,
        saveId: false,
        forceNew: false,
        flatten: false,
      });

      // Without cleanSync, the root file updates the parent page
      expect(updatePageSpy).toHaveBeenCalled();
    });

    it('should support flatten option', async () => {
      const updatePageSpy = jest.spyOn(
        infrastructureInstances.notionDestination,
        'updatePage'
      );

      const notionPageUrl =
        'https://www.notion.so/workspace/Test-Page-12345678901234567890123456789012';

      await mkNotes.synchronizeMarkdownToNotionFromFileSystem({
        inputPath: 'fake/input/path.md',
        parentNotionPageId: notionPageUrl,
        cleanSync: false,
        lockPage: false,
        saveId: false,
        forceNew: false,
        flatten: true,
      });

      // With flatten, root node is skipped, so updatePage should not be called
      expect(updatePageSpy).not.toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should create an instance with default parameters', () => {
      const instance = new MkNotes({
        notionApiKey: 'fake-api-key',
      });

      expect(instance.logger).toBeDefined();
    });

    it('should use the provided logger', () => {
      const instance = new MkNotes({
        logger: fakeLogger,
        notionApiKey: 'fake-api-key',
      });

      expect(instance.logger).toBe(fakeLogger);
    });
  });
});
