import { Client } from 'basic-ftp';
import { StorageAdapter } from '../interfaces/storage-adapter.interface';
import { Readable, Writable } from 'stream';

export class FtpStorageAdapter implements StorageAdapter {
  constructor(
    private host: string,
    private port: number,
    private user: string,
    private password: string,
  ) {}

  async store(id: string, data: Buffer): Promise<string> {
    const client = new Client();
    try {
      await client.connect(this.host, this.port);
      await client.login(this.user, this.password);
      
      const remotePath = this.getRemotePath(id);
      const stream = Readable.from(data);
      await client.uploadFrom(stream, remotePath);
      
      return `ftp://${this.host}${remotePath}`;
    } finally {
      client.close();
    }
  }

  async retrieve(id: string): Promise<Buffer> {
    const client = new Client();
    try {
      await client.connect(this.host, this.port);
      await client.login(this.user, this.password);
      
      const remotePath = this.getRemotePath(id);
      const chunks: Buffer[] = [];
      
      const writeStream = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(chunk);
          callback();
        }
      });
      
      await client.downloadTo(writeStream, remotePath);
      
      return Buffer.concat(chunks);
    } catch (error) {
      if (error.code === 550) {
        throw new Error(`Blob with id ${id} not found`);
      }
      throw error;
    } finally {
      client.close();
    }
  }

  async delete(id: string): Promise<void> {
    const client = new Client();
    try {
      await client.connect(this.host, this.port);
      await client.login(this.user, this.password);
      
      const remotePath = this.getRemotePath(id);
      await client.remove(remotePath);
    } catch (error) {
      // Ignore if file doesn't exist
      if (error.code !== 550) {
        throw error;
      }
    } finally {
      client.close();
    }
  }

  async exists(id: string): Promise<boolean> {
    const client = new Client();
    try {
      await client.connect(this.host, this.port);
      await client.login(this.user, this.password);
      
      const remotePath = this.getRemotePath(id);
      const size = await client.size(remotePath);
      
      return size >= 0;
    } catch {
      return false;
    } finally {
      client.close();
    }
  }

  private getRemotePath(id: string): string {
    // Sanitize the id and create a path
    const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `/blobs/${sanitizedId}`;
  }
} 