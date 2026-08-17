import { IsEmail, IsString, MinLength, IsPhoneNumber, IsNumber } from 'class-validator';

// DTO: stands for data transfer object.
// simple class that defines the "shape" of the data being sent over the network
// (usually in a POST or PUT request)

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsString()
  qualification: string;

  @IsString()
  registration_number: string;

  @IsString()
  specialization: string;

  @IsString()
  address: string;

  @IsNumber()
  fees: number;

  @MinLength(4)
  password: string;
}
