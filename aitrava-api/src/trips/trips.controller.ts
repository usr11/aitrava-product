import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, type AuthUser } from '../auth/auth.guard';
import { isDemoMode } from '../common/config';
import { EngineService } from '../engine/engine.service';
import {
  FriendGuessDto,
  GenerateTripDto,
  GuessDto,
  ReserveDto,
} from './trips.dto';
import { TripsService } from './trips.service';

@Controller('trips')
@UseGuards(AuthGuard)
export class TripsController {
  constructor(private trips: TripsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.trips.list(user.sub);
  }

  @Post('generate')
  generate(@CurrentUser() user: AuthUser, @Body() dto: GenerateTripDto) {
    return this.trips.generate(user.sub, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.trips.get(id, user.sub);
  }

  @Post(':id/reroll')
  reroll(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.trips.reroll(id, user.sub);
  }

  @Post(':id/reserve')
  reserve(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReserveDto,
  ) {
    return this.trips.reserve(id, user.sub, dto.deposit);
  }

  @Post(':id/guess')
  guess(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: GuessDto,
  ) {
    return this.trips.guess(id, user.sub, dto.destination);
  }

  @Post(':id/demo-skip')
  demoSkip(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.trips.demoSkip(id, user.sub);
  }

  @Post(':id/reveal')
  reveal(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.trips.reveal(id, user.sub);
  }
}

@Controller()
export class PublicController {
  constructor(
    private trips: TripsService,
    private engine: EngineService,
  ) {}

  @Get()
  health() {
    return { ok: true, name: 'AiTrava API' };
  }

  @Get('config')
  config() {
    return { demoMode: isDemoMode(), aiEnabled: this.engine.aiEnabled };
  }

  @Get('destinations')
  destinations() {
    return this.trips.destinations();
  }

  @Get('share/:code')
  share(@Param('code') code: string) {
    return this.trips.share(code);
  }

  @Post('share/:code/guess')
  friendGuess(
    @Param('code') code: string,
    @Body() dto: FriendGuessDto,
    @Headers('x-anon-id') anonId?: string,
  ) {
    return this.trips.friendGuess(code, dto.name, dto.destination, anonId);
  }
}
