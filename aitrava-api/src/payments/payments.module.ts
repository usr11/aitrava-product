import {
  Body,
  Controller,
  Get,
  HttpCode,
  Module,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { Response } from 'express';
import {
  AuthGuard,
  AuthUser,
  CurrentUser,
  VerifiedGuard,
} from '../auth/auth.guard';
import { EventsModule } from '../events/events.module';
import { PaymentsService } from './payments.service';

class CheckoutDto {
  @IsString() tripId: string;
}

class ReturnDto {
  @IsIn(['paid', 'cancelled', 'failed']) result:
    'paid' | 'cancelled' | 'failed';
  @IsOptional() @IsString() @MaxLength(200) note?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('checkout')
  @UseGuards(VerifiedGuard)
  checkout(@CurrentUser() u: AuthUser, @Body() dto: CheckoutDto) {
    return this.payments.checkout(u.sub, dto.tripId);
  }

  @Get('mine')
  @UseGuards(AuthGuard)
  mine(@CurrentUser() u: AuthUser) {
    return this.payments.mine(u.sub);
  }

  /** Wompi → AITRAVA. Público, pero solo se acepta con firma válida. */
  @Post('wompi/events')
  @HttpCode(200)
  wompi(@Body() body: Record<string, unknown>) {
    return this.payments.webhook(body);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.payments.get(u.sub, id);
  }

  @Post(':id/redirect')
  @HttpCode(200)
  @UseGuards(VerifiedGuard)
  redirect(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.payments.redirect(u.sub, id);
  }

  @Post(':id/return')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  reportReturn(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReturnDto,
  ) {
    return this.payments.reportReturn(u.sub, id, dto.result, dto.note);
  }

  @Get(':id/receipt.pdf')
  @UseGuards(AuthGuard)
  async receipt(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { pdf, fileName } = await this.payments.receipt(u, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    });
    res.end(pdf);
  }
}

@Module({
  imports: [EventsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
