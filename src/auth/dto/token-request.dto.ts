import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class TokenRequestDto {
  @ApiProperty({
    description: 'User ID for generating the JWT token. If not provided, defaults to "demo-user".',
    example: 'john-doe-123',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  userId?: string;
} 