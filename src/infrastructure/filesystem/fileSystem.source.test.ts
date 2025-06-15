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
    it('should return true when path is readable', async () => {
      jest.mocked(accessSync).mockImplementation(() => undefined);
      jest.mocked(readdirSync).mockReturnValue([]);

      const result = await repository.sourceIsAccessible({ path: '/test/path' });

      expect(result).toBe(true);
      expect(accessSync).toHaveBeenCalledWith('/test/path', constants.R_OK);
    });

    it('should return false when path is not readable', async () => {
      jest.mocked(accessSync).mockImplementation(() => {
        throw new Error('Access denied');
      });

      const result = await repository.sourceIsAccessible({ path: '/test/path' });

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

      const result = await repository.sourceIsAccessible({ path: '/test/path' });

      expect(result).toBe(true);
      expect(accessSync).toHaveBeenCalledTimes(4); // root + 2 files + subdir
    });
  });

  describe('getFilePathList', () => {
    it('should return empty array for empty directory', async () => {
      jest.mocked(readdirSync).mockReturnValue([]);

      const result = await repository.getFilePathList({ path: '/test/path' });

      expect(result).toEqual([]);
    });

    it('should return markdown files from directory', async () => {
      jest.mocked(readdirSync).mockReturnValueOnce([
        { name: 'file1.md', isDirectory: () => false, isFile: () => true },
        { name: 'file2.txt', isDirectory: () => false, isFile: () => true },
        { name: 'file3.md', isDirectory: () => false, isFile: () => true }
      ] as any);

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
  });
}); 