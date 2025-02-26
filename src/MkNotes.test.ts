import fs from 'fs';

import { getFakeInfrastructureInstances } from '../__tests__/__fakes__/fakeInfrastructureInstances';
import { FakeInfrastructureInstances } from '../__tests__/__fakes__/fakeInfrastructureInstances';
import { fakeLogger } from '../__tests__/__fakes__/fakeLogger';
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
  });

  describe('synchronizeMarkdownToNotionFromFileSystem', () => {
    it('should synchronize markdown file to Notion', async () => {
      const createPageSpy = jest.spyOn(
        infrastructureInstances.notionDestination,
        'createPage'
      );

      const notionPageUrl =
        'https://www.notion.so/workspace/Test-Page-12345678901234567890123456789012';

      await mkNotes.synchronizeMarkdownToNotionFromFileSystem({
        inputPath: 'fake/input/path.md',
        parentNotionPageId: notionPageUrl,
      });

      expect(createPageSpy).toHaveBeenCalled();
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
