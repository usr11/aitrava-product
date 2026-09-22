import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { FeedbackController } from './feedback.controller';

@Module({ imports: [EventsModule], controllers: [FeedbackController] })
export class FeedbackModule {}
