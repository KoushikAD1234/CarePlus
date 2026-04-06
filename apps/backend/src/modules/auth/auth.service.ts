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
import { SignupDto } from '../../dto/signup.dto';
import { LoginDto } from '../../dto/login.dto';
import { ForgotPasswordDto } from 'src/dto/forgot-password.dto';
import { ResetPasswordDto } from 'src/dto/reset-passwprd.dto';
import { randomInt } from 'crypto';
import { MailService } from '../mail/mail.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Doctor) // Tells Nest which database table tool to deliver.
    private doctorRepo: Repository<Doctor>,
    private jwtService: JwtService,
    private mailService: MailService,
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

  // FORGOT PASSWORD
  async forgotPassword(body: ForgotPasswordDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { email: body.email },
    });

    if (doctor) {
      const otp = randomInt(100000, 999999).toString();

      // Save OTP + expiry
      doctor.reset_otp = otp;
      doctor.reset_otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

      await this.doctorRepo.save(doctor);

      // Send OTP email
      await this.mailService.sendOtp(doctor.email, otp);
    }

    // Always return same response (security)
    return { message: 'If email exists, OTP sent' };
  }

  // RESET PASSWORD
  async resetPassword(body: ResetPasswordDto) {
    const doctor = await this.doctorRepo.findOne({
      where: { email: body.email },
    });

    // ❌ No user or no OTP
    if (!doctor || !doctor.reset_otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // ⏰ Expiry check
    if (!doctor.reset_otp_expiry || doctor.reset_otp_expiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    // ❌ OTP mismatch
    if (doctor.reset_otp !== body.otp) {
      throw new BadRequestException('Incorrect OTP');
    }

    // 🔐 Hash new password
    const hashed = await bcrypt.hash(body.newPassword, 10);

    doctor.password = hashed;

    // 🧹 Clear OTP after use
    doctor.reset_otp = null;
    doctor.reset_otp_expiry = null;

    await this.doctorRepo.save(doctor);

    return { message: 'Password reset successful' };
  }
}
