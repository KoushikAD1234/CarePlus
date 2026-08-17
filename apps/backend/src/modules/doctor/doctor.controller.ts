import { Controller, Get, Param, Body, Put } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { DoctorService } from './doctor.service';
import { UpdateDoctorProfileDto } from 'src/dto/update-doctor-profile.dto';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

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

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.doctorService.getProfile(id);
  }

  @Put(':id')
  updateProfile(@Param('id') id: string, @Body() body: UpdateDoctorProfileDto) {
    return this.doctorService.updateProfile(id, body);
  }
}
