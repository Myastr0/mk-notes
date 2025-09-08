import { accessSync, constants, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { FileSystemSourceRepository } from './fileSystem.source';

jest.mock('fs');

describe('FileSystemSourceRepository', () => {
  let repository: FileSystemSourceRepository;

  beforeEach(() => {
    repository = new FileSystemSourceRepository();
    jest.clearAllMocks();
  });

  describe('sourceIsAccessible', () => {
    it('should return true when directory path is readable', async () => {
      jest.mocked(accessSync).mockImplementation(() => undefined);
      jest.mocked(readdirSync).mockReturnValue([]);
      jest.mocked(statSync).mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);

      const result = await repository.sourceIsAccessible({ path: '/test/path' });

      expect(result).toBe(true);
      expect(accessSync).toHaveBeenCalledWith('/test/path', constants.R_OK);
    });

    it('should return true when file path is readable', async () => {
      jest.mocked(accessSync).mockImplementation(() => undefined);
      jest.mocked(statSync).mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);

      const result = await repository.sourceIsAccessible({ path: '/test/file.md' });

      expect(result).toBe(true);
      expect(accessSync).toHaveBeenCalledWith('/test/file.md', constants.R_OK);
    });

    it('should return false when file path is not readable', async () => {
      jest.mocked(accessSync).mockImplementation(() => {
        throw new Error('Access denied');
      });
      jest.mocked(statSync).mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);

      const result = await repository.sourceIsAccessible({ path: '/test/file.md' });

      expect(result).toBe(false);
    });

    it('should return false when path is neither file nor directory', async () => {
      jest.mocked(statSync).mockImplementation(() => {
        throw new Error('Path does not exist');
      });

      const result = await repository.sourceIsAccessible({ path: '/test/nonexistent' });

      expect(result).toBe(false);
    });

    it('should check all files in directory recursively', async () => {
      jest.mocked(accessSync).mockImplementation(() => undefined);
      jest.mocked(readdirSync).mockReturnValueOnce([
        { name: 'file1.md', isDirectory: () => false },
        { name: 'subdir', isDirectory: () => true }
      ] as any);
      jest.mocked(readdirSync).mockReturnValueOnce([
        { name: 'file2.md', isDirectory: () => false }
      ] as any);
      jest.mocked(statSync).mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);

      const result = await repository.sourceIsAccessible({ path: '/test/path' });

      expect(result).toBe(true);
      expect(accessSync).toHaveBeenCalledTimes(4); // root + 2 files + subdir
    });
  });

  describe('getFilePathList', () => {
    it('should return single file path when input is a markdown file', async () => {
      jest.mocked(statSync).mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);

      const result = await repository.getFilePathList({ path: '/test/file.md' });

      expect(result).toEqual(['/test/file.md']);
    });

    it('should throw error when input file is not a markdown file', async () => {
      jest.mocked(statSync).mockReturnValue({ isFile: () => true, isDirectory: () => false } as any);

      await expect(repository.getFilePathList({ path: '/test/file.txt' }))
        .rejects.toThrow('File /test/file.txt is not a markdown file. Only .md files are supported.');
    });

    it('should throw error when path is neither file nor directory', async () => {
      jest.mocked(statSync).mockImplementation(() => {
        throw new Error('Path does not exist');
      });

      await expect(repository.getFilePathList({ path: '/test/nonexistent' }))
        .rejects.toThrow('Path /test/nonexistent is neither a file nor a directory.');
    });

    it('should return empty array for empty directory', async () => {
      jest.mocked(readdirSync).mockReturnValue([]);
      jest.mocked(statSync).mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);

      const result = await repository.getFilePathList({ path: '/test/path' });

      expect(result).toEqual([]);
    });

    it('should return markdown files from directory', async () => {
      jest.mocked(readdirSync).mockReturnValueOnce([
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        { name: 'file2.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file3.md', isDirectory: () => false, isFile: () => true }
      ] as any);
      jest.mocked(statSync).mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);

      const result = await repository.getFilePathList({ path: '/test/path' });

      expect(result).toEqual([
        join('/test/path', 'file1.md'),
        join('/test/path', 'file3.md')
      ]);
    });

    it('should recursively get markdown files from subdirectories', async () => {
      jest.mocked(readdirSync).mockReturnValueOnce([
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        { name: 'subdir', isDirectory: () => true, isFile: () => false }
      ] as any);
      jest.mocked(readdirSync).mockReturnValueOnce([
        { name: 'file2.md', isDirectory: () => false, isFile: () => true }
      ] as any);
      jest.mocked(statSync).mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);

      const result = await repository.getFilePathList({ path: '/test/path' });

      expect(result).toEqual([
        join('/test/path', 'file1.md'),
        join('/test/path', 'subdir', 'file2.md')
      ]);
    });

    it('should throw error when directory cannot be read', async () => {
      jest.mocked(readdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });
      jest.mocked(statSync).mockReturnValue({ isFile: () => false, isDirectory: () => true } as any);

      await expect(repository.getFilePathList({ path: '/test/path' }))
        .rejects.toThrow('Error reading directory /test/path');
    });
  });

  describe('getFile', () => {
    it('should return file details', async () => {
      const mockDate = new Date();
      jest.mocked(readFileSync).mockReturnValue('file content');
      jest.mocked(statSync).mockReturnValue({ mtime: mockDate } as any);

      const result = await repository.getFile({ path: '/test/path/file.md' });

      expect(result).toEqual({
        name: 'file',
        content: 'file content',
        extension: 'md',
        lastUpdated: mockDate
      });
    });

    it('should handle files without extension', async () => {
      const mockDate = new Date();
      jest.mocked(readFileSync).mockReturnValue('file content');
      jest.mocked(statSync).mockReturnValue({ mtime: mockDate } as any);

      const result = await repository.getFile({ path: '/test/path/README' });

      expect(result).toEqual({
        name: 'README',
        content: 'file content',
        extension: '',
        lastUpdated: mockDate
      });
    });

    describe('index.md file handling', () => {
      it('should use parent folder name for index.md in subdirectory', async () => {
        const mockDate = new Date();
        jest.mocked(readFileSync).mockReturnValue('# Some Title\nContent here');
        jest.mocked(statSync).mockReturnValue({ mtime: mockDate } as any);

        const result = await repository.getFile({ path: '/test/docs/index.md' });

        expect(result).toEqual({
          name: 'index',
          content: '# Some Title\nContent here',
          extension: 'md',
          lastUpdated: mockDate
        });
      });

      it('should remove .md extension from index.md files', async () => {
        const mockDate = new Date();

        jest.mocked(readFileSync).mockReturnValue('# My Amazing Project\nWelcome to my project');
        jest.mocked(statSync).mockReturnValue({ mtime: mockDate } as any);

        const result = await repository.getFile({ path: 'index.md' });

        expect(result).toEqual({
          name: 'index',
          content: '# My Amazing Project\nWelcome to my project',
          extension: 'md',
          lastUpdated: mockDate
        });
      });

    });
  });
});
