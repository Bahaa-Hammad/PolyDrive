import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiBody,
  ApiSecurity,
  ApiHeader,
  ApiConsumes,
  ApiProduces
} from '@nestjs/swagger';
import { BlobsService } from './blobs.service';
import { CreateBlobDto } from './dto/create-blob.dto';
import { BlobResponseDto } from './dto/blob-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Blobs')
@ApiBearerAuth('JWT-auth')
@Controller('v1/blobs')
@UseGuards(JwtAuthGuard)
export class BlobsController {
  constructor(private readonly blobsService: BlobsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Store a new blob',
    description: 'Store a blob of data with a unique identifier. The data must be base64 encoded.',
  })
  @ApiBody({
    type: CreateBlobDto,
    description: 'Blob data to store',
    examples: {
      textExample: {
        summary: 'Text Data Example',
        description: 'Storing a simple text message',
        value: {
          id: 'hello-world-message',
          data: 'SGVsbG8gV29ybGQh' // "Hello World!" in base64
        }
      },
      imageExample: {
        summary: 'Image Data Example',
        description: 'Storing an image file (base64 encoded)',
        value: {
          id: 'profile-picture-123',
          data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // 1x1 pixel PNG
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Blob successfully stored',
    type: BlobResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid base64 data or missing fields',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Blob with this ID already exists',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  create(@Body() createBlobDto: CreateBlobDto): Promise<BlobResponseDto> {
    return this.blobsService.create(createBlobDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a blob',
    description: 'Retrieve a blob by its unique identifier. Returns the blob data, size, and creation timestamp.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the blob to retrieve',
    example: 'hello-world-message',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Blob successfully retrieved',
    type: BlobResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Blob with this ID does not exist',
  })
  @ApiProduces('application/json')
  findOne(@Param('id') id: string): Promise<BlobResponseDto> {
    return this.blobsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a blob',
    description: 'Delete a blob by its unique identifier. This will remove both the blob data and metadata.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the blob to delete',
    example: 'hello-world-message',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Blob successfully deleted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Blob with this ID does not exist',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.blobsService.remove(id);
  }
} 