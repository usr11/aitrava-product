import {
  Equals,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) @MaxLength(60) firstName: string;
  @IsString() @MinLength(2) @MaxLength(60) lastName: string;
  @IsEmail({}, { message: 'Escribe un correo válido' })
  @MaxLength(120)
  email: string;
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  password: string;
  @IsBoolean()
  @Equals(true, { message: 'Debes aceptar los Términos y Condiciones' })
  acceptTerms: boolean;
  @IsBoolean()
  @Equals(true, {
    message: 'Debes autorizar el tratamiento de tus datos personales',
  })
  acceptData: boolean;
}

export class LoginDto {
  @IsEmail({}, { message: 'Escribe un correo válido' }) email: string;
  @IsString() @MaxLength(100) password: string;
  @IsOptional() @IsString() @MaxLength(80) anonId?: string;
}

export class TokenDto {
  @IsString() @MinLength(20) @MaxLength(200) token: string;
}

export class ForgotDto {
  @IsEmail({}, { message: 'Escribe un correo válido' }) email: string;
}

export class ResetDto {
  @IsString() @MinLength(20) @MaxLength(200) token: string;
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  password: string;
}

export class UpdateMeDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) firstName?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) lastName?: string;
}

export class DeleteMeDto {
  @IsString() @MaxLength(100) password: string;
}
