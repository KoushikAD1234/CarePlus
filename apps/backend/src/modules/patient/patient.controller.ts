import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from 'src/common/guards/jwt/jwt.guard';
import { CreatePatientDto } from 'src/dto/create-patient.dto';

@Controller('patients')
export class PatientController {
  constructor(private patientService: PatientService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: CreatePatientDto, @Req() req: any) {
    console.log('clinic id', req.user.clinic_id);
    return this.patientService.create(body, req.user.clinic_id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req: any) {
    return this.patientService.findAll(req.user.clinic_id);
  }
}
