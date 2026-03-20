import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async signup(body: SignupDto) {
    const existing = await this.doctorRepo.findOne({
      where: { email: body.email },
    });

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await this.hashPassword(body.password);

    const doctor = this.doctorRepo.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      clinic_id: 'default-clinic',
    });

    const saved = await this.doctorRepo.save(doctor);

    delete saved.password;

    return saved;
  }
}
