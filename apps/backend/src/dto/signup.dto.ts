import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO: stands for data transfer object.
// simple class that defines the "shape" of the data being sent over the network
// (usually in a POST or PUT request)

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(4)
  password: string;
}
