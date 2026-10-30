import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CHANNELS } from '../common/config';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const emptyToUndef = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === ''
    ? undefined
    : trim({ value });

/** Campos de rastreo que manda la app (no los escribe el viajero). */
class Tracking {
  @IsOptional() @IsString() @MaxLength(40) channel?: string;
  @IsOptional() @IsIn(['A', 'B']) variant?: string;
  @IsOptional() @IsString() @MaxLength(80) anonId?: string;
  /** Honeypot: un humano nunca lo llena. */
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}

export class ReserveDto extends Tracking {
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'Escribe tu nombre (2 a 80 letras).' })
  name: string;

  @IsString()
  @Length(7, 25, { message: 'Escribe tu número de WhatsApp.' })
  phone: string;

  @IsOptional()
  @Transform(emptyToUndef)
  @IsEmail({}, { message: 'Ese correo no parece válido.' })
  @MaxLength(120)
  email?: string;

  @Transform(trim)
  @IsString()
  @MinLength(8, {
    message: 'Cuéntanos en una frase qué te motivó a buscar esta experiencia.',
  })
  @MaxLength(500)
  motivation: string;

  @IsBoolean() inCali: boolean;
  @IsBoolean() knowsTeam: boolean;
  @IsBoolean() comesAlone: boolean;
  @IsBoolean() phoneChallenge: boolean;

  @IsIn(Object.keys(CHANNELS), { message: 'Elige cómo nos conociste.' })
  heardFrom: string;

  @Equals(true, { message: 'Debes ser mayor de edad para reservar.' })
  isAdult: boolean;

  @Equals(true, {
    message: 'Debes aceptar el precio, la fecha y la política de reembolso.',
  })
  acceptsTerms: boolean;

  @Equals(true, {
    message:
      'Debes aceptar la regla de convivencia y el consentimiento informado.',
  })
  acceptsConduct: boolean;
}

export class TokenQuery {
  @IsString() @Length(20, 100) token: string;
}

export class ReportPaymentDto extends TokenQuery {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) note?: string;
}

export class CancelDto extends TokenQuery {
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) reason?: string;
}

export class WaitlistDto extends Tracking {
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'Escribe tu nombre.' })
  name: string;
  @IsString()
  @Length(7, 25, { message: 'Escribe tu número de WhatsApp.' })
  phone: string;
  @IsOptional() @IsIn(['URBANO', 'NATURALEZA', 'ESCAPADA']) line?:
    'URBANO' | 'NATURALEZA' | 'ESCAPADA';
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  motivation?: string;
  @Equals(true, { message: 'Debes autorizar el tratamiento de tus datos.' })
  consent: boolean;
}

export class HostApplyDto {
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'Escribe tu nombre.' })
  name: string;
  @IsString()
  @Length(7, 25, { message: 'Escribe tu número de WhatsApp.' })
  phone: string;
  @IsOptional()
  @Transform(emptyToUndef)
  @IsEmail({}, { message: 'Ese correo no parece válido.' })
  @MaxLength(120)
  email?: string;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  organization?: string;
  @Transform(trim)
  @IsString()
  @Length(5, 500, { message: 'Cuéntanos qué experiencia ofreces.' })
  activity: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) area?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) rnt?: string;
  @Equals(true, { message: 'Debes autorizar el tratamiento de tus datos.' })
  consent: boolean;
  @IsOptional() @IsString() @MaxLength(200) website?: string;
}

export class SurveyDto extends TokenQuery {
  @IsBoolean() cameAlone: boolean;
  @IsBoolean() newContact: boolean;
  @IsInt() @Min(0) @Max(10) nps: number;
  @IsBoolean() wouldReturn: boolean;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  returnPlace?: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(1000) improve?: string;
}
