import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Blob } from './entities/blob.entity';
import { StorageFactory } from '../storage/storage.factory';
import { CreateBlobDto } from './dto/create-blob.dto';
import { BlobResponseDto } from './dto/blob-response.dto';

@Injectable()
export class BlobsService {
  constructor(
    @InjectRepository(Blob)
    private blobRepository: Repository<Blob>,
    private storageFactory: StorageFactory,
    private configService: ConfigService,
  ) {}

  async create(createBlobDto: CreateBlobDto): Promise<BlobResponseDto> {
    // Check if blob with this ID already exists
    const existingBlob = await this.blobRepository.findOne({
      where: { id: createBlobDto.id },
    });

    if (existingBlob) {
      throw new ConflictException(`Blob with id ${createBlobDto.id} already exists`);
    }

    // Decode base64 data
    let buffer: Buffer;
    try {
      buffer = Buffer.from(createBlobDto.data, 'base64');
    } catch (error) {
      throw new BadRequestException('Invalid base64 encoded data');
    }

    // Get storage adapter
    const storageAdapter = this.storageFactory.createStorageAdapter();
    const storageType = this.configService.get<string>('storage.type');

    // Store the blob
    const storageLocation = await storageAdapter.store(createBlobDto.id, buffer);

    // Save metadata to database
    const blob = this.blobRepository.create({
      id: createBlobDto.id,
      size: buffer.length,
      storageType,
      storageLocation,
    });

    await this.blobRepository.save(blob);

    return {
      id: blob.id,
      data: createBlobDto.data,
      size: blob.size.toString(),
      created_at: blob.createdAt.toISOString(),
    };
  }

  async findOne(id: string): Promise<BlobResponseDto> {
    // Find blob metadata
    const blob = await this.blobRepository.findOne({
      where: { id },
    });

    if (!blob) {
      throw new NotFoundException(`Blob with id ${id} not found`);
    }

    // Get storage adapter
    const storageAdapter = this.storageFactory.createStorageAdapter();

    // Retrieve blob data
    const buffer = await storageAdapter.retrieve(id);
    const data = buffer.toString('base64');

    return {
      id: blob.id,
      data,
      size: blob.size.toString(),
      created_at: blob.createdAt.toISOString(),
    };
  }

  async remove(id: string): Promise<void> {
    // Find blob metadata
    const blob = await this.blobRepository.findOne({
      where: { id },
    });

    if (!blob) {
      throw new NotFoundException(`Blob with id ${id} not found`);
    }

    // Get storage adapter
    const storageAdapter = this.storageFactory.createStorageAdapter();

    // Delete from storage
    await storageAdapter.delete(id);

    // Delete metadata from database
    await this.blobRepository.remove(blob);
  }
} 