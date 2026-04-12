import { Controller, Get, Param } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Controller('doctor')
export class DoctorController {
  @Get(':id/qr')
  async getDoctorQR(@Param('id') doctorId: string) {
    const phone = process.env.TWILIO_NUMBER;

    const link = `https://wa.me/${phone}?text=BOOK_DR_${doctorId}`;

    const qr = await QRCode.toDataURL(link);

    return {
      doctorId,
      link,
      qr,
    };
  }
}
