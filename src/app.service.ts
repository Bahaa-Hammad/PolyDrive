import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to PolyDrive - Multi-Backend Storage Service. Visit /health for status or check the documentation for API usage.';
  }
}
