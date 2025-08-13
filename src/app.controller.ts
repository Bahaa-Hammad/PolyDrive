import { Controller, Get, Post, Body } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiProduces,
  ApiConsumes
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { TokenRequestDto } from './auth/dto/token-request.dto';
import { TokenResponseDto } from './auth/dto/token-response.dto';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Welcome message returned successfully',
    schema: {
      type: 'string',
      example: 'Welcome to PolyDrive - Multi-Backend Storage Service. Visit /health for status or check the documentation for API usage.',
    },
  })
  @ApiProduces('text/plain')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check the health status of the PolyDrive service',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2023-01-22T21:37:55.000Z',
        },
      },
    },
  })
  @ApiProduces('application/json')
  health(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('auth/token')
  @ApiOperation({
    summary: 'Generate authentication token',
    description: 'Generate a JWT token for API authentication. This token is required for all blob operations.',
  })
  @ApiBody({
    type: TokenRequestDto,
    description: 'User ID for token generation (optional)',
    examples: {
      withUserId: {
        summary: 'With User ID',
        description: 'Generate token for a specific user',
        value: {
          userId: 'john-doe-123'
        }
      },
      withoutUserId: {
        summary: 'Without User ID',
        description: 'Generate token with default user ID',
        value: {}
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Token generated successfully',
    type: TokenResponseDto,
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async generateToken(@Body('userId') userId: string): Promise<{ access_token: string }> {
    const token = await this.authService.generateToken(userId || 'demo-user');
    return { access_token: token };
  }
}
