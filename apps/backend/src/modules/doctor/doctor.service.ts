import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import { UpdateDoctorProfileDto } from 'src/dto/update-doctor-profile.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async getProfile(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepo.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }
    return doctor;
  }

  async updateProfile(
    id: string,
    dto: UpdateDoctorProfileDto,
  ): Promise<Doctor> {
    const doctor = await this.getProfile(id);
    Object.assign(doctor, dto);
    return this.doctorRepo.save(doctor);
  }
}
