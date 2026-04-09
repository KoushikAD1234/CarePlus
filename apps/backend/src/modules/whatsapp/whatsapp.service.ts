import { Injectable } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationHandler } from './conversation.handler';
import { WhatsappSender } from './whatsapp.sender';

@Injectable()
export class WhatsappService {
  constructor(
    private convoService: ConversationService,
    private handler: ConversationHandler,
    private sender: WhatsappSender,
  ) {}

  async handleIncoming(body: any) {
    // const { from, message } = body;
    const from = body.From;
    const message = body.Body?.trim();

    let { convo, isNew } = await this.convoService.getOrCreate(from);

    let reply;

    if (isNew) {
      reply = "Hi! Whats's your name ?";
    } else {
      reply = await this.handler.handle(convo, message);
    }

    await this.sender.sendMessage(from, reply);

    return { success: true };
  }
}
