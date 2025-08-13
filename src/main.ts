import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('PolyDrive API')
    .setDescription('Multi-Backend Storage Service')
    .setVersion('1.0.0')
    .setContact("Bahaa", "https://github.com/Bahaa-Hammad", "bhaahussam@gmail.com")
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for @ApiBearerAuth() decorator
    )
    .addTag('System', 'System endpoints for health checks and authentication')
    .addTag('Blobs', 'Blob storage and retrieval operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Swagger UI setup
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req) => {
        // Ensure authorization header is properly set
        if (req.headers.Authorization && req.headers.Authorization.includes('<your-jwt-token-here>')) {
          // Remove placeholder if not replaced
          delete req.headers.Authorization;
        }
        return req;
      },
      responseInterceptor: (response) => {
        // Customize response handling if needed
        return response;
      },
    },
    customSiteTitle: 'PolyDrive API Documentation',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();
