import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import type { Response } from 'express';
import { AdminGuard, CurrentUser, type AuthUser } from '../auth/auth.guard';
import { appUrl, defaultCommission, holdHours } from '../common/config';
import {
  BASE,
  fullModel,
  run,
  scenario,
  type Assumptions,
} from '../model/model';
import { PrismaService } from '../prisma/prisma.service';
import {
  ADMIN_TRANSITIONS,
  codeOf,
  holdsSeat,
  normalizePhone,
  slugify,
} from '../salidas/rules';
import {
  assertSeatFree,
  lockSalida,
  seatWhere,
  sha,
} from '../salidas/salidas.service';
import {
  AssumptionsDto,
  CommissionDto,
  CostDto,
  HostDto,
  HostPatchDto,
  IterationDto,
  IterationPatchDto,
  PlaceDto,
  PlacePatchDto,
  RangeQuery,
  ReservationPatchDto,
  RoleDto,
  SalidaDto,
  SalidaPatchDto,
} from './admin.dto';
import { AdminService, toCsv, type Range } from './admin.service';

const TX_OPTS = { timeout: 10_000, maxWait: 5_000 };

const range = (q: RangeQuery): Range => ({
  from: q.from ? new Date(q.from) : undefined,
  to: q.to ? new Date(q.to) : undefined,
});

