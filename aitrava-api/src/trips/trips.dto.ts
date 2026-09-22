import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class GenerateTripDto {
  @IsString() @MinLength(2) originCity: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(10) travelers: number;
  @Type(() => Number)
  @IsInt()
  @Min(300_000)
  @Max(50_000_000)
  budgetTotal: number;
  @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) vibes: string[];
  @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) avoid: string[];
  @IsOptional() @IsBoolean() isGift?: boolean;
  @IsOptional() @IsString() @MaxLength(60) giftTo?: string;
  @IsOptional() @IsString() @MaxLength(400) giftMessage?: string;
}

export class ReserveDto {
  @IsIn(['basico', 'plus', 'dorado']) plan: 'basico' | 'plus' | 'dorado';
  @IsOptional() @IsBoolean() deposit?: boolean;
}

export class GuessDto {
  @IsString() destination: string; // slug
}

export class FriendGuessDto {
  @IsString() @MinLength(1) @MaxLength(40) name: string;
  @IsString() destination: string;
}
