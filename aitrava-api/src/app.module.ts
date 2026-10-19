import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './config/public.module';
import { EventsModule } from './events/events.module';
import { FeedbackModule } from './feedback/feedback.module';
import { MailModule } from './mail/mail.service';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { SavingsModule } from './savings/savings.module';
import { TripsModule } from './trips/trips.module';
import { VaultModule } from './vault/vault.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    EventsModule,
    AuthModule,
    PublicModule,
    TripsModule,
    SavingsModule,
    VaultModule,
    PaymentsModule,
    FeedbackModule,
    AdminModule,
  ],
})
export class AppModule {}
