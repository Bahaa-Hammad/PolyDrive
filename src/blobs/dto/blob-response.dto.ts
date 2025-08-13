import { ApiProperty } from '@nestjs/swagger';

export class BlobResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the blob',
    example: 'my-unique-blob-id-123',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Base64 encoded binary data of the blob',
    example: 'SGVsbG8gU2ltcGxlIFN0b3JhZ2UgV29ybGQh',
    type: String,
  })
  data: string;

  @ApiProperty({
    description: 'Size of the blob in bytes',
    example: '27',
    type: String,
  })
  size: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the blob was created',
    example: '2023-01-22T21:37:55.000Z',
    type: String,
  })
  created_at: string;
} 