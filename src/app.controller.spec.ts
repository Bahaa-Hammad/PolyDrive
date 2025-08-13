import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let authService: AuthService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AuthService,
          useValue: {
            generateToken: jest.fn().mockResolvedValue('mock-token'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
    authService = app.get<AuthService>(AuthService);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      expect(appController.getHello()).toBe(
        'Welcome to PolyDrive - Multi-Backend Storage Service. Visit /health for status or check the documentation for API usage.',
      );
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.health();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('generateToken', () => {
    it('should generate a token', async () => {
      const userId = 'test-user';
      const result = await appController.generateToken(userId);
      
      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(authService.generateToken).toHaveBeenCalledWith(userId);
    });
  });
});
