import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageAdapter } from './interfaces/storage-adapter.interface';
import { LocalStorageAdapter } from './adapters/local-storage.adapter';

import { BlobData } from '../blobs/entities/blob-data.entity';
import { S3StorageAdapter } from './adapters/s3-storage.adapter';
import { DatabaseStorageAdapter } from './adapters/database-storage.adapter';
import { FtpStorageAdapter } from './adapters/ftp-storage.adapter';

@Injectable()
export class StorageFactory {
  constructor(
    private configService: ConfigService,
    @InjectRepository(BlobData)
    private blobDataRepository: Repository<BlobData>,
  ) {}

  createStorageAdapter(): StorageAdapter {
    const storageType = this.configService.get<string>('storage.type');

    switch (storageType) {
      case 'local':
        const localPath = this.configService.get<string>('storage.local.path');
        if (!localPath) {
          throw new Error('Local storage path not configured');
        }
        return new LocalStorageAdapter(localPath);
      
      case 's3':
        const s3Endpoint = this.configService.get<string>('storage.s3.endpoint');
        const s3AccessKey = this.configService.get<string>('storage.s3.accessKey');
        const s3SecretKey = this.configService.get<string>('storage.s3.secretKey');
        const s3Bucket = this.configService.get<string>('storage.s3.bucket');
        const s3Region = this.configService.get<string>('storage.s3.region');
        
        if (!s3Endpoint || !s3AccessKey || !s3SecretKey || !s3Bucket) {
          throw new Error('S3 storage configuration incomplete');
        }
        
        return new S3StorageAdapter(s3Endpoint, s3AccessKey, s3SecretKey, s3Bucket, s3Region);
      
      case 'database':
        return new DatabaseStorageAdapter(this.blobDataRepository);
      
      case 'ftp':
        const ftpHost = this.configService.get<string>('storage.ftp.host');
        const ftpPort = this.configService.get<number>('storage.ftp.port') || 21;
        const ftpUser = this.configService.get<string>('storage.ftp.user');
        const ftpPassword = this.configService.get<string>('storage.ftp.password');
        
        if (!ftpHost || !ftpUser || !ftpPassword) {
          throw new Error('FTP storage configuration incomplete');
        }
        
        return new FtpStorageAdapter(ftpHost, ftpPort, ftpUser, ftpPassword);
      
      default:
        throw new Error(`Unsupported storage type: ${storageType}`);
    }
  }
} 