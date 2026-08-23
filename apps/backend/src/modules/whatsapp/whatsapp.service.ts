import { Injectable } from '@nestjs/common';

import { ConversationService } from './conversation.service';
import { ConversationHandler } from './conversation.handler';
import { WhatsappSender } from './whatsapp.sender';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly convoService: ConversationService,
    private readonly handler: ConversationHandler,
    private readonly sender: WhatsappSender,
  ) {}

  async handleIncoming(body: any) {
    const from = body.From;

    console.log('========== TWILIO WEBHOOK ==========');
    console.log('Body:', body.Body);
    console.log('ButtonPayload:', body.ButtonPayload);
    console.log('ButtonText:', body.ButtonText);
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('====================================');

    let message = body.ButtonPayload?.trim() || body.Body?.trim() || '';

    /*
     * Normalize WhatsApp quick-reply buttons.
     *
     * If Twilio sends the visible text instead of the payload,
     * convert it to our internal command.
     */
    if (message.toLowerCase() === 'book appointment') {
      message = 'BOOK_EXISTING_APPOINTMENT';
    }

    if (message.toLowerCase() === 'update details') {
      message = 'UPDATE_PATIENT_DETAILS';
    }

    if (message.toLowerCase() === 'cancel') {
      message = 'CANCEL_BOOKING';
    }

    console.log('Final message:', message);

    const { convo } = await this.convoService.getOrCreate(from);

    const reply = await this.handler.handle(convo, message);

    if (reply !== null) {
      await this.sender.sendMessage(from, reply, '');
    }

    return {
      success: true,
    };
  }
}
