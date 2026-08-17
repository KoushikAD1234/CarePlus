import { PartialType, OmitType } from '@nestjs/mapped-types';
import { SignupDto } from './signup.dto';

// Inherits all fields from SignupDto, makes them optional, and removes password
export class UpdateDoctorProfileDto extends PartialType(
  OmitType(SignupDto, ['password'] as const),
) {}
