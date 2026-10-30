import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, type Reservation, type Salida } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { holdHours, LINES, REFUND_POLICY } from '../common/config';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  codeOf,
  holdsSeat,
  normalizeChannel,
  normalizePhone,
  normalizeVariant,
  numberOf,
  refundFor,
  SEAT_STATUSES,
} from './rules';
import type {
  CancelDto,
  HostApplyDto,
  ReportPaymentDto,
  ReserveDto,
  SurveyDto,
  WaitlistDto,
} from './salidas.dto';

export const sha = (t: string) => createHash('sha256').update(t).digest('hex');

type Tx = Prisma.TransactionClient;

/** Filtro de Prisma: reservas que ocupan cupo ahora mismo. */
export const seatWhere = (now = new Date()): Prisma.ReservationWhereInput => ({
  OR: [
    { status: { in: SEAT_STATUSES.filter((s) => s !== 'requested') } },
    { status: 'requested', holdUntil: { gt: now } },
  ],
});

const TX_OPTS = { timeout: 10_000, maxWait: 5_000 };

/** Bloquea la fila de la salida hasta que termine la transacción: las reservas de una misma salida van en fila. */
export async function lockSalida(
  tx: Tx,
  where: { id?: string; slug?: string },
) {
  const rows = where.id
    ? await tx.$queryRaw<
        { id: string }[]
      >`SELECT id FROM "Salida" WHERE id = ${where.id} FOR UPDATE`
    : await tx.$queryRaw<
        { id: string }[]
      >`SELECT id FROM "Salida" WHERE slug = ${where.slug} FOR UPDATE`;
  if (!rows.length) throw new NotFoundException('No encontramos esa salida.');
  return tx.salida.findUniqueOrThrow({
    where: { id: rows[0].id },
    include: { place: true },
  });
}

/** Lanza 409 si la salida no tiene cupo libre. Debe llamarse con la salida bloqueada. */
export async function assertSeatFree(
  tx: Tx,
  salida: Pick<Salida, 'id' | 'capacity'>,
) {
  const taken = await tx.reservation.count({
    where: { salidaId: salida.id, ...seatWhere() },
  });
  if (taken >= salida.capacity) {
    throw new ConflictException({
      message:
        'Se acabaron los cupos de esta salida. Únete a la lista de espera y te avisamos de la próxima.',
      code: 'SOLD_OUT',
    });
  }
  return taken;
}

