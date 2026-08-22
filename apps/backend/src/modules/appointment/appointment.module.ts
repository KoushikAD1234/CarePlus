import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from 'src/database/entities/appointment.entity';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { Doctor } from 'src/database/entities/doctor.entity';
import { Patient } from 'src/database/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Doctor, Patient]),
    WhatsappModule,
    CloudinaryModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}
