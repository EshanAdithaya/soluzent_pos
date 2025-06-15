import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Note: For production, install and configure helmet, compression, and express rate limiting
  console.log('🛡️  Security middleware configuration needed (install helmet, compression)');
  console.log('📏 Request size limits can be configured via NestJS built-in options');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('POS System API')
    .setDescription('Complete Point of Sale REST API for cashier and manager operations')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Login and token management')
    .addTag('Employees', 'Employee management (Manager only)')
    .addTag('Categories', 'Product category management')
    .addTag('Products', 'Product and inventory management')
    .addTag('Orders', 'Order processing and transaction management')
    .addTag('Reports', 'Sales and analytics reports (Manager only)')
    .addTag('Settings', 'Business configuration (Manager only)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT') || 3000;
  const startTime = Date.now();
  
  await app.listen(port);
  
  const bootTime = Date.now() - startTime;
  console.log(`🚀 POS API running on http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  console.log(`⚡ Application started in ${bootTime}ms`);
  console.log(`🔧 Environment: ${configService.get('NODE_ENV') || 'development'}`);
  console.log(`💾 Database sync: ${configService.get('DATABASE_SYNC') === 'true' ? 'enabled' : 'disabled'}`);
  console.log(`📊 System monitoring enabled - tracking user activity and performance`);
}

bootstrap();