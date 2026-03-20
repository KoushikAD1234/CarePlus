import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './config/validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './database/entities/doctor.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 👇 TEMP DEBUG
    (console.log('ENV CHECK:', process.env.DB_HOST),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.cwd() + '/.env',
      validationSchema,
    })),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [Doctor],
      synchronize: true,
    }),
    AuthModule,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log('ENV CHECK:', this.configService.get('DB_HOST'));
    console.log('CWD:', process.cwd());
  }
}
