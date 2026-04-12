import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Conversation,
  ConversationStep,
} from 'src/database/entities/conversation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
  ) {}

  async getOrCreate(phone: string) {
    let convo = await this.conversationRepo.findOne({
      where: { phone },
      order: { id: 'DESC' },
    });

    if (!convo) {
      convo = this.conversationRepo.create({
        phone,
        step: ConversationStep.ASK_NAME,
      });
      await this.conversationRepo.save(convo);
      return { convo, isNew: true };
    }

    return { convo, isNew: false };
  }

  async save(convo: Conversation) {
    return this.conversationRepo.save(convo);
  }

  async delete(phone: string) {
    return this.conversationRepo.delete({ phone });
  }
}
