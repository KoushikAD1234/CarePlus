import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsEnum,
  Min,
  Max,
  Matches,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsInt()
  @Min(0)
  @Max(150)
  // 1. Ensure incoming strings from forms are converted to numbers
  @Type(() => Number)
  age: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be a valid E.164 format (e.g., +1234567890)',
  })
  phone: string;

  @IsEnum(Gender, {
    message: 'Gender must be Male, Female, or Other',
  })
  gender: Gender;

  // 2. Add an optional email if your Patient entity supports it
  @IsOptional()
  @IsString()
  email?: string;
}
