import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlobsService } from './blobs.service';
import { BlobsController } from './blobs.controller';
import { Blob } from './entities/blob.entity';
import { StorageModule } from '../storage/storage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blob]),
    StorageModule,
    ConfigModule,
  ],
  controllers: [BlobsController],
  providers: [BlobsService],
})
export class BlobsModule {} 