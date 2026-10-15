import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @Matches(/^\d{6,12}$/, {
    message: 'La cédula debe tener entre 6 y 12 números',
  })
  idNumber: string;
  @Matches(/^[\d +()-]{7,20}$/, { message: 'El teléfono no parece válido' })
  phone: string;
  @IsOptional() @IsString() ref?: string;
  @IsOptional() @IsString() utmSource?: string;
  @IsOptional() @IsString() anonId?: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
  @IsOptional() @IsString() anonId?: string;
}
