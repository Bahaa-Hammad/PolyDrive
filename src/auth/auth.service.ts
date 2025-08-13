import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generates a JWT token for authentication
   * In a real application, validattion for credentials would be required first
   * For this demo, simple payload is used to generate tokens
   */
  async generateToken(userId: string): Promise<string> {
    const payload = { sub: userId, timestamp: Date.now() };
    return this.jwtService.sign(payload);
  }

  /**
   * Validates a JWT token
   */
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * For demo purposes, this method validates bearer tokens
   * In production, a proper user management system would be used to validate users
   */
  async validateUser(payload: any): Promise<any> {

    if (payload.sub) {
      return { userId: payload.sub };
    }
    return null;
  }
} 