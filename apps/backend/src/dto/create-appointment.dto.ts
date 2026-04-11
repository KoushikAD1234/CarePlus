import { IsString, IsDateString } from 'class-validator';
import { AppointmentType } from 'src/database/entities/appointment.entity';

export class CreateAppointmentDto {
  @IsString()
  patient_id: string;

  @IsString()
  doctor_id: string;

  @IsString()
  patient_name: string;

  @IsString()
  patient_phone: string;

  @IsString()
  type: AppointmentType;

  @IsDateString()
  appointment_time: string;
}
