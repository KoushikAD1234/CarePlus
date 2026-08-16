import { Controller, Post, UseGuards, Req, Get, Body, Query, Patch, Param, Delete } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from 'src/common/guards/jwt/jwt.guard';
import { CreateAppointmentDto } from 'src/dto/create-appointment.dto';
import { GetAppointmentsDto } from 'src/dto/get-appointment.dto';
import { UpdateStatusDto } from 'src/dto/update-status.dto';
import { SendPrescriptionDto } from 'src/dto/send-prescription.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreateAppointmentDto, @Req() req: any) {
    // return this.appointmentService.create(body, req.user.clinic_id);
    console.log('Logged in doctor create section:', req.user.id);
    return this.appointmentService.create(body, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAppointments(@Query() query: GetAppointmentsDto, @Req() req) {
    // const clinic_id = req.user.id; // from JWT
    console.log('Logged in doctor get section:', req.user.id);
    const doctor_id = req.user.id;
    return this.appointmentService.getAppointments(query, doctor_id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.appointmentService.updateStatus(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteAppointment(@Param('id') id: string) {
    return this.appointmentService.deleteAppointment(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    // return this.appointmentService.findAll(req.user.clinic_id);
    return this.appointmentService.findAll(req.user.id);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('send-prescription')
  sendPrescription(@Body() body: SendPrescriptionDto) {
    return this.appointmentService.sendPrescription(body);
  }
}
