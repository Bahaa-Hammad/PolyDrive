import { StorageAdapter } from '../interfaces/storage-adapter.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private storagePath: string) {}

  async store(id: string, data: Buffer): Promise<string> {
    await this.ensureDirectoryExists();
    const filePath = this.getFilePath(id);
    await fs.writeFile(filePath, data);
    return filePath;
  }

  async retrieve(id: string): Promise<Buffer> {
    const filePath = this.getFilePath(id);
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Blob with id ${id} not found`);
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const filePath = this.getFilePath(id);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async exists(id: string): Promise<boolean> {
    const filePath = this.getFilePath(id);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private getFilePath(id: string): string {
    const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.storagePath, sanitizedId);
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error -- simplify the code for demo purposes
    }
  }
} 