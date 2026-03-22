import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/database/entities/patient.entity';
import { CreatePatientDto } from 'src/dto/create-patient.dto';
import { Repository } from 'typeorm';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async create(body: CreatePatientDto, clinic_id: string) {
    const patient = this.patientRepo.create({
      ...body,
      clinic_id: clinic_id,
    });

    return this.patientRepo.save(patient);
  }

  async findAll(clinic_id: string) {
    return this.patientRepo.find({
      where: { clinic_id: clinic_id },
    });
  }
}