@Injectable()
export class SalidasService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SalidasService.name);
  private sweeper?: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  /** Cada 10 min pasa a "vencida" los apartados sin pago (el conteo de cupos ya los ignora antes). */
  onModuleInit() {
    if (process.env.NODE_ENV === 'test') return;
    this.sweeper = setInterval(() => void this.expireHolds(), 10 * 60_000);
    this.sweeper.unref();
  }

  onModuleDestroy() {
    if (this.sweeper) clearInterval(this.sweeper);
  }

  async expireHolds(now = new Date()) {
    try {
      const { count } = await this.prisma.reservation.updateMany({
        where: { status: 'requested', holdUntil: { lte: now } },
        data: { status: 'expired' },
      });
      if (count) this.logger.log(`${count} apartados vencidos`);
      return count;
    } catch (e) {
      this.logger.error('No se pudieron vencer los apartados', e as Error);
      return 0;
    }
  }

  // ───────────── Lugares y salidas ─────────────

  places() {
    return this.prisma.place.findMany({
      where: { status: { not: 'excluded' } },
      orderBy: [{ line: 'asc' }, { sortOrder: 'asc' }],
      select: {
        slug: true,
        line: true,
        name: true,
        area: true,
        experience: true,
        duration: true,
        distance: true,
        refPrice: true,
        note: true,
        status: true,
      },
    });
  }

  private async seatsTaken(ids: string[]) {
    if (!ids.length) return new Map<string, number>();
    const rows = await this.prisma.reservation.groupBy({
      by: ['salidaId'],
      where: { salidaId: { in: ids }, ...seatWhere() },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.salidaId, r._count._all]));
  }

  private publicSalida(
    s: Salida & {
      place: {
        slug: string;
        name: string;
        area: string;
        line: keyof typeof LINES;
      };
      host?: {
        name: string;
        organization: string | null;
        rnt: string | null;
      } | null;
    },
    taken: number,
  ) {
    const now = new Date();
    const seatsLeft = Math.max(0, s.capacity - taken);
    const bookable = s.status === 'open' && s.startsAt > now && seatsLeft > 0;
    return {
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      startsAt: s.startsAt,
      durationMin: s.durationMin,
      meetingPoint: s.meetingPoint,
      capacity: s.capacity,
      minToRun: s.minToRun,
      seatsTaken: Math.min(taken, s.capacity),
      seatsLeft,
      price: s.price,
      serviceFee: s.serviceFee,
      includes: s.includes,
      womenOnly: s.womenOnly,
      isDemo: s.isDemo,
      isSimulacro: s.isSimulacro,
      status: s.status,
      bookable,
      place: {
        slug: s.place.slug,
        name: s.place.name,
        area: s.place.area,
        line: s.place.line,
      },
      host: s.host
        ? {
            name: s.host.name,
            organization: s.host.organization,
            hasRnt: !!s.host.rnt,
          }
        : null,
    };
  }

  /** Próximas salidas visibles (abiertas o llenas), de la más cercana a la más lejana. */
  async list() {
    const salidas = await this.prisma.salida.findMany({
      where: {
        status: { in: ['open', 'closed'] },
        startsAt: { gt: new Date() },
      },
      orderBy: { startsAt: 'asc' },
      take: 30,
      include: { place: true, host: true },
    });
    const taken = await this.seatsTaken(salidas.map((s) => s.id));
    return salidas.map((s) => this.publicSalida(s, taken.get(s.id) ?? 0));
  }

  async detail(slug: string) {
    const s = await this.prisma.salida.findFirst({
      where: { slug, status: { not: 'draft' } },
      include: { place: true, host: true },
    });
    if (!s) throw new NotFoundException('No encontramos esa salida.');
    const taken = await this.seatsTaken([s.id]);
    return this.publicSalida(s, taken.get(s.id) ?? 0);
  }

  // ───────────── Reserva ─────────────

  async reserve(slug: string, dto: ReserveDto) {
    if (dto.website)
      throw new BadRequestException('No pudimos procesar la reserva.');
    const phone = normalizePhone(dto.phone);
    if (!phone)
      throw new BadRequestException(
        'Escribe un celular colombiano de 10 dígitos (empieza por 3).',
      );

    const token = randomBytes(24).toString('base64url');
    const now = new Date();

    const reservation = await this.prisma.$transaction(async (tx) => {
      const salida = await lockSalida(tx, { slug });
      if (salida.status !== 'open' || salida.startsAt <= now) {
        throw new ConflictException({
          message:
            'Esta salida ya no recibe reservas. Mira las próximas o únete a la lista de espera.',
          code: 'CLOSED',
        });
      }
      // Idempotencia: un mismo WhatsApp no aparta dos cupos en la misma salida.
      const existing = await tx.reservation.findFirst({
        where: { salidaId: salida.id, phone, ...seatWhere(now) },
        select: { number: true },
      });
      if (existing) {
        throw new ConflictException({
          message: `Ya tienes un cupo apartado en esta salida con la referencia ${codeOf(existing.number)}. Ábrelo desde el enlace que guardaste o escríbenos por WhatsApp.`,
          code: 'ALREADY_RESERVED',
          reference: codeOf(existing.number),
        });
      }
      await assertSeatFree(tx, salida);
      const holdUntil = new Date(
        Math.min(
          now.getTime() + holdHours() * 3_600_000,
          salida.startsAt.getTime(),
        ),
      );
      return tx.reservation.create({
        data: {
          tokenHash: sha(token),
          salidaId: salida.id,
          name: dto.name,
          phone,
          email: dto.email?.toLowerCase(),
          isAdult: dto.isAdult,
          inCali: dto.inCali,
          knowsTeam: dto.knowsTeam,
          heardFrom: dto.heardFrom,
          channel: normalizeChannel(dto.channel),
          variant: normalizeVariant(dto.variant),
          motivation: dto.motivation,
          comesAlone: dto.comesAlone,
          phoneChallenge: dto.phoneChallenge,
          price: salida.price,
          serviceFee: salida.serviceFee,
          holdUntil,
          acceptedAt: now,
          anonId: dto.anonId,
          isDemo: salida.isDemo,
        },
        include: { salida: { include: { place: true } } },
      });
    }, TX_OPTS);

    await this.events.log('reservation_created', {
      anonId: dto.anonId,
      salidaId: reservation.salidaId,
      variant: reservation.variant,
      channel: reservation.channel,
      props: {
        heardFrom: reservation.heardFrom,
        line: reservation.salida.place.line,
      },
    });

    return {
      code: codeOf(reservation.number),
      token,
      reservation: this.view(reservation),
    };
  }

  /** Busca una reserva por código + token. Sin token válido responde 404 (no revela si existe). */
  private async byToken(code: string, token: string, allowSurveyToken = false) {
    const number = numberOf(code);
    const r = number
      ? await this.prisma.reservation.findUnique({
          where: { number },
          include: {
            salida: { include: { place: true } },
            survey: { select: { id: true } },
          },
        })
      : null;
    const h = sha(token);
    const ok =
      r && (r.tokenHash === h || (allowSurveyToken && r.surveyTokenHash === h));
    if (!r || !ok) throw new NotFoundException('No encontramos esa reserva.');
    return r;
  }

  private view(
    r: Reservation & {
      salida: Salida & { place: { name: string; area: string; line: string } };
      survey?: { id: string } | null;
    },
  ) {
    const now = new Date();
    const status =
      r.status === 'requested' && r.holdUntil <= now ? 'expired' : r.status;
    const started = r.salida.startsAt <= now;
    const confirmedLike = [
      'confirmed',
      'payment_reported',
      'paid',
      'attended',
    ].includes(status);
    return {
      code: codeOf(r.number),
      name: r.name,
      status,
      holdUntil: r.holdUntil,
      price: r.price,
      serviceFee: r.serviceFee,
      phoneChallenge: r.phoneChallenge,
      comesAlone: r.comesAlone,
      createdAt: r.createdAt,
      paymentReportedAt: r.paymentReportedAt,
      paidAt: r.paidAt,
      cancelledAt: r.cancelledAt,
      refundNote: r.refundNote,
      isDemo: r.isDemo,
      salida: {
        slug: r.salida.slug,
        title: r.salida.title,
        startsAt: r.salida.startsAt,
        durationMin: r.salida.durationMin,
        meetingPoint: r.salida.meetingPoint,
        includes: r.salida.includes,
        status: r.salida.status,
        place: {
          name: r.salida.place.name,
          area: r.salida.place.area,
          line: r.salida.place.line,
        },
      },
      // Los datos de pago del anfitrión solo se muestran con el cupo confirmado por el equipo.
      paymentInstructions: confirmedLike ? r.salida.paymentInstructions : null,
      refund: refundFor(r.salida.startsAt, now),
      refundPolicy: REFUND_POLICY,
      can: {
        reportPayment: !started && ['requested', 'confirmed'].includes(status),
        cancel:
          !started &&
          ['requested', 'confirmed', 'payment_reported', 'paid'].includes(
            status,
          ),
        survey:
          !r.survey &&
          (status === 'attended' || (status === 'paid' && started)),
      },
      surveyDone: !!r.survey,
    };
  }

  async get(code: string, token: string) {
    return this.view(await this.byToken(code, token));
  }

  /** Lo mínimo para la encuesta (sirve con el enlace de la reserva o con el de la encuesta). */
  async surveyInfo(code: string, token: string) {
    const v = this.view(await this.byToken(code, token, true));
    return {
      code: v.code,
      name: v.name.split(' ')[0],
      salida: v.salida,
      canAnswer: v.can.survey,
      done: v.surveyDone,
    };
  }

  /** "Ya pagué": pago iniciado (nivel 5 sin verificar). Si el apartado venció, vuelve a pedir cupo con la salida bloqueada. */
  async reportPayment(code: string, dto: ReportPaymentDto) {
    const r = await this.byToken(code, dto.token);
    const now = new Date();
    if (r.salida.startsAt <= now)
      throw new ConflictException('La salida ya pasó.');
    if (r.status === 'payment_reported' || r.status === 'paid')
      return this.get(code, dto.token);
    if (!['requested', 'confirmed', 'expired'].includes(r.status)) {
      throw new ConflictException(
        'Esta reserva ya no está activa. Escríbenos por WhatsApp.',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      const salida = await lockSalida(tx, { id: r.salidaId });
      const fresh = await tx.reservation.findUniqueOrThrow({
        where: { id: r.id },
      });
      if (!holdsSeat(fresh, now)) await assertSeatFree(tx, salida);
      await tx.reservation.update({
        where: { id: r.id },
        data: {
          status: 'payment_reported',
          paymentReportedAt: now,
          paymentNote: dto.note,
        },
      });
    }, TX_OPTS);
    await this.events.log('payment_reported', {
      salidaId: r.salidaId,
      variant: r.variant,
      channel: r.channel,
      isDemo: r.isDemo,
    });
    return this.get(code, dto.token);
  }

  async cancel(code: string, dto: CancelDto) {
    const r = await this.byToken(code, dto.token);
    const now = new Date();
    if (r.salida.startsAt <= now)
      throw new ConflictException(
        'La salida ya empezó: escríbenos por WhatsApp.',
      );
    if (
      !['requested', 'confirmed', 'payment_reported', 'paid'].includes(r.status)
    ) {
      return this.get(code, dto.token);
    }
    const paidLike = r.status === 'paid' || r.status === 'payment_reported';
    await this.prisma.reservation.update({
      where: { id: r.id },
      data: {
        status: 'cancelled',
        cancelledAt: now,
        cancelReason: dto.reason ?? 'Cancelada por el viajero',
        refundNote: paidLike ? refundFor(r.salida.startsAt, now).text : null,
      },
    });
    await this.events.log('reservation_cancelled', {
      salidaId: r.salidaId,
      variant: r.variant,
      channel: r.channel,
      isDemo: r.isDemo,
    });
    return this.get(code, dto.token);
  }

  async survey(code: string, dto: SurveyDto) {
    const r = await this.byToken(code, dto.token, true);
    const v = this.view(r);
    if (v.surveyDone)
      throw new ConflictException('Ya respondiste esta encuesta. ¡Gracias!');
    if (!v.can.survey)
      throw new ConflictException(
        'La encuesta se abre cuando termina la salida.',
      );
    try {
      await this.prisma.surveyResponse.create({
        data: {
          reservationId: r.id,
          cameAlone: dto.cameAlone,
          newContact: dto.newContact,
          nps: dto.nps,
          wouldReturn: dto.wouldReturn,
          returnPlace: dto.returnPlace,
          improve: dto.improve,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('Ya respondiste esta encuesta. ¡Gracias!');
      }
      throw e;
    }
    await this.events.log('survey_completed', {
      salidaId: r.salidaId,
      isDemo: r.isDemo,
      props: { nps: dto.nps },
    });
    return { ok: true };
  }

  // ───────────── Lista de espera y anfitriones ─────────────

  async joinWaitlist(dto: WaitlistDto) {
    if (dto.website)
      throw new BadRequestException('No pudimos guardar tus datos.');
    const phone = normalizePhone(dto.phone);
    if (!phone)
      throw new BadRequestException(
        'Escribe un celular colombiano de 10 dígitos (empieza por 3).',
      );
    const data = {
      name: dto.name,
      line: dto.line ?? null,
      motivation: dto.motivation,
      variant: normalizeVariant(dto.variant),
      channel: normalizeChannel(dto.channel),
      anonId: dto.anonId,
      consentAt: new Date(),
    };
    const existed = await this.prisma.waitlistEntry.findUnique({
      where: { phone },
      select: { id: true },
    });
    await this.prisma.waitlistEntry.upsert({
      where: { phone },
      update: data,
      create: { ...data, phone },
    });
    if (!existed) {
      await this.events.log('waitlist_joined', {
        anonId: dto.anonId,
        variant: data.variant,
        channel: data.channel,
        props: { line: dto.line ?? null },
      });
    }
    return { ok: true, alreadyIn: !!existed };
  }

  async applyHost(dto: HostApplyDto) {
    if (dto.website)
      throw new BadRequestException('No pudimos guardar tus datos.');
    const phone = normalizePhone(dto.phone);
    if (!phone)
      throw new BadRequestException(
        'Escribe un celular colombiano de 10 dígitos (empieza por 3).',
      );
    const dup = await this.prisma.host.findFirst({
      where: { phone },
      select: { id: true },
    });
    if (dup) return { ok: true, alreadyIn: true };
    await this.prisma.host.create({
      data: {
        name: dto.name,
        phone,
        email: dto.email?.toLowerCase(),
        organization: dto.organization,
        activity: dto.activity,
        area: dto.area,
        rnt: dto.rnt,
        status: 'interested',
        source: 'form',
      },
    });
    await this.events.log('host_applied', {});
    return { ok: true, alreadyIn: false };
  }
}