/** Panel del equipo. AdminGuard confirma el rol en la BD en cada llamada. */
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private admin: AdminService,
    private prisma: PrismaService,
  ) {}

  // ───────────── Tablero ─────────────

  @Get('overview')
  overview(@Query() q: RangeQuery) {
    return this.admin.overview(range(q));
  }

  @Get('finance')
  finance(@Query() q: RangeQuery) {
    return this.admin.finance(range(q));
  }

  // ───────────── Modelo financiero ─────────────

  @Get('model')
  model() {
    return fullModel(BASE);
  }

  @Post('model')
  @HttpCode(200)
  modelWith(@Body() dto: AssumptionsDto) {
    const a: Assumptions = {
      ...structuredClone(BASE),
      ...(dto as Partial<Assumptions>),
    };
    const mix = a.lines.reduce((s, l) => s + l.mix, 0);
    if (a.lines.length === 0 || Math.abs(mix - 1) > 0.001) {
      throw new BadRequestException(
        'La mezcla de las líneas debe sumar 100 %.',
      );
    }
    return fullModel(a);
  }

  @Get('model/actuals')
  actuals() {
    return this.admin.modelActuals();
  }

  @Get('model/export.csv')
  modelCsv(@Res() res: Response) {
    const rows = (['Pesimista', 'Base', 'Optimista'] as const).flatMap((n) =>
      run(scenario(n)).map((r) =>
        [
          n,
          r.mes,
          r.salidas,
          r.reservas,
          r.gmv,
          r.ingreso,
          r.cac,
          r.kit,
          r.horas,
          r.fijos,
          r.resultado,
          r.caja,
        ].map((v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v)),
      ),
    );
    this.sendCsv(
      res,
      'modelo',
      toCsv(
        [
          'escenario',
          'mes',
          'salidas',
          'reservas',
          'valor_reservado',
          'ingreso_aitrava',
          'cac',
          'kit',
          'horas',
          'fijos',
          'resultado',
          'caja_acumulada',
        ],
        rows,
      ),
    );
  }

  // ───────────── Salidas ─────────────

  @Get('salidas')
  salidas() {
    return this.admin.salidas();
  }

  @Get('salidas/:id')
  async salida(@Param('id') id: string) {
    const s = await this.prisma.salida.findUnique({
      where: { id },
      include: {
        place: true,
        host: true,
        costs: true,
        reservations: { orderBy: { number: 'asc' }, include: { survey: true } },
      },
    });
    if (!s) throw new NotFoundException();
    const { reservations, ...rest } = s;
    const now = new Date();
    return {
      ...rest,
      seatsTaken: reservations.filter((r) => holdsSeat(r, now)).length,
      reservations: reservations.map((r) => this.admin.reservationView(r)),
    };
  }

  private async checkRefs(dto: { placeId?: string; hostId?: string | null }) {
    if (
      dto.placeId &&
      !(await this.prisma.place.findUnique({
        where: { id: dto.placeId },
        select: { id: true },
      }))
    ) {
      throw new BadRequestException('Ese lugar no existe.');
    }
    if (
      dto.hostId &&
      !(await this.prisma.host.findUnique({
        where: { id: dto.hostId },
        select: { id: true },
      }))
    ) {
      throw new BadRequestException('Ese anfitrión no existe.');
    }
  }

  @Post('salidas')
  async createSalida(@Body() dto: SalidaDto) {
    await this.checkRefs(dto);
    const date = new Date(dto.startsAt);
    const base = `${slugify(dto.title)}-${date.toISOString().slice(0, 10)}`;
    for (let i = 0; i < 5; i++) {
      const slug = i ? `${base}-${randomBytes(2).toString('hex')}` : base;
      try {
        return await this.prisma.salida.create({
          data: {
            ...dto,
            slug,
            startsAt: date,
            minToRun: dto.minToRun ?? Math.min(5, dto.capacity),
            commissionRate: dto.commissionRate ?? defaultCommission(),
            includes: dto.includes ?? [],
          },
        });
      } catch (e) {
        if (!(
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ))
          throw e;
      }
    }
    throw new ConflictException(
      'No se pudo crear un enlace único para la salida. Cambia el título.',
    );
  }

  @Patch('salidas/:id')
  async updateSalida(@Param('id') id: string, @Body() dto: SalidaPatchDto) {
    await this.checkRefs(dto);
    return this.prisma.$transaction(async (tx) => {
      await lockSalida(tx, { id });
      if (dto.capacity != null) {
        const taken = await tx.reservation.count({
          where: { salidaId: id, ...seatWhere() },
        });
        if (dto.capacity < taken) {
          throw new ConflictException(
            `Hay ${taken} cupos ocupados: la capacidad no puede ser menor.`,
          );
        }
      }
      return tx.salida.update({
        where: { id },
        data: {
          ...dto,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        },
      });
    }, TX_OPTS);
  }

  @Post('salidas/:id/commission')
  @HttpCode(200)
  commission(@Param('id') id: string, @Body() dto: CommissionDto) {
    return this.prisma.salida.update({
      where: { id },
      data: {
        commissionPaidAmount: dto.amount,
        commissionPaidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
      },
    });
  }

  @Delete('salidas/:id')
  async deleteSalida(@Param('id') id: string) {
    if (await this.prisma.reservation.count({ where: { salidaId: id } })) {
      throw new ConflictException(
        'La salida tiene reservas: cámbiala a "cancelada" en vez de borrarla.',
      );
    }
    await this.prisma.adminCost.updateMany({
      where: { salidaId: id },
      data: { salidaId: null },
    });
    await this.prisma.salida.delete({ where: { id } });
    return { ok: true };
  }

  // ───────────── Reservas ─────────────

  @Get('reservations')
  reservations(
    @Query('status') status?: string,
    @Query('salidaId') salidaId?: string,
    @Query('q') q?: string,
  ) {
    return this.admin.reservations({ status, salidaId, q: q?.slice(0, 60) });
  }

  @Patch('reservations/:id')
  async updateReservation(
    @Param('id') id: string,
    @Body() dto: ReservationPatchDto,
  ) {
    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const current = await tx.reservation.findUnique({ where: { id } });
      if (!current) throw new NotFoundException();
      const salida = await lockSalida(tx, { id: current.salidaId });
      const r = await tx.reservation.findUniqueOrThrow({ where: { id } });
      const data: Prisma.ReservationUpdateInput = {
        intentValid: dto.intentValid,
        challengeCompleted: dto.challengeCompleted,
        knowsTeam: dto.knowsTeam,
        isDemo: dto.isDemo,
        adminNotes: dto.adminNotes,
        refundNote: dto.refundNote,
      };
      if (dto.status && dto.status !== r.status) {
        if (!ADMIN_TRANSITIONS[r.status].includes(dto.status)) {
          throw new BadRequestException(
            `No se puede pasar de "${r.status}" a "${dto.status}".`,
          );
        }
        const next = {
          status: dto.status,
          holdUntil:
            dto.status === 'requested'
              ? new Date(now.getTime() + holdHours() * 3_600_000)
              : r.holdUntil,
        };
        // Si vuelve a ocupar cupo, se revisa que haya (sin sobreventa ni siquiera desde el admin).
        if (!holdsSeat(r, now) && holdsSeat(next, now))
          await assertSeatFree(tx, salida);
        data.status = dto.status;
        data.holdUntil = next.holdUntil;
        if (dto.status === 'confirmed') data.confirmedAt = r.confirmedAt ?? now;
        if (dto.status === 'payment_reported')
          data.paymentReportedAt = r.paymentReportedAt ?? now;
        if (dto.status === 'paid') {
          data.paidAt = r.paidAt ?? now;
          data.confirmedAt = r.confirmedAt ?? now;
        }
        if (dto.status === 'attended') data.attendedAt = now;
        if (dto.status === 'cancelled') data.cancelledAt = now;
      }
      return tx.reservation.update({
        where: { id },
        data,
        include: { survey: true },
      });
    }, TX_OPTS);
    return this.admin.reservationView(updated);
  }

  /** Enlace de la encuesta para mandar por WhatsApp (token propio: no invalida el enlace de la reserva). */
  @Post('reservations/:id/survey-link')
  @HttpCode(200)
  async surveyLink(@Param('id') id: string) {
    const token = randomBytes(24).toString('base64url');
    const r = await this.prisma.reservation.update({
      where: { id },
      data: { surveyTokenHash: sha(token) },
    });
    return {
      url: `${appUrl()}/encuesta/${codeOf(r.number)}?t=${token}`,
      phone: r.phone,
      name: r.name,
    };
  }

  /** Nuevo enlace privado de la reserva (si el viajero lo perdió). El anterior deja de funcionar. */
  @Post('reservations/:id/access-link')
  @HttpCode(200)
  async accessLink(@Param('id') id: string) {
    const token = randomBytes(24).toString('base64url');
    const r = await this.prisma.reservation.update({
      where: { id },
      data: { tokenHash: sha(token) },
    });
    return {
      url: `${appUrl()}/reserva/${codeOf(r.number)}?t=${token}`,
      phone: r.phone,
      name: r.name,
    };
  }

  // ───────────── Anfitriones ─────────────

  @Get('hosts')
  hosts() {
    return this.prisma.host.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { _count: { select: { salidas: true } } },
    });
  }

  private hostData(dto: HostPatchDto) {
    let phone = dto.phone;
    if (phone) {
      const p = normalizePhone(phone);
      if (!p)
        throw new BadRequestException(
          'Escribe un celular colombiano de 10 dígitos.',
        );
      phone = p;
    }
    return { ...dto, phone, email: dto.email?.toLowerCase() };
  }

  @Post('hosts')
  createHost(@Body() dto: HostDto) {
    const data = this.hostData(dto);
    return this.prisma.host.create({
      data: {
        ...data,
        activity: dto.activity,
        name: dto.name,
        acceptedAt: dto.status === 'accepted' ? new Date() : undefined,
      },
    });
  }

  @Patch('hosts/:id')
  async updateHost(@Param('id') id: string, @Body() dto: HostPatchDto) {
    const h = await this.prisma.host.findUnique({ where: { id } });
    if (!h) throw new NotFoundException();
    return this.prisma.host.update({
      where: { id },
      data: {
        ...this.hostData(dto),
        acceptedAt:
          dto.status === 'accepted' && !h.acceptedAt ? new Date() : undefined,
      },
    });
  }

  @Delete('hosts/:id')
  async deleteHost(@Param('id') id: string) {
    await this.prisma.host.delete({ where: { id } });
    return { ok: true };
  }

  // ───────────── Lugares ─────────────

  @Get('places')
  places() {
    return this.prisma.place.findMany({
      orderBy: [{ line: 'asc' }, { sortOrder: 'asc' }],
      include: { _count: { select: { salidas: true } } },
    });
  }

  @Post('places')
  async createPlace(@Body() dto: PlaceDto) {
    const slug = slugify(dto.name);
    if (await this.prisma.place.findUnique({ where: { slug } }))
      throw new ConflictException('Ya existe un lugar con ese nombre.');
    return this.prisma.place.create({ data: { ...dto, slug } });
  }

  @Patch('places/:id')
  updatePlace(@Param('id') id: string, @Body() dto: PlacePatchDto) {
    return this.prisma.place.update({ where: { id }, data: dto });
  }

  // ───────────── Lista de espera ─────────────

  @Get('waitlist')
  waitlist() {
    return this.prisma.waitlistEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }

  @Delete('waitlist/:id')
  async deleteWaitlist(@Param('id') id: string) {
    await this.prisma.waitlistEntry.delete({ where: { id } });
    return { ok: true };
  }

  // ───────────── Costos y pauta ─────────────

  @Get('costs')
  costs() {
    return this.prisma.adminCost.findMany({
      orderBy: { date: 'desc' },
      include: { salida: { select: { title: true } } },
    });
  }

  @Post('costs')
  createCost(@Body() dto: CostDto) {
    return this.prisma.adminCost.create({
      data: {
        ...dto,
        channel: dto.channel?.toUpperCase() || null,
        salidaId: dto.salidaId || null,
        date: new Date(dto.date),
      },
    });
  }

  @Delete('costs/:id')
  async deleteCost(@Param('id') id: string) {
    await this.prisma.adminCost.delete({ where: { id } });
    return { ok: true };
  }

  // ───────────── Ajustes (iteraciones) ─────────────

  @Get('iterations')
  iterations() {
    return this.prisma.iteration.findMany({ orderBy: { date: 'desc' } });
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
  async deleteIteration(@Param('id') id: string) {
    await this.prisma.iteration.delete({ where: { id } });
    return { ok: true };
  }

  // ───────────── Equipo ─────────────

  @Get('users')
  users() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
      },
    });
  }

  @Patch('users/:id/role')
  async setRole(
    @Param('id') id: string,
    @Body() dto: RoleDto,
    @CurrentUser() me: AuthUser,
  ) {
    if (id === me.sub && dto.role !== 'ADMIN')
      throw new BadRequestException(
        'No puedes quitarte el rol de admin a ti mismo.',
      );
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException();
    if (dto.role === 'ADMIN' && !user.emailVerifiedAt)
      throw new BadRequestException(
        'Primero verifica el correo de esa persona.',
      );
    await this.prisma.user.update({ where: { id }, data: { role: dto.role } });
    return { ok: true };
  }

  @Post('users/:id/verify-email')
  @HttpCode(200)
  async verifyEmail(@Param('id') id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { emailVerifiedAt: new Date(), verifyTokenHash: null },
    });
    return { ok: true };
  }

  // ───────────── CSV ─────────────

  private sendCsv(res: Response, name: string, body: string) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="aitrava-${name}.csv"`,
    );
    res.send(body);
  }

  @Get('export/:entity.csv')
  async exportCsv(@Param('entity') entity: string, @Res() res: Response) {
    const body = await this.admin.csv(entity);
    if (body == null) throw new NotFoundException();
    this.sendCsv(res, entity, body);
  }
}
