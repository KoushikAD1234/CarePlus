import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SendPrescriptionDto {
  @IsString()
  @IsNotEmpty()
  appointmentId: string;

  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @IsString()
  @IsOptional()
  patientName?: string;

  @IsString()
  @IsOptional()
  doctorName?: string;

  @IsString()
  @IsNotEmpty()
  prescriptionText: string;
}
