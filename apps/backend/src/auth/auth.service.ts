import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from 'src/database/entities/doctor.entity';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Doctor) // Tells Nest which database table tool to deliver.
    private doctorRepo: Repository<Doctor>,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
  async comparePassword(
    bodyPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(bodyPassword, userPassword);
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

  async login(body: LoginDto) {
    const user = await this.doctorRepo.findOne({
      where: { email: body.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentils');
    }

    const isMatch = await this.comparePassword(body.password, user.password!);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid Exception');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      clinic_id: user.clinic_id,
    });

    console.log('Value of clinic id', user.clinic_id);

    return {
      access_token: token,
    };
  }
}
