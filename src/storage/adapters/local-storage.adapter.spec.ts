import * as fs from 'fs/promises';
import * as path from 'path';
import { LocalStorageAdapter } from './local-storage.adapter';

jest.mock('fs/promises');

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;
  const storagePath = '/test/storage';
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    adapter = new LocalStorageAdapter(storagePath);
    jest.clearAllMocks();
  });

  describe('store', () => {
    it('should store a blob successfully', async () => {
      const id = 'test-blob';
      const data = Buffer.from('Hello World');
      const expectedPath = path.join(storagePath, 'test-blob');

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await adapter.store(id, data);

      expect(result).toBe(expectedPath);
      expect(mockFs.mkdir).toHaveBeenCalledWith(storagePath, { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledWith(expectedPath, data);
    });

    it('should sanitize the id to prevent directory traversal', async () => {
      const maliciousId = '../../../etc/passwd';
      const data = Buffer.from('malicious data');
      const expectedPath = path.join(storagePath, '_________etc_passwd');

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await adapter.store(maliciousId, data);

      expect(result).toBe(expectedPath);
      expect(mockFs.writeFile).toHaveBeenCalledWith(expectedPath, data);
    });
  });

  describe('retrieve', () => {
    it('should retrieve a blob successfully', async () => {
      const id = 'test-blob';
      const expectedData = Buffer.from('Hello World');
      const expectedPath = path.join(storagePath, 'test-blob');

      mockFs.readFile.mockResolvedValue(expectedData);

      const result = await adapter.retrieve(id);

      expect(result).toBe(expectedData);
      expect(mockFs.readFile).toHaveBeenCalledWith(expectedPath);
    });

    it('should throw error if blob not found', async () => {
      const id = 'non-existent';
      const error = new Error('ENOENT');
      (error as any).code = 'ENOENT';

      mockFs.readFile.mockRejectedValue(error);

      await expect(adapter.retrieve(id)).rejects.toThrow(
        'Blob with id non-existent not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete a blob successfully', async () => {
      const id = 'test-blob';
      const expectedPath = path.join(storagePath, 'test-blob');

      mockFs.unlink.mockResolvedValue(undefined);

      await adapter.delete(id);

      expect(mockFs.unlink).toHaveBeenCalledWith(expectedPath);
    });

    it('should not throw error if file does not exist', async () => {
      const id = 'non-existent';
      const error = new Error('ENOENT');
      (error as any).code = 'ENOENT';

      mockFs.unlink.mockRejectedValue(error);

      await expect(adapter.delete(id)).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true if blob exists', async () => {
      const id = 'test-blob';
      const expectedPath = path.join(storagePath, 'test-blob');

      mockFs.access.mockResolvedValue(undefined);

      const result = await adapter.exists(id);

      expect(result).toBe(true);
      expect(mockFs.access).toHaveBeenCalledWith(expectedPath);
    });

    it('should return false if blob does not exist', async () => {
      const id = 'non-existent';

      mockFs.access.mockRejectedValue(new Error('ENOENT'));

      const result = await adapter.exists(id);

      expect(result).toBe(false);
    });
  });
}); 