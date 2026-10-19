import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export const BOOKING_CATEGORIES = [
  'vuelo',
  'alojamiento',
  'actividad',
  'transporte',
  'seguro',
  'restaurante',
  'otro',
];
export const ITEM_TYPES = [
  'actividad',
  'restaurante',
  'comida',
  'transporte',
  'alojamiento',
  'libre',
  'otro',
];
export const EXPENSE_CATEGORIES = [
  'transporte',
  'alojamiento',
  'actividades',
  'comida',
  'seguros',
  'otros',
];
export const FREQUENCIES = ['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const;

const MAX_MONEY = 2_000_000_000;

export class SavingsSetupDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_MONEY)
  targetAmount?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_MONEY)
  initialSaved?: number;
  @IsOptional() @IsIn(FREQUENCIES) frequency?: (typeof FREQUENCIES)[number];
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_MONEY)
  monthlyCapacity?: number | null;
}

export class CreateTripDto {
  @IsIn(['KNOWN', 'HELP', 'SURPRISE']) mode: 'KNOWN' | 'HELP' | 'SURPRISE';
  @IsOptional() @IsString() @MaxLength(80) title?: string;
  @IsString() @MinLength(2) @MaxLength(80) destinationCity: string;
  @IsString() @MinLength(2) @MaxLength(60) destinationCountry: string;
  @IsOptional() @IsString() @MaxLength(60) destinationSlug?: string;
  @IsString() @MinLength(2) @MaxLength(60) originCity: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(30) travelerCount: number;
  @Type(() => Number)
  @IsInt()
  @Min(50_000)
  @Max(MAX_MONEY)
  budgetAmount: number;
  @IsOptional() @IsObject() budgetByCategory?: Record<string, number>;
  @IsOptional() @IsObject() preferences?: Record<string, unknown>;
  @IsOptional() @IsBoolean() prefillItinerary?: boolean;
  @IsOptional()
  @ValidateNested()
  @Type(() => SavingsSetupDto)
  savings?: SavingsSetupDto;
}

export class UpdateTripDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) title?: string;
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  destinationCity?: string;
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  destinationCountry?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(60) originCity?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  travelerCount?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(50_000)
  @Max(MAX_MONEY)
  budgetAmount?: number;
  @IsOptional() @IsObject() budgetByCategory?: Record<string, number>;
}

export class ItemDto {
  @IsIn(ITEM_TYPES) type: string;
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsDateString() startAt: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional() @IsString() @MaxLength(120) locationName?: string;
  @IsOptional() @IsString() @MaxLength(200) address?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_MONEY)
  estimatedCost?: number;
  @IsOptional() @IsString() bookingId?: string;
}

export class ItemPatchDto {
  @IsOptional() @IsIn(ITEM_TYPES) type?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsDateString() startAt?: string;
  @IsOptional() @IsDateString() endAt?: string | null;
  @IsOptional() @IsString() @MaxLength(120) locationName?: string;
  @IsOptional() @IsString() @MaxLength(200) address?: string;
  @IsOptional() @Type(() => Number) @IsNumber() latitude?: number | null;
  @IsOptional() @Type(() => Number) @IsNumber() longitude?: number | null;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_MONEY)
  estimatedCost?: number | null;
  @IsOptional() @IsIn(['planned', 'done', 'cancelled']) status?: string;
}

export class BookingDto {
  @IsIn(BOOKING_CATEGORIES) category: string;
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(80) provider?: string;
  @IsOptional() @IsString() @MaxLength(80) reference?: string;
  @IsOptional() @IsDateString() startAt?: string;
  @IsOptional() @IsDateString() endAt?: string;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_MONEY)
  cost?: number;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsString() @MaxLength(200) address?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
  /** Crea también la actividad en el itinerario (si tiene fecha). */
  @IsOptional() @IsBoolean() addToItinerary?: boolean;
}

export class BookingPatchDto {
  @IsOptional() @IsIn(BOOKING_CATEGORIES) category?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(80) provider?: string;
  @IsOptional() @IsString() @MaxLength(80) reference?: string;
  @IsOptional() @IsDateString() startAt?: string | null;
  @IsOptional() @IsDateString() endAt?: string | null;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(MAX_MONEY) cost?:
    number | null;
  @IsOptional() @IsBoolean() isPaid?: boolean;
  @IsOptional() @IsString() @MaxLength(200) address?: string;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

export class ExpenseDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(MAX_MONEY) amount: number;
  @IsIn(EXPENSE_CATEGORIES) category: string;
  @IsOptional() @IsString() @MaxLength(200) description?: string;
  @IsOptional() @IsDateString() date?: string;
}

export class ContributionDto {
  @Type(() => Number) @IsInt() @Min(-MAX_MONEY) @Max(MAX_MONEY) amount: number;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() @MaxLength(120) note?: string;
}

export class SuggestQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) budget?: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  travelers?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(90) nights?: number;
  @IsOptional() @IsString() likes?: string;
  @IsOptional() @IsString() avoid?: string;
  @IsOptional() @IsIn(['colombia', 'internacional', 'todos']) scope?: string;
}
