import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlobDto {
  @ApiProperty({
    description: 'Unique identifier for the blob. Can be any valid string like UUID, path, or random characters.',
    example: 'my-unique-blob-id-123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Base64 encoded binary data. The service will decode this to store the actual blob.',
    example: 'SGVsbG8gU2ltcGxlIFN0b3JhZ2UgV29ybGQh',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  data: string;
} 