import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { Employee } from '../database/entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const jwtExpiresIn = configService.get<string>('JWT_EXPIRES_IN') || '24h';
        
        // Validate JWT secret
        if (!jwtSecret) {
          console.error('❌ SECURITY ERROR: JWT_SECRET environment variable is not set');
          throw new Error('JWT_SECRET environment variable is required');
        }
        
        if (jwtSecret.length < 32) {
          console.error('❌ SECURITY WARNING: JWT_SECRET should be at least 32 characters long');
          console.error(`Current length: ${jwtSecret.length} characters`);
        }
        
        console.log('🔐 JWT Configuration loaded successfully');
        console.log(`🕐 JWT Token expires in: ${jwtExpiresIn}`);
        
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}