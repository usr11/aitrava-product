import { Module } from '@nestjs/common';
import { EngineModule } from '../engine/engine.module';
import { EventsModule } from '../events/events.module';
import { PublicController, TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [EngineModule, EventsModule],
  controllers: [TripsController, PublicController],
  providers: [TripsService],
})
export class TripsModule {}
