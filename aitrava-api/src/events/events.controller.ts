import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  CurrentUser,
  OptionalAuthGuard,
  type AuthUser,
} from '../auth/auth.guard';
import { rateLimit } from '../common/rate-limit';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from './events.service';

class TrackDto {
  @IsString() @MaxLength(60) @Matches(/^[a-z_]+$/) name: string;
  @IsOptional() @IsString() @MaxLength(80) anonId?: string;
  @IsOptional() @IsString() @MaxLength(40) tripId?: string;
  @IsOptional() @IsObject() props?: Record<string, unknown>;
}

/** Eventos que solo registra el servidor (no se aceptan desde el navegador para no inflar el embudo). */
const SERVER_ONLY = new Set([
  'signup_completed',
  'email_verified',
  'login',
  'trip_created',
  'external_booking_added',
  'document_uploaded',
  'savings_goal_created',
  'savings_contribution_added',
  'wompi_redirected',
  'payment_pending',
  'payment_approved',
  'payment_declined',
  'receipt_downloaded',
]);

@Controller('events')
export class EventsController {
  constructor(
    private events: EventsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @HttpCode(204)
  @UseGuards(OptionalAuthGuard)
  async track(@Body() dto: TrackDto, @CurrentUser() user: AuthUser | null) {
    if (SERVER_ONLY.has(dto.name)) return;
    rateLimit(`ev:${dto.anonId ?? user?.sub ?? 'x'}`, 120, 60_000);
    // tripId solo se acepta si el viaje es del usuario con sesión
    const owns =
      user && dto.tripId
        ? !!(await this.prisma.trip.findFirst({
            where: { id: dto.tripId, userId: user.sub },
            select: { id: true },
          }))
        : false;
    await this.events.log(
      dto.name,
      user?.sub,
      dto.props,
      dto.anonId,
      owns ? dto.tripId : null,
    );
  }
}
