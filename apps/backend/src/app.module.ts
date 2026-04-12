import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from './config/validation.schema';
import { TypeOrmModule } from '@nestjs/typeorm'; // allows your NestJS application to talk to your SQL database
import { Doctor } from './database/entities/doctor.entity';
import { AuthModule } from './modules/auth/auth.module';
import { Patient } from './database/entities/patient.entity';
import { PatientModule } from './modules/patient/patient.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { Appointment } from './database/entities/appointment.entity';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { MailModule } from './modules/mail/mail.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { HealthController } from './health/health.controller';

/* NestJS uses a Module Tree structure.
 1. AppModule is the "Root."
 2. AuthModule is a "Child."
 3. Inside AuthModule, you might have a DoctorModule.

 .forRoot() : function basically used to configuring modules for the entire application.
 */
@Module({
  imports: [
    (console.log('ENV CHECK:', process.env.DB_HOST),
    ConfigModule.forRoot({
      isGlobal: true, // Make it usable in entire application by using ConfigService.
      envFilePath: process.cwd() + '/.env', // getting the env file.
      validationSchema, // Safety guard: If you forgot to add DB_HOST or if DB_PORT is text
      // instead of a number, the app will crash immediately with a clear error message.
    })),
    // Database Connection: Configuring it for the entire Application.
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      // host: process.env.DB_HOST,
      // port: Number(process.env.DB_PORT),
      // username: process.env.DB_USER,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [Doctor, Patient, Appointment],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    AuthModule,
    PatientModule,
    AppointmentModule,
    WhatsappModule,
    MailModule,
    DoctorModule,
  ],
  controllers: [HealthController],
})
export class AppModule {
  // Depecdency Injector: This is more specifically constructor injection.
  constructor(private configService: ConfigService) {
    // console.log('ENV CHECK:', this.configService.get('DB_HOST'));
    console.log('CWD:', process.cwd()); //process.cwd() used to getting the current directory you are in.
  }
}
