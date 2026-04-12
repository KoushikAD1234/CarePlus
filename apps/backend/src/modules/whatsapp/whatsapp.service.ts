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

    // 🔥 ALWAYS call the handler first to check for special entry commands (like QR codes)
    let reply = await this.handler.handle(convo, message);

    // If the handler didn't return a specific response (and it's a fresh session),
    // then fallback to the default greeting.
    if (!reply && isNew) {
      reply = "Hi! What's your name?";
    }

    if (reply !== null) {
      await this.sender.sendMessage(from, reply);
    }

    return { success: true };
  }
}
