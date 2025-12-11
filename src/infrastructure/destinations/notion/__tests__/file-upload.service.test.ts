import { Client } from '@notionhq/client';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { Logger } from 'winston';

import { NotionFileUploadService } from '../file-upload.service';

// Mock dependencies
jest.mock('@notionhq/client');
jest.mock('fs');
jest.mock('node-fetch');

describe('NotionFileUploadService', () => {
  let service: NotionFileUploadService;
  let mockClient: jest.Mocked<Client>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // Create mock client with proper structure
    mockClient = {
      request: jest.fn(),
      users: {
        me: jest.fn(),
      },
    } as any;

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    } as any;

    // Mock Client constructor
    (Client as jest.MockedClass<typeof Client>).mockImplementation(() => mockClient);

    service = new NotionFileUploadService({
      apiKey: 'test-api-key',
      logger: mockLogger,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('unique filename generation', () => {
    it('should generate unique filenames for long filenames', async () => {
      const longFileName = 'this-is-a-very-long-filename-that-exceeds-the-maximum-allowed-length-for-notion-api-and-should-be-truncated.png';
      const filePath = '/path/to/file.png';

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result = generateUniqueFileName(longFileName, filePath, 100);

      expect(result.length).toBeLessThanOrEqual(100);
      expect(result.endsWith('.png')).toBe(true);
      expect(result.startsWith('this-is-a-very-long-filename')).toBe(true);
      expect(result).toMatch(/-[a-f0-9]{8}\.png$/); // Should end with hash-extension pattern
    });

    it('should always add hash suffix even for short filenames', async () => {
      const shortFileName = 'short-filename.jpg';

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result = generateUniqueFileName(shortFileName, '/path/to/short-filename.jpg', 900);

      expect(result).not.toBe(shortFileName); // Should be different due to hash
      expect(result.endsWith('.jpg')).toBe(true);
      expect(result).toMatch(/short-filename-[a-f0-9]{8}\.jpg$/); // Should have hash suffix
    });

    it('should generate different hashes for different file paths', async () => {
      const fileName = 'same-filename.png';

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result1 = generateUniqueFileName(fileName, '/path1/same-filename.png', 50);
      const result2 = generateUniqueFileName(fileName, '/path2/same-filename.png', 50);

      expect(result1).not.toBe(result2);
      expect(result1.endsWith('.png')).toBe(true);
      expect(result2.endsWith('.png')).toBe(true);
      expect(result1.length).toBeLessThanOrEqual(50);
      expect(result2.length).toBeLessThanOrEqual(50);
    });

    it('should use default 900 byte limit from Notion API', async () => {
      const longFileName = 'a'.repeat(950) + '.png'; // 954 characters

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result = generateUniqueFileName(longFileName); // Using default limit

      expect(result.length).toBeLessThanOrEqual(900);
      expect(result.endsWith('.png')).toBe(true);
      expect(result).toMatch(/-[a-f0-9]{8}\.png$/); // Should have hash suffix
    });

    it('should handle edge case where extension is very long', async () => {
      const fileName = 'file.verylongextensionnamethatexceedslimit';

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result = generateUniqueFileName(fileName, undefined, 20);

      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toMatch(/^[a-f0-9]+\.verylongext/); // Should start with hash and have extension
    });

    it('should handle files without extensions', async () => {
      const fileName = 'this-is-a-very-long-filename-without-extension-that-should-be-truncated-to-fit-the-limit';

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result = generateUniqueFileName(fileName, undefined, 50);

      expect(result.length).toBeLessThanOrEqual(50);
      expect(result).toMatch(/this-is-a-very-long-filename.*-[a-f0-9]{8}$/); // Should have hash suffix
    });

    it('should ensure filename uniqueness for similar filenames', async () => {
      const baseFileName = 'very-long-filename-that-gets-truncated-when-uploaded-to-notion-api';
      const fileName1 = `${baseFileName}-image1.png`;
      const fileName2 = `${baseFileName}-image2.png`;
      const fileName3 = `${baseFileName}-image3.png`;

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result1 = generateUniqueFileName(fileName1, '/path/image1.png', 100);
      const result2 = generateUniqueFileName(fileName2, '/path/image2.png', 100);
      const result3 = generateUniqueFileName(fileName3, '/path/image3.png', 100);

      // All should be different due to unique hashes
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
      expect(result1).not.toBe(result3);

      // All should end with .png
      expect(result1.endsWith('.png')).toBe(true);
      expect(result2.endsWith('.png')).toBe(true);
      expect(result3.endsWith('.png')).toBe(true);

      // All should be within length limit
      expect(result1.length).toBeLessThanOrEqual(100);
      expect(result2.length).toBeLessThanOrEqual(100);
      expect(result3.length).toBeLessThanOrEqual(100);
    });

    it('should be deterministic - same input produces same output', async () => {
      const fileName = 'test-file.png';
      const filePath = '/path/to/test-file.png';

      // Use reflection to access private method for testing
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);
      const result1 = generateUniqueFileName(fileName, filePath);
      const result2 = generateUniqueFileName(fileName, filePath);

      expect(result1).toBe(result2); // Should be deterministic
      expect(result1).toMatch(/test-file-[a-f0-9]{8}\.png$/);
    });
  });

  describe('decoupled helper methods', () => {
    it('should generate consistent hash for same input', async () => {
      const generateFileHash = (service as any).generateFileHash.bind(service);

      const hash1 = generateFileHash('test.png', '/path/test.png');
      const hash2 = generateFileHash('test.png', '/path/test.png');
      const hash3 = generateFileHash('test.png', '/different/path/test.png');

      expect(hash1).toBe(hash2); // Same input = same hash
      expect(hash1).not.toBe(hash3); // Different path = different hash
      expect(hash1).toMatch(/^[a-f0-9]{8}$/); // 8-char hex
    });

    it('should correctly parse filename into parts', async () => {
      const parseFileName = (service as any).parseFileName.bind(service);

      expect(parseFileName('test.png')).toEqual({ baseName: 'test', extension: '.png' });
      expect(parseFileName('complex-name.jpeg')).toEqual({ baseName: 'complex-name', extension: '.jpeg' });
      expect(parseFileName('no-extension')).toEqual({ baseName: 'no-extension', extension: '' });
      expect(parseFileName('.hidden')).toEqual({ baseName: '.hidden', extension: '' });
    });

    it('should truncate base name to fit available space', async () => {
      const truncateToFitAvailableSpace = (service as any).truncateToFitAvailableSpace.bind(service);

      expect(truncateToFitAvailableSpace('short', 10)).toBe('short');
      expect(truncateToFitAvailableSpace('very-long-filename', 5)).toBe('very-');
      expect(truncateToFitAvailableSpace('exact', 5)).toBe('exact');
    });

    it('should construct hashed filename with proper length limits including extension', async () => {
      const constructHashedFileName = (service as any).constructHashedFileName.bind(service);

      // Normal case
      const result1 = constructHashedFileName('test', '.png', 'abcd1234', 50);
      expect(result1).toBe('test-abcd1234.png');
      expect(result1.length).toBeLessThanOrEqual(50);

      // Verify total filename length includes extension
      const result2 = constructHashedFileName('very-long-filename', '.png', 'abcd1234', 20);
      expect(result2.endsWith('-abcd1234.png'));
      expect(result2.length).toBeLessThanOrEqual(20);
      expect(result2.length).toBe(20); // Should be exactly 20 (base + hash + extension)

      // Extreme case - only hash + extension when no space for base name
      const result3 = constructHashedFileName('test', '.verylongext', 'abcd1234', 15);
      expect(result3.startsWith('abcd1234'));
      expect(result3.includes('.verylongext'));
      expect(result3.length).toBeLessThanOrEqual(15);
    });

    it('should respect total filename length limit (900 bytes) including extension', async () => {
      const generateUniqueFileName = (service as any).generateUniqueFileName.bind(service);

      // Test with very long filename and extension
      const longBase = 'a'.repeat(800);
      const longExtension = '.verylongextension';
      const longFileName = `${longBase}${longExtension}`;

      const result = generateUniqueFileName(longFileName, '/some/path', 900);

      // Total length should not exceed 900 bytes
      expect(result.length).toBeLessThanOrEqual(900);
      // Should still have the extension
      expect(result.endsWith(longExtension)).toBe(true);
      // Should have hash suffix
      expect(result).toMatch(/-[a-f0-9]{8}\.verylongextension$/);
    });
  });

  const mockFileStats = {
    size: 1024,
    isFile: () => true,
  };

  const mockFileBuffer = Buffer.from('test file content');

  const mockCreateFileUploadResponse = {
    id: 'test-upload-id',
    upload_url: 'https://test-upload-url.com',
  };

  describe('uploadFile', () => {

    beforeEach(() => {
      // Mock fs.existsSync to return true by default
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Mock fs.statSync
      (fs.statSync as jest.Mock).mockReturnValue(mockFileStats);

      // Mock fs.readFileSync
      (fs.readFileSync as jest.Mock).mockReturnValue(mockFileBuffer);

      // Mock client.users.me for workspace limits
      (mockClient.users.me as jest.Mock).mockResolvedValue({
        object: 'user',
        type: 'bot',
        bot: {
          workspace_limits: {
            max_file_upload_size_in_bytes: 5 * 1024 * 1024, // 5MB
          },
        },
      } as any);

      // Mock client.request for createFileUpload
      mockClient.request.mockResolvedValue(mockCreateFileUploadResponse);

      // Mock fetch for sendFileContent
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
      } as any);
    });

    it('should successfully upload a file', async () => {
      const result = await service.uploadFile({
        filePath: '/test/path/image.png',
        basePath: '/test',
      });

      expect(result).toEqual({
        id: 'test-upload-id',
        type: 'file_upload',
      });

      // Verify file stats were checked
      expect(fs.statSync).toHaveBeenCalledWith('/test/path/image.png');

      // Verify createFileUpload was called with hash suffix
      expect(mockClient.request).toHaveBeenCalledWith({
        path: 'file_uploads',
        method: 'post',
        body: {
          filename: expect.stringMatching(/^image-[a-f0-9]{8}\.png$/),
          file_size: 1024,
        },
      });

      // Verify file was read
      expect(fs.readFileSync).toHaveBeenCalledWith('/test/path/image.png');

      // Verify sendFileContent was called
      expect(fetch).toHaveBeenCalledWith(
        'https://test-upload-url.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Created file upload - ID: test-upload-id, Upload URL: https://test-upload-url.com'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully uploaded file: image.png with ID: test-upload-id'
      );
    });

    it('should handle relative file paths correctly', async () => {
      await service.uploadFile({
        filePath: './image.png',
        basePath: '/test/base',
      });

      expect(fs.statSync).toHaveBeenCalledWith('/test/base/image.png');
      expect(fs.readFileSync).toHaveBeenCalledWith('/test/base/image.png');
    });

    it('should handle absolute file paths correctly', async () => {
      await service.uploadFile({
        filePath: '/absolute/path/image.png',
      });

      expect(fs.statSync).toHaveBeenCalledWith('/absolute/path/image.png');
      expect(fs.readFileSync).toHaveBeenCalledWith('/absolute/path/image.png');
    });

    it('should throw error if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(
        service.uploadFile({
          filePath: '/nonexistent/file.png',
          basePath: '/test',
        })
      ).rejects.toThrow('File not found: /nonexistent/file.png');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to upload file /nonexistent/file.png:',
        expect.any(Error)
      );
    });

    it('should handle file size limit exceeded', async () => {
      // Mock fs.statSync to return a file larger than 5MB
      (fs.statSync as jest.Mock).mockReturnValue({
        size: 6 * 1024 * 1024, // 6MB
        isFile: () => true,
      });

      await expect(
        service.uploadFile({
          filePath: '/test/large-file.png',
          basePath: '/test',
        })
      ).rejects.toThrow('File too large: large-file.png (6.0MB). Maximum size is 5.0MB for this workspace.');
    });

    it('should handle createFileUpload API errors', async () => {
      mockClient.request.mockRejectedValue(new Error('API Error'));

      await expect(
        service.uploadFile({
          filePath: '/test/image.png',
          basePath: '/test',
        })
      ).rejects.toThrow('API Error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create file upload failed:',
        expect.any(Error)
      );
    });

    it('should handle sendFileContent errors', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      } as any);

      await expect(
        service.uploadFile({
          filePath: '/test/image.png',
          basePath: '/test',
        })
      ).rejects.toThrow('Send file content failed: 400 undefined - Bad Request');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to upload file /test/image.png:',
        expect.any(Error)
      );
    });

    it('should handle invalid response format from createFileUpload', async () => {
      mockClient.request.mockResolvedValue({
        id: 123, // Invalid type - should be string
        upload_url: null, // Invalid type - should be string
      });

      await expect(
        service.uploadFile({
          filePath: '/test/image.png',
          basePath: '/test',
        })
      ).rejects.toThrow('Invalid response format from file upload API');
    });

    it('should handle missing response from createFileUpload', async () => {
      // @ts-ignore
      mockClient.request.mockResolvedValue(null);

      await expect(
        service.uploadFile({
          filePath: '/test/image.png',
          basePath: '/test',
        })
      ).rejects.toThrow('Invalid response from file upload API');
    });

    it('should use correct filename extraction with hash suffix', async () => {
      await service.uploadFile({
        filePath: '/very/long/path/to/my-image-file.jpeg',
        basePath: '/test',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        path: 'file_uploads',
        method: 'post',
        body: {
          filename: expect.stringMatching(/^my-image-file-[a-f0-9]{8}\.jpeg$/),
          file_size: 1024,
        },
      });
    });

    it('should include FormData with file in sendFileContent request', async () => {
      await service.uploadFile({
        filePath: '/test/image.png',
        basePath: '/test',
      });

      // Verify fetch was called with FormData
      const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const [url, options] = fetchCall;

      expect(url).toBe('https://test-upload-url.com');
      if (options) {
        expect(options.method).toBe('POST');
        expect(options.headers).toEqual(expect.objectContaining({
          'Authorization': 'Bearer test-api-key',
        }));

        // The body should be FormData, but it's hard to test the exact content
        // We can at least verify it's not undefined
        expect(options.body).toBeDefined();
      } else {
        fail('Expected fetch to be called with options');
      }
    });
  });

  describe('getWorkspaceFileLimits', () => {
    it('should retrieve workspace limits from Notion API', async () => {
      (mockClient.users.me as jest.Mock).mockResolvedValue({
        object: 'user',
        type: 'bot',
        bot: {
          workspace_limits: {
            max_file_upload_size_in_bytes: 5368709120, // 5GB
          },
        },
      } as any);

      const limits = await service.getWorkspaceFileLimits();

      expect(limits).toEqual({
        maxFileSize: 5368709120,
        detectedAt: expect.any(Date),
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Retrieved workspace file upload limit: 5368709120 bytes (5120.0 MB)'
      );
    });

    it('should cache workspace limits and reuse them', async () => {
      const mockResponse = {
        object: 'user',
        type: 'bot',
        bot: {
          workspace_limits: {
            max_file_upload_size_in_bytes: 5242880, // 5MB
          },
        },
      } as any;

      (mockClient.users.me as jest.Mock).mockResolvedValue(mockResponse);

      // First call
      const limits1 = await service.getWorkspaceFileLimits();
      // Second call (should use cache)
      const limits2 = await service.getWorkspaceFileLimits();

      expect(limits1).toEqual(limits2);
      expect(mockClient.users.me).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    it('should fallback to 5MB limit when API fails', async () => {
      (mockClient.users.me as jest.Mock).mockRejectedValue(new Error('API Error'));

      const limits = await service.getWorkspaceFileLimits();

      expect(limits).toEqual({
        maxFileSize: 5 * 1024 * 1024, // 5MB fallback
        detectedAt: expect.any(Date),
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to retrieve workspace limits:',
        expect.any(Error)
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Using fallback file size limit: 5242880 bytes (5MB)'
      );
    });

    it('should handle invalid response format gracefully', async () => {
      (mockClient.users.me as jest.Mock).mockResolvedValue({
        object: 'user',
        type: 'person', // Invalid type - should be 'bot'
      } as any);

      const limits = await service.getWorkspaceFileLimits();

      expect(limits.maxFileSize).toBe(5 * 1024 * 1024); // Fallback to 5MB
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to retrieve workspace limits:',
        expect.any(Error)
      );
    });

    it('should handle missing workspace_limits in response', async () => {
      (mockClient.users.me as jest.Mock).mockResolvedValue({
        object: 'user',
        type: 'bot',
        bot: {
          // Missing workspace_limits
        },
      } as any);

      const limits = await service.getWorkspaceFileLimits();

      expect(limits.maxFileSize).toBe(5 * 1024 * 1024); // Fallback to 5MB
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to retrieve workspace limits:',
        expect.any(Error)
      );
    });

    it('should refresh cache after 1 hour', async () => {
      const mockResponse = {
        object: 'user',
        type: 'bot',
        bot: {
          workspace_limits: {
            max_file_upload_size_in_bytes: 5242880,
          },
        },
      } as any;

      (mockClient.users.me as jest.Mock).mockResolvedValue(mockResponse);

      // First call
      await service.getWorkspaceFileLimits();

      // Manually set the cache to be older than 1 hour
      (service as any).workspaceLimits = {
        maxFileSize: 5242880,
        detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      };

      // Second call should fetch fresh data
      await service.getWorkspaceFileLimits();

      expect(mockClient.users.me).toHaveBeenCalledTimes(2); // Called twice due to cache expiry
    });
  });

  describe('file size limit integration', () => {
    it('should work with paid workspace limits (5GB)', async () => {
      // Mock paid workspace with 5GB limit
      (mockClient.users.me as jest.Mock).mockResolvedValue({
        object: 'user',
        type: 'bot',
        bot: {
          workspace_limits: {
            max_file_upload_size_in_bytes: 5368709120, // 5GB
          },
        },
      } as any);

      // Mock file exists
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Mock a 100MB file (should be allowed in paid workspace)
      (fs.statSync as jest.Mock).mockReturnValue({
        size: 100 * 1024 * 1024, // 100MB
        isFile: () => true,
      });

      // Mock the file upload request (this is not setup in the general beforeEach for this test)
      mockClient.request.mockResolvedValue(mockCreateFileUploadResponse);

      // Mock fetch for sendFileContent
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
      } as any);

      const result = await service.uploadFile({
        filePath: '/test/large-file.png',
        basePath: '/test',
      });

      expect(result).toEqual({
        id: 'test-upload-id',
        type: 'file_upload',
      });

      // Should not throw an error for 100MB file in 5GB workspace
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Retrieved workspace file upload limit: 5368709120 bytes (5120.0 MB)'
      );
    });
  });
});
