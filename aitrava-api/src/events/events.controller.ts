import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  CurrentUser,
  OptionalAuthGuard,
  clientIp,
  type AuthUser,
} from '../auth/auth.guard';
import { rateLimit } from '../common/rate-limit';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from './events.service';

class TrackDto {
  @IsString() @MaxLength(60) @Matches(/^[a-z_]+$/) name: string;
  @IsOptional() @IsString() @MaxLength(80) anonId?: string;
  @IsOptional() @IsString() @MaxLength(80) salida?: string; // slug
  @IsOptional() @IsIn(['A', 'B']) variant?: string;
  @IsOptional() @IsString() @MaxLength(40) channel?: string;
  @IsOptional() @IsObject() props?: Record<string, unknown>;
}

/** Eventos que el navegador puede mandar. Los de negocio (reservas, pagos, encuestas) solo los registra el servidor. */
const CLIENT_EVENTS = new Set([
  'landing_view',
  'hook_cta_clicked',
  'salida_viewed',
  'reserve_started',
  'whatsapp_clicked',
  'waitlist_started',
  'host_page_viewed',
  'places_viewed',
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
  async track(
    @Body() dto: TrackDto,
    @CurrentUser() user: AuthUser | null,
    @clientIp() ip: string,
  ) {
    if (!CLIENT_EVENTS.has(dto.name)) return;
    rateLimit(`ev:${ip}`, 120, 60_000);
    const salida = dto.salida
      ? await this.prisma.salida.findUnique({
          where: { slug: dto.salida },
          select: { id: true },
        })
      : null;
    await this.events.log(dto.name, {
      userId: user?.sub,
      anonId: dto.anonId,
      salidaId: salida?.id,
      variant: dto.variant,
      channel: dto.channel,
      props: dto.props,
    });
  }
}
