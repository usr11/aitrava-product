import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { clientIp } from '../auth/auth.guard';
import { publicConfig } from '../common/config';
import { rateLimit } from '../common/rate-limit';
import {
  CancelDto,
  HostApplyDto,
  ReportPaymentDto,
  ReserveDto,
  SurveyDto,
  TokenQuery,
  WaitlistDto,
} from './salidas.dto';
import { SalidasService } from './salidas.service';

const MIN = 60_000;

/** API pública: el viajero no tiene cuenta; su reserva se abre con código + token secreto. */
@Controller()
export class SalidasController {
  constructor(private salidas: SalidasService) {}

  @Get('config')
  config() {
    return publicConfig();
  }

  @Get('places')
  places() {
    return this.salidas.places();
  }

  @Get('salidas')
  list() {
    return this.salidas.list();
  }

  @Get('salidas/:slug')
  detail(@Param('slug') slug: string) {
    return this.salidas.detail(slug);
  }

  @Post('salidas/:slug/reservations')
  reserve(
    @Param('slug') slug: string,
    @Body() dto: ReserveDto,
    @clientIp() ip: string,
  ) {
    rateLimit(`reserve:${ip}`, 12, 10 * MIN);
    return this.salidas.reserve(slug, dto);
  }

  @Get('reservations/:code')
  get(
    @Param('code') code: string,
    @Query() q: TokenQuery,
    @clientIp() ip: string,
  ) {
    rateLimit(`res:${ip}`, 120, MIN);
    return this.salidas.get(code, q.token);
  }

  @Post('reservations/:code/payment')
  @HttpCode(200)
  reportPayment(
    @Param('code') code: string,
    @Body() dto: ReportPaymentDto,
    @clientIp() ip: string,
  ) {
    rateLimit(`pay:${ip}`, 20, 10 * MIN);
    return this.salidas.reportPayment(code, dto);
  }

  @Post('reservations/:code/cancel')
  @HttpCode(200)
  cancel(
    @Param('code') code: string,
    @Body() dto: CancelDto,
    @clientIp() ip: string,
  ) {
    rateLimit(`cancel:${ip}`, 20, 10 * MIN);
    return this.salidas.cancel(code, dto);
  }

  @Get('surveys/:code')
  surveyInfo(
    @Param('code') code: string,
    @Query() q: TokenQuery,
    @clientIp() ip: string,
  ) {
    rateLimit(`res:${ip}`, 120, MIN);
    return this.salidas.surveyInfo(code, q.token);
  }

  @Post('surveys/:code')
  @HttpCode(200)
  survey(
    @Param('code') code: string,
    @Body() dto: SurveyDto,
    @clientIp() ip: string,
  ) {
    rateLimit(`survey:${ip}`, 20, 60 * MIN);
    return this.salidas.survey(code, dto);
  }

  @Post('waitlist')
  @HttpCode(200)
  waitlist(@Body() dto: WaitlistDto, @clientIp() ip: string) {
    rateLimit(`wait:${ip}`, 10, 60 * MIN);
    return this.salidas.joinWaitlist(dto);
  }

  @Post('hosts/apply')
  @HttpCode(200)
  applyHost(@Body() dto: HostApplyDto, @clientIp() ip: string) {
    rateLimit(`host:${ip}`, 5, 60 * MIN);
    return this.salidas.applyHost(dto);
  }
}
