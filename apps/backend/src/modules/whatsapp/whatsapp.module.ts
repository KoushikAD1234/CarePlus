import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'src/database/entities/conversation.entity';
import { AppointmentModule } from '../appointment/appointment.module';
import { Patient } from 'src/database/entities/patient.entity';
import { Doctor } from 'src/database/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Patient, Doctor]),
    AppointmentModule,
  ],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
