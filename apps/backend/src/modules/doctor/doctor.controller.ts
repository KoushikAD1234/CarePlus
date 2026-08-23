import {
  Controller,
  Get,
  Param,
  Body,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import * as QRCode from 'qrcode';

import { DoctorService } from './doctor.service';
import { UpdateDoctorProfileDto } from 'src/dto/update-doctor-profile.dto';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // Doctor profile
  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.doctorService.getProfile(id);
  }

  // Generate WhatsApp booking QR
  @Get(':id/qr')
  async getDoctorQR(@Param('id') doctorId: string) {
    const doctor = await this.doctorService.getProfile(doctorId);

    const phone = process.env.TWILIO_NUMBER;

    const link = `https://wa.me/${phone}?text=${encodeURIComponent(
      `BOOK ${doctor.booking_code}`,
    )}`;

    const qr = await QRCode.toDataURL(link);

    return {
      doctorId: doctor.id,
      bookingCode: doctor.booking_code,
      link,
      qr,
    };
  }

  // Public booking endpoint
  @Get('book/:bookingCode')
  bookDoctor(@Param('bookingCode') bookingCode: string) {
    return this.doctorService.bookDoctor(bookingCode);
  }

  // Doctor profile update
  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateProfile(
    @Param('id') id: string,
    @Body() body: UpdateDoctorProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.doctorService.updateProfile(id, body, file);
  }
}
