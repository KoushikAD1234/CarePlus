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
    const from = body.From;
    const message = body.Body?.trim() ?? '';

    let { convo, isNew } = await this.convoService.getOrCreate(from);

    // This explicit typing fixes the "not assignable" error
    let reply: string | null = null;

    if (isNew) {
      reply = "Hi! What's your name?";
    } else {
      reply = await this.handler.handle(convo, message);
    }

    // Only send a message if there is string content
    if (reply !== null) {
      await this.sender.sendMessage(from, reply);
    }

    return { success: true };
  }
}
