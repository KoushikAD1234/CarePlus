import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappSender {
  async sendMessage(to: string, message: string) {
    try {
      // Ensure correct WhatsApp format
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const from = process.env.TWILIO_WHATSAPP_NUMBER;

      if (!from) {
        console.error('❌ TWILIO_WHATSAPP_NUMBER not set');
        return;
      }

      console.log(`📤 Sending message to ${formattedTo}: ${message}`);

      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        new URLSearchParams({
          From: from,
          To: formattedTo,
          Body: message,
        }),
        {
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID!,
            password: process.env.TWILIO_AUTH_TOKEN!,
          },
        },
      );

      console.log('✅ Message sent successfully');
    } catch (error: any) {
      console.error('❌ Twilio Error:', error?.response?.data || error.message);
    }
  }
}
