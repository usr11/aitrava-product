import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { SalidasController } from './salidas.controller';
import { SalidasService } from './salidas.service';

@Module({
  imports: [EventsModule],
  controllers: [SalidasController],
  providers: [SalidasService],
  exports: [SalidasService],
})
export class SalidasModule {}
