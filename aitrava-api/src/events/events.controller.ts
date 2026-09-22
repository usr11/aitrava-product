import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  CurrentUser,
  OptionalAuthGuard,
  type AuthUser,
} from '../auth/auth.guard';
import { EventsService } from './events.service';

class TrackDto {
  @IsString() @MaxLength(60) name: string;
  @IsOptional() @IsString() anonId?: string;
  @IsOptional() @IsObject() props?: Record<string, unknown>;
}

@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Post()
  @HttpCode(204)
  @UseGuards(OptionalAuthGuard)
  async track(@Body() dto: TrackDto, @CurrentUser() user: AuthUser | null) {
    await this.events.log(dto.name, user?.sub, dto.props, dto.anonId);
  }
}
