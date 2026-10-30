import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from '../events/events.module';
import { AuthController } from './auth.controller';
import { AdminGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    EventsModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '30d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminGuard],
  exports: [AdminGuard],
})
export class AuthModule {}
