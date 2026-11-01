import { PartialType } from '@nestjs/mapped-types';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const LINES = ['URBANO', 'NATURALEZA', 'ESCAPADA'] as const;
const SALIDA_STATUS = ['draft', 'open', 'closed', 'done', 'cancelled'] as const;
const HOST_STATUS = [
  'prospect',
  'contacted',
  'interested',
  'accepted',
  'declined',
  'active',
] as const;
const PLACE_STATUS = ['active', 'verify', 'excluded'] as const;
export const RES_STATUS = [
  'requested',
  'confirmed',
  'payment_reported',
  'paid',
  'attended',
  'no_show',
  'cancelled',
  'expired',
] as const;

export class SalidaDto {
  @IsString() @Length(5, 40) placeId: string;
  @IsOptional() @IsString() @Length(5, 40) hostId?: string | null;
  @Transform(trim) @IsString() @Length(4, 120) title: string;
  @Transform(trim) @IsString() @Length(10, 1200) summary: string;
  @IsDateString() startsAt: string;
  @IsInt() @Min(30) @Max(24 * 60) durationMin: number;
  @Transform(trim) @IsString() @Length(4, 300) meetingPoint: string;
  @IsInt() @Min(2) @Max(30) capacity: number;
  @IsOptional() @IsInt() @Min(1) @Max(30) minToRun?: number;
  @IsInt() @Min(0) @Max(5_000_000) price: number;
  @IsOptional() @IsInt() @Min(0) @Max(100_000) serviceFee?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(0.5) commissionRate?: number;
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(120, { each: true })
  includes?: string[];
  @IsOptional() @IsBoolean() womenOnly?: boolean;
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  paymentInstructions?: string | null;
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? null : value,
  )
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: 'El link de pago debe empezar por https://' },
  )
  @MaxLength(300)
  paymentUrl?: string | null;
  @IsOptional() @IsIn(SALIDA_STATUS) status?: (typeof SALIDA_STATUS)[number];
  @IsOptional() @IsBoolean() isSimulacro?: boolean;
  @IsOptional() @IsBoolean() isDemo?: boolean;
  @IsOptional() @IsInt() @Min(0) @Max(100) hostNewClients?: number | null;
  @IsOptional() @IsNumber() @Min(0) @Max(100) coordinatorHours?: number | null;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) notes?:
    string | null;
}

export class SalidaPatchDto extends PartialType(SalidaDto) {}

export class CommissionDto {
  @IsInt() @Min(0) @Max(100_000_000) amount: number;
  @IsOptional() @IsDateString() paidAt?: string;
}

export class ReservationPatchDto {
  @IsOptional() @IsIn(RES_STATUS) status?: (typeof RES_STATUS)[number];
  @IsOptional() @IsBoolean() intentValid?: boolean | null;
  @IsOptional() @IsBoolean() challengeCompleted?: boolean | null;
  @IsOptional() @IsBoolean() knowsTeam?: boolean;
  @IsOptional() @IsBoolean() isDemo?: boolean;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(1000) adminNotes?:
    string | null;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) refundNote?:
    string | null;
}

export class HostDto {
  @Transform(trim) @IsString() @Length(2, 80) name: string;
  @IsOptional() @IsString() @MaxLength(25) phone?: string | null;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) email?:
    string | null;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) organization?:
    string | null;
  @Transform(trim) @IsString() @Length(2, 500) activity: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(120) area?:
    string | null;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) rnt?: string | null;
  @IsOptional() @IsIn(HOST_STATUS) status?: (typeof HOST_STATUS)[number];
  @IsOptional() @IsNumber() @Min(0) @Max(0.5) commissionAccepted?:
    number | null;
  @IsOptional() @IsBoolean() isTestHost?: boolean;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(2000) notes?:
    string | null;
}

export class HostPatchDto extends PartialType(HostDto) {}

export class PlaceDto {
  @IsIn(LINES) line: (typeof LINES)[number];
  @Transform(trim) @IsString() @Length(2, 120) name: string;
  @Transform(trim) @IsString() @Length(2, 120) area: string;
  @Transform(trim) @IsString() @Length(4, 400) experience: string;
  @Transform(trim) @IsString() @Length(1, 40) duration: string;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(40) distance?:
    string | null;
  @IsInt() @Min(0) @Max(5_000_000) refPrice: number;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(400) note?:
    string | null;
  @IsOptional() @IsIn(PLACE_STATUS) status?: (typeof PLACE_STATUS)[number];
  @IsOptional() @IsInt() @Min(0) @Max(999) sortOrder?: number;
}

export class PlacePatchDto extends PartialType(PlaceDto) {}

export class CostDto {
  @IsIn(['pauta', 'kit', 'horas', 'fijos', 'formalizacion', 'otros'])
  category: string;
  @IsIn(['fijo', 'variable']) kind: string;
  @IsOptional() @IsString() @MaxLength(30) channel?: string | null;
  @IsOptional() @IsString() @MaxLength(40) salidaId?: string | null;
  @IsInt() @Min(1) @Max(100_000_000) amount: number;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(300) description?:
    string | null;
  @IsDateString() date: string;
}

export class IterationDto {
  @Transform(trim) @IsString() @Length(1, 20) version: string;
  @IsDateString() date: string;
  @Transform(trim) @IsString() @Length(1, 1000) hypothesis: string;
  @Transform(trim) @IsString() @Length(1, 1000) metric: string;
  @Transform(trim) @IsString() @Length(1, 1000) result: string;
  @Transform(trim) @IsString() @Length(1, 1000) decision: string;
  @Transform(trim) @IsString() @Length(1, 1000) change: string;
}

export class IterationPatchDto extends PartialType(IterationDto) {}

export class RoleDto {
  @IsIn(['USER', 'ADMIN']) role: 'USER' | 'ADMIN';
}

class LineDto {
  @IsString() @MaxLength(40) name: string;
  @IsInt() @Min(0) @Max(5_000_000) price: number;
  @IsInt() @Min(1) @Max(50) cupo: number;
  @IsNumber() @Min(0) @Max(1) mix: number;
}

const twelve = { message: 'Debe tener 12 valores (uno por mes).' };
const Months = () => (t: object, k: string) => {
  ArrayMinSize(12, twelve)(t, k);
  ArrayMaxSize(12, twelve)(t, k);
  IsNumber({}, { each: true })(t, k);
};

/** Supuestos editables del modelo financiero (todos opcionales: lo que no venga se toma del base). */
export class AssumptionsDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => LineDto)
  lines?: LineDto[];
  @IsOptional() @IsNumber() @Min(0) @Max(0.6) comision?: number;
  @IsOptional() @IsInt() @Min(0) @Max(200_000) feeServicio?: number;
  @IsOptional() @IsArray() @Months() salidas?: number[];
  @IsOptional() @IsArray() @Months() ocupacion?: number[];
  @IsOptional() @IsArray() @Months() recompra?: number[];
  @IsOptional() @IsInt() @Min(0) @Max(500_000) cac?: number;
  @IsOptional() @IsInt() @Min(0) @Max(1_000_000) kitSalida?: number;
  @IsOptional() @IsArray() @Months() horasSalida?: number[];
  @IsOptional() @IsInt() @Min(0) @Max(500_000) valorHora?: number;
  @IsOptional() @IsArray() @Months() fijos?: number[];
}

export class RangeQuery {
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}
