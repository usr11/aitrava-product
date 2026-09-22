import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsOptional() @IsString() ref?: string;
  @IsOptional() @IsString() utmSource?: string;
  @IsOptional() @IsString() anonId?: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
  @IsOptional() @IsString() anonId?: string;
}
