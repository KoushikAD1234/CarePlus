import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  subject: string;

  @IsNotEmpty()
  message: string;
}
