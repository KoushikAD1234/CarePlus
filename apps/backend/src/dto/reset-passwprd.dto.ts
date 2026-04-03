import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  otp: string;

  @IsString()
  newPassword: string;

  @IsString()
  email: string;
}
