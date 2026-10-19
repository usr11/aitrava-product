import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { Response } from 'express';
import { AdminGuard, AuthUser, CurrentUser } from '../auth/auth.guard';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService, Range } from './admin.service';

class IterationDto {
  @IsString() @MaxLength(20) version: string;
  @IsDateString() date: string;
  @IsString() @MaxLength(1000) hypothesis: string;
  @IsString() @MaxLength(1000) metric: string;
  @IsString() @MaxLength(1000) result: string;
  @IsString() @MaxLength(1000) decision: string;
  @IsString() @MaxLength(1000) change: string;
}

class IterationPatchDto {
  @IsOptional() @IsString() @MaxLength(20) version?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() @MaxLength(1000) hypothesis?: string;
  @IsOptional() @IsString() @MaxLength(1000) metric?: string;
  @IsOptional() @IsString() @MaxLength(1000) result?: string;
  @IsOptional() @IsString() @MaxLength(1000) decision?: string;
  @IsOptional() @IsString() @MaxLength(1000) change?: string;
}

const PROVIDER_CATEGORIES = [
  'aerolineas',
  'hoteles',
  'restaurantes',
  'experiencias',
  'transporte',
  'seguros',
  'otros',
];
const PROVIDER_STATUS = ['demo', 'prospect', 'active', 'inactive'] as const;

class ProviderDto {
  @IsString() @MinLength(2) @MaxLength(80) name: string;
  @IsIn(PROVIDER_CATEGORIES) category: string;
  @IsString() @MinLength(2) @MaxLength(60) country: string;
  @IsOptional() @IsUrl() @MaxLength(300) logoUrl?: string;
  @IsOptional() @IsUrl() @MaxLength(300) websiteUrl?: string;
  @IsString() @MinLength(2) @MaxLength(400) description: string;
  @IsOptional()
  @IsIn(PROVIDER_STATUS)
  status?: (typeof PROVIDER_STATUS)[number];
}

class ProviderPatchDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) name?: string;
  @IsOptional() @IsIn(PROVIDER_CATEGORIES) category?: string;
  @IsOptional() @IsString() @MaxLength(60) country?: string;
  @IsOptional() @IsUrl() @MaxLength(300) logoUrl?: string;
  @IsOptional() @IsUrl() @MaxLength(300) websiteUrl?: string;
  @IsOptional() @IsString() @MaxLength(400) description?: string;
  @IsOptional()
  @IsIn(PROVIDER_STATUS)
  status?: (typeof PROVIDER_STATUS)[number];
}

class CostDto {
  @IsIn([
    'pasarela',
    'tecnologia',
    'hosting',
    'herramientas',
    'marketing',
    'operacion',
    'otros',
  ])
  category: string;
  @IsIn(['fijo', 'variable']) kind: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(2_000_000_000) amount: number;
  @IsOptional() @IsString() @MaxLength(200) description?: string;
  @IsDateString() date: string;
}

class RoleDto {
  @IsIn(['USER', 'ADMIN']) role: 'USER' | 'ADMIN';
}

class VerifyPaymentDto {
  @IsIn(['approved', 'declined']) status: 'approved' | 'declined';
  @IsOptional() @IsString() @MaxLength(80) providerTxId?: string;
}

class HandledDto {
  @IsBoolean() handled: boolean;
}

const parseRange = (from?: string, to?: string): Range => {
  const f = from ? new Date(from) : undefined;
  const t = to ? new Date(to) : undefined;
  if ((f && isNaN(f.getTime())) || (t && isNaN(t.getTime())))
    throw new BadRequestException('Rango de fechas inválido');
  return { from: f, to: t };
};

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private admin: AdminService,
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}

  @Get('metrics')
  metrics(@Query('from') from?: string, @Query('to') to?: string) {
    return this.admin.metrics(parseRange(from, to));
  }

  @Get('finance')
  finance(@Query('from') from?: string, @Query('to') to?: string) {
    return this.admin.finance(parseRange(from, to));
  }

  // Usuarios
  @Get('users')
  users() {
    return this.admin.users();
  }

  @Patch('users/:id/role')
  async setRole(
    @CurrentUser() me: AuthUser,
    @Param('id') id: string,
    @Body() dto: RoleDto,
  ) {
    if (id === me.sub && dto.role !== 'ADMIN')
      throw new BadRequestException(
        'No puedes quitarte tu propio rol de admin',
      );
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id } });
    if (dto.role === 'ADMIN' && !user.emailVerifiedAt)
      throw new BadRequestException(
        'Solo un usuario con el correo verificado puede ser admin',
      );
    await this.prisma.user.update({ where: { id }, data: { role: dto.role } });
    return { ok: true };
  }

  /** Para cuando el SMTP falle: un admin confirma a mano un correo que conoce. Queda como verificación manual. */
  @Post('users/:id/verify-email')
  async verifyEmail(@Param('id') id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { emailVerifiedAt: new Date(), verifyTokenHash: null },
    });
    return { ok: true };
  }

  // Viajes
  @Get('trips')
  trips() {
    return this.admin.trips();
  }

  // Pagos
  @Get('payments')
  paymentsList() {
    return this.admin.payments();
  }

  @Post('payments/:id/verify')
  verifyPayment(
    @CurrentUser() me: AuthUser,
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return dto.status === 'approved'
      ? this.payments.approve(id, 'admin', me.sub, dto.providerTxId)
      : this.payments.decline(id, 'admin', me.sub);
  }

  // Costos (finanzas)
  @Post('costs')
  addCost(@Body() dto: CostDto) {
    return this.prisma.adminCost.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  @Delete('costs/:id')
  removeCost(@Param('id') id: string) {
    return this.prisma.adminCost.delete({ where: { id } });
  }

  // Proveedores
  @Get('providers')
  providers() {
    return this.prisma.provider.findMany({
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  @Post('providers')
  addProvider(@Body() dto: ProviderDto) {
    return this.prisma.provider.create({ data: dto });
  }

  @Patch('providers/:id')
  updateProvider(@Param('id') id: string, @Body() dto: ProviderPatchDto) {
    return this.prisma.provider.update({ where: { id }, data: dto });
  }

  // Mensajes de contacto
  @Get('messages')
  messages() {
    return this.admin.messages();
  }

  @Patch('messages/:id')
  handled(@Param('id') id: string, @Body() dto: HandledDto) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { handled: dto.handled },
    });
  }

  // Feedback e iteraciones
  @Get('feedback')
  feedback() {
    return this.admin.feedback();
  }

  @Get('iterations')
  iterations() {
    return this.prisma.iteration.findMany({ orderBy: { date: 'asc' } });
  }

  @Post('iterations')
  createIteration(@Body() dto: IterationDto) {
    return this.prisma.iteration.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  @Patch('iterations/:id')
  updateIteration(@Param('id') id: string, @Body() dto: IterationPatchDto) {
    return this.prisma.iteration.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  @Delete('iterations/:id')
  deleteIteration(@Param('id') id: string) {
    return this.prisma.iteration.delete({ where: { id } });
  }

  // Exportaciones
  @Get('export/:entity.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(@Param('entity') entity: string, @Res() res: Response) {
    const allowed = ['usuarios', 'viajes', 'pagos', 'finanzas', 'analytics'];
    if (!allowed.includes(entity))
      throw new BadRequestException('Exportación desconocida');
    res.set(
      'Content-Disposition',
      `attachment; filename="aitrava-${entity}.csv"`,
    );
    res.send(await this.admin.exportCsv(entity));
  }
}
