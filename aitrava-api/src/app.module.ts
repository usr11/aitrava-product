import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { MailModule } from './mail/mail.service';
import { PrismaModule } from './prisma/prisma.module';
import { SalidasModule } from './salidas/salidas.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    EventsModule,
    AuthModule,
    SalidasModule,
    AdminModule,
  ],
})
export class AppModule {}
