import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Conversation,
  ConversationStep,
} from 'src/database/entities/conversation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WhatsappService {
  constructor(
    @InjectRepository(Conversation)
    private convoRepo: Repository<Conversation>,
  ) {}

  async handleIncoming(body: any) {
    const { from, message } = body;

    let convo = await this.convoRepo.findOne({
      where: { phone: from },
    });

    // New user
    if (!convo) {
      convo = this.convoRepo.create({
        phone: from,
        step: ConversationStep.ASK_NAME,
      });

      await this.convoRepo.save(convo);

      return "Hi! What's your name?";
    }

    // Existing conversation
    switch (convo.step) {
      case ConversationStep.ASK_NAME:
        convo.name = message;
        convo.step = ConversationStep.ASK_DOCTOR;
        await this.convoRepo.save(convo);
        return 'Select doctor: 1. Dr A 2. Dr B';

      case ConversationStep.ASK_DOCTOR:
        convo.doctor_id = message === '1' ? 'doctor-1' : 'doctor-2';
        convo.step = ConversationStep.ASK_TIME;
        await this.convoRepo.save(convo);
        return 'Enter time (e.g. 2026-03-25T10:00:00Z)';

      case ConversationStep.ASK_TIME:
        convo.appointment_time = message;
        convo.step = ConversationStep.CONFIRM;
        await this.convoRepo.save(convo);
        return `Confirm booking? (yes/no)`;

      case ConversationStep.CONFIRM:
        if (message.toLowerCase() === 'yes') {
          // TODO: call appointment service
          await this.convoRepo.delete({ phone: from });
          return 'Appointment booked successfully!';
        } else {
          await this.convoRepo.delete({ phone: from });
          return 'Booking cancelled.';
        }

      default:
        return 'Something went wrong';
    }
  }
}
