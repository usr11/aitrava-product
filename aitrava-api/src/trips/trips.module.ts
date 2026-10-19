import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { DestinationsController, TripsController } from './trips.controller';
import { TripsService } from './trips.service';

@Module({
  imports: [EventsModule],
  controllers: [DestinationsController, TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
