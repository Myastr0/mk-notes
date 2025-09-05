import { Client } from '@notionhq/client';
import * as fs from 'fs';
import fetch from 'node-fetch';
import { Logger } from 'winston';

import { NotionFileUploadService } from './file-upload.service';

// Mock dependencies
jest.mock('@notionhq/client');
jest.mock('fs');
jest.mock('node-fetch');

describe('NotionFileUploadService', () => {
  let service: NotionFileUploadService;
  let mockClient: jest.Mocked<Client>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // Create mock client
    mockClient = {
      request: jest.fn(),
    } as any;

    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
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

  describe('uploadFile', () => {
    const mockFileStats = {
      size: 1024,
      isFile: () => true,
    };

    const mockFileBuffer = Buffer.from('test file content');

    const mockCreateFileUploadResponse = {
      id: 'test-upload-id',
      upload_url: 'https://test-upload-url.com',
    };

    beforeEach(() => {
      // Mock fs.existsSync to return true by default
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      // Mock fs.statSync
      (fs.statSync as jest.Mock).mockReturnValue(mockFileStats);

      // Mock fs.readFileSync
      (fs.readFileSync as jest.Mock).mockReturnValue(mockFileBuffer);

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

      // Verify createFileUpload was called
      expect(mockClient.request).toHaveBeenCalledWith({
        path: 'file_uploads',
        method: 'post',
        body: {
          filename: 'image.png',
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
      ).rejects.toThrow('File too large: large-file.png. Maximum size is 5MB.');
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
      mockClient.request.mockResolvedValue(null);

      await expect(
        service.uploadFile({
          filePath: '/test/image.png',
          basePath: '/test',
        })
      ).rejects.toThrow('Invalid response from file upload API');
    });

    it('should use correct filename extraction', async () => {
      await service.uploadFile({
        filePath: '/very/long/path/to/my-image-file.jpeg',
        basePath: '/test',
      });

      expect(mockClient.request).toHaveBeenCalledWith({
        path: 'file_uploads',
        method: 'post',
        body: {
          filename: 'my-image-file.jpeg',
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
});
