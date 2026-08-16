import { Module, forwardRef } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from 'src/database/entities/conversation.entity';
import { AppointmentModule } from '../appointment/appointment.module';
import { Patient } from 'src/database/entities/patient.entity';
import { Doctor } from 'src/database/entities/doctor.entity';
import { WhatsappSender } from './whatsapp.sender';
import { ConversationHandler } from './conversation.handler';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Patient, Doctor]),
    forwardRef(() => AppointmentModule),
  ],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    WhatsappSender,
    ConversationService,
    ConversationHandler,
  ],
  exports: [WhatsappSender, WhatsappService], // <-- Export WhatsappSender
})
export class WhatsappModule {}
