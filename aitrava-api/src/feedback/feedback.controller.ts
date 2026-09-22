import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  CurrentUser,
  OptionalAuthGuard,
  type AuthUser,
} from '../auth/auth.guard';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';

class FeedbackDto {
  @IsIn(['widget', 'nps']) kind: 'widget' | 'nps';
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10) score?: number;
  @IsOptional() @IsString() @MaxLength(1000) comment?: string;
  @IsOptional() @IsString() @MaxLength(200) page?: string;
  @IsOptional() @IsString() tripId?: string;
  @IsOptional() @IsString() anonId?: string;
}

@Controller('feedback')
export class FeedbackController {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  @Post()
  @HttpCode(204)
  @UseGuards(OptionalAuthGuard)
  async create(@Body() dto: FeedbackDto, @CurrentUser() user: AuthUser | null) {
    const { anonId, ...data } = dto;
    await this.prisma.feedback.create({ data: { ...data, userId: user?.sub } });
    await this.events.log(
      dto.kind === 'nps' ? 'nps_submit' : 'feedback_submit',
      user?.sub,
      { score: dto.score ?? null },
      anonId,
    );
  }
}
