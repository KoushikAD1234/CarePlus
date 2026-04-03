import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/modules/auth/jwt.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    // 1. Connect the Doctor entity to this module
    TypeOrmModule.forFeature([Doctor]),

    MailModule,

    // 2. Configure JWT asynchronously to prevent "undefined" secret errors
    JwtModule.registerAsync({
      imports: [ConfigModule], // Ensures ConfigModule is available
      inject: [ConfigService], // Injects the service to read .env
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Exporting if other modules need Auth logic
})
export class AuthModule {}
