import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"Clinic System" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Mail Error:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOtp(email: string, otp: string) {
    await this.sendMail(
      email,
      'Password Reset OTP',
      `
      <div style="font-family:sans-serif">
        <h2>Your OTP</h2>
        <p style="font-size:24px;font-weight:bold">${otp}</p>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
      `,
    );
  }

  async sendContactMail(data: any) {
    await this.sendMail(
      process.env.MAIL_USER!,
      `New Query: ${data.subject}`,
      `
        <h3>New Query Received</h3>
        <p><b>Name:</b> ${data.name}</p>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Subject:</b> ${data.subject}</p>
        <p><b>Message:</b> ${data.message}</p>
        <p><b>User ID:</b> ${data.userId || 'Guest'}</p>
        `,
    );

    await this.sendMail(
      data.email,
      'We received your query',
      `
      <p>Hi ${data.name},</p>
      <p>Thanks for contacting us. We'll get back to you soon.</p>
      `,
    );
  }
}
