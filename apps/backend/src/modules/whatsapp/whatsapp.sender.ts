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

  async sendMessage(to: string, message: string) {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    try {
      await axios.post(
        this.url,
        new URLSearchParams({
          From: process.env.TWILIO_WHATSAPP_NUMBER!,
          To: formattedTo,
          Body: message,
        }),
        {
          auth: this.auth,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
    } catch (error: any) {
      console.error('❌ Text Error:', error?.response?.data || error.message);
    }
  }

  async sendTemplate(to: string, contentSid: string) {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    try {
      await axios.post(
        this.url,
        new URLSearchParams({
          From: process.env.TWILIO_WHATSAPP_NUMBER!,
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

    // Map your DB doctors to the variables set in Twilio Console
    const variables = {};

    // We limit to the number of rows you created in the template (e.g., top 3)
    doctors.slice(0, 3).forEach((doc, index) => {
      const num = index + 1;
      variables[`${num}`] = doc.name; // Maps to {{1}}, {{2}}...
      variables[`${num}id`] = doc.id; // Maps to {{1id}}, {{2id}}...
    });

    try {
      await axios.post(
        this.url,
        new URLSearchParams({
          From: process.env.TWILIO_WHATSAPP_NUMBER!,
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
