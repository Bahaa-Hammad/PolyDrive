import { Repository } from 'typeorm';
import { StorageAdapter } from '../interfaces/storage-adapter.interface';
import { BlobData } from '../../blobs/entities/blob-data.entity';

export class DatabaseStorageAdapter implements StorageAdapter {
  constructor(private blobDataRepository: Repository<BlobData>) {}

  async store(id: string, data: Buffer): Promise<string> {
    const blobData = this.blobDataRepository.create({
      id,
      data,
    });
    
    await this.blobDataRepository.save(blobData);
    return `database://${id}`;
  }

  async retrieve(id: string): Promise<Buffer> {
    const blobData = await this.blobDataRepository.findOne({
      where: { id },
    });
    
    if (!blobData) {
      throw new Error(`Blob with id ${id} not found`);
    }
    
    return blobData.data;
  }

  async delete(id: string): Promise<void> {
    await this.blobDataRepository.delete({ id });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.blobDataRepository.count({
      where: { id },
    });
    
    return count > 0;
  }
} 