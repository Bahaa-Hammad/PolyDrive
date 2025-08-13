import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BlobData } from '../blobs/entities/blob-data.entity';
import { StorageFactory } from './storage.factory';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([BlobData]),
  ],
  providers: [StorageFactory],
  exports: [StorageFactory],
})
export class StorageModule {} 