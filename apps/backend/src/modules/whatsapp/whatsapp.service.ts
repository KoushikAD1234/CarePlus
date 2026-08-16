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

    // 1. Get the existing conversation or create a shell for a new one
    let { convo } = await this.convoService.getOrCreate(from);

    // 2. Delegate all logic to the handler.
    // The handler now checks if a doctor_id exists.
    // If not, it returns the "Please scan QR" message automatically.
    const reply = await this.handler.handle(convo, message);

    // 3. Send the reply if the handler generated one
    // (Handler returns null if it sent a Twilio Template instead)
    if (reply !== null) {
      await this.sender.sendMessage(from, reply, '');
    }

    return { success: true };
  }
}
