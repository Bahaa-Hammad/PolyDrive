import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BlobsService } from './blobs.service';
import { Blob } from './entities/blob.entity';
import { StorageFactory } from '../storage/storage.factory';
import { StorageAdapter } from '../storage/interfaces/storage-adapter.interface';

describe('BlobsService', () => {
  let service: BlobsService;
  let blobRepository: Repository<Blob>;
  let storageFactory: StorageFactory;
  let mockStorageAdapter: StorageAdapter;

  const mockBlob = {
    internalId: '123e4567-e89b-12d3-a456-426614174000',
    id: 'test-blob-id',
    size: 27,
    storageType: 'local',
    storageLocation: '/storage/test-blob-id',
    createdAt: new Date('2023-01-22T21:37:55Z'),
    updatedAt: new Date('2023-01-22T21:37:55Z'),
  };

  beforeEach(async () => {
    mockStorageAdapter = {
      store: jest.fn(),
      retrieve: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlobsService,
        {
          provide: getRepositoryToken(Blob),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: StorageFactory,
          useValue: {
            createStorageAdapter: jest.fn().mockReturnValue(mockStorageAdapter),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('local'),
          },
        },
      ],
    }).compile();

    service = module.get<BlobsService>(BlobsService);
    blobRepository = module.get<Repository<Blob>>(getRepositoryToken(Blob));
    storageFactory = module.get<StorageFactory>(StorageFactory);
  });

  describe('create', () => {
    it('should create a new blob successfully', async () => {
      const createBlobDto = {
        id: 'test-blob-id',
        data: 'SGVsbG8gU2ltcGxlIFN0b3JhZ2UgV29ybGQh', // "Hello Simple Storage World!" in base64
      };

      jest.spyOn(blobRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(blobRepository, 'create').mockReturnValue(mockBlob as Blob);
      jest.spyOn(blobRepository, 'save').mockResolvedValue(mockBlob as Blob);
      jest.spyOn(mockStorageAdapter, 'store').mockResolvedValue('/storage/test-blob-id');

      const result = await service.create(createBlobDto);

      expect(result).toEqual({
        id: 'test-blob-id',
        data: createBlobDto.data,
        size: '27',
        created_at: '2023-01-22T21:37:55.000Z',
      });
      expect(mockStorageAdapter.store).toHaveBeenCalledWith(
        'test-blob-id',
        Buffer.from(createBlobDto.data, 'base64'),
      );
    });

    it('should throw ConflictException if blob already exists', async () => {
      const createBlobDto = {
        id: 'existing-blob',
        data: 'SGVsbG8gV29ybGQh',
      };

      // Mock that the blob already exists
      jest.spyOn(blobRepository, 'findOne').mockResolvedValue(mockBlob as Blob);

      await expect(service.create(createBlobDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid base64', async () => {
      const createBlobDto = {
        id: 'test-blob',
        data: 'invalid-base64-with-unicode-characters-🚀', // This will cause Buffer.from to fail
      };

      jest.spyOn(blobRepository, 'findOne').mockResolvedValue(null);

      const originalBufferFrom = Buffer.from;
      Buffer.from = jest.fn().mockImplementation((...args) => {
        if (args[0] === 'invalid-base64-with-unicode-characters-🚀') {
          throw new Error('Invalid base64');
        }
        return originalBufferFrom.apply(Buffer, args);
      });

      try {
        await expect(service.create(createBlobDto)).rejects.toThrow(
          BadRequestException,
        );
      } finally {
        // Restore original Buffer.from
        Buffer.from = originalBufferFrom;
      }
    });
  });

  describe('findOne', () => {
    it('should retrieve a blob successfully', async () => {
      const testData = 'Hello Simple Storage World!';
      const base64Data = Buffer.from(testData).toString('base64');

      jest.spyOn(blobRepository, 'findOne').mockResolvedValue(mockBlob as Blob);
      jest.spyOn(mockStorageAdapter, 'retrieve').mockResolvedValue(
        Buffer.from(testData),
      );

      const result = await service.findOne('test-blob-id');

      expect(result).toEqual({
        id: 'test-blob-id',
        data: base64Data,
        size: '27',
        created_at: '2023-01-22T21:37:55.000Z',
      });
      expect(mockStorageAdapter.retrieve).toHaveBeenCalledWith('test-blob-id');
    });

    it('should throw NotFoundException if blob does not exist', async () => {
      jest.spyOn(blobRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a blob successfully', async () => {
      jest.spyOn(blobRepository, 'findOne').mockResolvedValue(mockBlob as Blob);
      jest.spyOn(blobRepository, 'remove').mockResolvedValue(mockBlob as Blob);
      jest.spyOn(mockStorageAdapter, 'delete').mockResolvedValue(undefined);

      await service.remove('test-blob-id');

      expect(mockStorageAdapter.delete).toHaveBeenCalledWith('test-blob-id');
      expect(blobRepository.remove).toHaveBeenCalledWith(mockBlob);
    });

    it('should throw NotFoundException if blob does not exist', async () => {
      jest.spyOn(blobRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
}); 