import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WhatsappSender {
  private readonly auth = {
    username: process.env.TWILIO_ACCOUNT_SID!,
    password: process.env.TWILIO_AUTH_TOKEN!,
  };

  private get url() {
    return `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
  }

  /**
   * Universal message method: handles both text-only and media WhatsApp messages.
   */
  async sendMessage(to: string, message: string, mediaUrl?: string) {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = process.env.TWILIO_WHATSAPP_NUMBER?.startsWith(
      'whatsapp:',
    )
      ? process.env.TWILIO_WHATSAPP_NUMBER
      : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    const params = new URLSearchParams({
      From: formattedFrom!,
      To: formattedTo,
      Body: message,
    });

    // Only append MediaUrl parameter if a valid URL string is provided
    if (mediaUrl && mediaUrl.trim().length > 0) {
      params.append('MediaUrl', mediaUrl.trim());
    }

    try {
      const response = await axios.post(this.url, params, {
        auth: this.auth,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      console.log(
        `✅ WhatsApp message sent to ${formattedTo}. SID: ${response.data.sid}`,
      );
      return response.data;
    } catch (error: any) {
      console.error(
        '❌ Twilio Send Error:',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }

  async sendTemplate(to: string, contentSid: string) {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = process.env.TWILIO_WHATSAPP_NUMBER?.startsWith(
      'whatsapp:',
    )
      ? process.env.TWILIO_WHATSAPP_NUMBER
      : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    try {
      await axios.post(
        this.url,
        new URLSearchParams({
          From: formattedFrom!,
          To: formattedTo,
          ContentSid: contentSid,
        }),
        {
          auth: this.auth,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
    } catch (error: any) {
      console.error(
        '❌ Template Error:',
        error?.response?.data || error.message,
      );
    }
  }

  /**
   * Sends the interactive Doctor List using the Content API SID.
   * Maps database doctor objects to the {{1}}, {{1id}} placeholders.
   */
  async sendDoctorList(to: string, contentSid: string, doctors: any[]) {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = process.env.TWILIO_WHATSAPP_NUMBER?.startsWith(
      'whatsapp:',
    )
      ? process.env.TWILIO_WHATSAPP_NUMBER
      : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    const variables: Record<string, string> = {};

    doctors.slice(0, 3).forEach((doc, index) => {
      const num = index + 1;
      variables[`${num}`] = doc.name;
      variables[`${num}id`] = doc.id;
    });

    try {
      await axios.post(
        this.url,
        new URLSearchParams({
          From: formattedFrom!,
          To: formattedTo,
          ContentSid: contentSid,
          ContentVariables: JSON.stringify(variables),
        }),
        {
          auth: this.auth,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      console.log(`✅ Interactive List Sent to ${formattedTo}`);
    } catch (error: any) {
      console.error(
        '❌ List Template Error:',
        error?.response?.data || error.message,
      );
    }
  }
}
