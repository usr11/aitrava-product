import { Injectable } from '@nestjs/common';
import { Prisma, type Reservation } from '@prisma/client';
import { CHANNELS, TARGETS } from '../common/config';
import { BASE } from '../model/model';
import { PrismaService } from '../prisma/prisma.service';
import { codeOf, profile } from '../salidas/rules';

export type Range = { from?: Date; to?: Date };

const csvCell = (v: unknown) => {
  if (v == null) return '""';
  if (typeof v === 'number' || typeof v === 'boolean') return `"${v}"`;
  const s =
    v instanceof Date
      ? v.toISOString()
      : typeof v === 'string'
        ? v
        : JSON.stringify(v);
  // Evita que un texto se ejecute como fórmula al abrir el CSV en Excel.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};
export const toCsv = (header: string[], rows: unknown[][]) =>
  '﻿' +
  [
    header.map(csvCell).join(','),
    ...rows.map((r) => r.map(csvCell).join(',')),
  ].join('\n');

const ratio = (num: number, den: number) => (den > 0 ? num / den : null);

/** Estados que ya pasaron por cada escalón (una reserva pagada también fue confirmada). */
const REACHED = {
  confirmed: ['confirmed', 'payment_reported', 'paid', 'attended', 'no_show'],
  reported: ['payment_reported', 'paid', 'attended', 'no_show'],
  paid: ['paid', 'attended', 'no_show'],
} as const;

type ResWithSalida = Reservation & {
  salida: {
    isSimulacro: boolean;
    isDemo: boolean;
    status: string;
    commissionRate: number;
  };
  survey?: { id: string } | null;
};

/** Canal atribuido: el de la URL manda; si no hay, lo que respondió el viajero. */
export const channelOf = (r: { channel: string | null; heardFrom: string }) =>
  r.channel ?? r.heardFrom;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private created(r: Range) {
    return r.from || r.to ? { createdAt: { gte: r.from, lt: r.to } } : {};
  }

  /** Reservas que cuentan: ni DEMO ni de simulacros. */
  private realReservations(r: Range = {}) {
    return this.prisma.reservation.findMany({
      where: {
        isDemo: false,
        salida: { isDemo: false, isSimulacro: false },
        ...this.created(r),
      },
      include: {
        salida: {
          select: {
            isSimulacro: true,
            isDemo: true,
            status: true,
            commissionRate: true,
          },
        },
        survey: { select: { id: true } },
      },
    }) as Promise<ResWithSalida[]>;
  }

  /** Visitantes únicos por evento (y por variante). */
  private async uniques(
    names: string[],
    r: Range,
    by: 'variant' | 'channel' | null = null,
  ) {
    const where: Prisma.EventWhereInput = {
      name: { in: names },
      isDemo: false,
      ...this.created(r),
    };
    const rows = await this.prisma.event.findMany({
      where,
      select: {
        name: true,
        anonId: true,
        variant: true,
        channel: true,
        id: true,
      },
    });
    const out = new Map<string, Set<string>>();
    for (const e of rows) {
      const key = `${e.name}|${by ? (e[by] ?? '—') : ''}`;
      if (!out.has(key)) out.set(key, new Set());
      out.get(key)!.add(e.anonId ?? e.id);
    }
    return (name: string, group = '') => out.get(`${name}|${group}`)?.size ?? 0;
  }

  // ───────────── Tablero de evidencia ─────────────

  async overview(range: Range) {
    const [res, waitlist, hosts, ab, funnel, channels, value, viability] =
      await Promise.all([
        this.realReservations(range),
        this.prisma.waitlistEntry.count({ where: this.created(range) }),
        this.hostsProgress(),
        this.abTest(range),
        this.funnel(range),
        this.channels(range),
        this.valueDelivered(),
        this.viability(),
      ]);

    const withProfile = res.map((x) => ({ ...x, profile: profile(x) }));
    const reached = (k: keyof typeof REACHED) =>
      withProfile.filter((x) =>
        (REACHED[k] as readonly string[]).includes(x.status),
      );
    const paidAll = reached('paid');
    const paidQualified = paidAll.filter((x) => x.profile.qualifies === true);

    const evidence = {
      interest: waitlist,
      reservations: withProfile.length,
      qualified: withProfile.filter((x) => x.profile.qualifies === true).length,
      pendingReview: withProfile.filter((x) => x.profile.qualifies === null)
        .length,
      friendsFamily: withProfile.filter((x) => x.knowsTeam).length,
      paymentReported: reached('reported').length,
      paid: paidAll.length,
      paidQualified: paidQualified.length,
      conversionToPay: ratio(paidAll.length, withProfile.length),
      simulacros: await this.prisma.reservation.count({
        where: { salida: { isSimulacro: true }, isDemo: false },
      }),
    };

    const spend = await this.spendByChannel(range);
    const totalSpend = [...spend.values()].reduce((a, b) => a + b, 0);
    const newPaid = paidAll.length; // el CAC global usa todas las reservas pagadas del periodo
    return {
      targets: TARGETS,
      evidence,
      cac: {
        spend: totalSpend,
        paid: newPaid,
        value: newPaid ? totalSpend / newPaid : null,
      },
      hosts,
      ab,
      funnel,
      channels,
      value,
      viability,
    };
  }

  private async spendByChannel(range: Range) {
    const costs = await this.prisma.adminCost.findMany({
      where: {
        category: 'pauta',
        ...(range.from || range.to
          ? { date: { gte: range.from, lt: range.to } }
          : {}),
      },
      select: { channel: true, amount: true },
    });
    const m = new Map<string, number>();
    for (const c of costs)
      m.set(
        c.channel ?? 'SIN_CANAL',
        (m.get(c.channel ?? 'SIN_CANAL') ?? 0) + c.amount,
      );
    return m;
  }

  async hostsProgress() {
    const hosts = await this.prisma.host.findMany({
      select: { status: true, commissionAccepted: true, isTestHost: true },
    });
    const real = hosts.filter((h) => !h.isTestHost);
    return {
      total: real.length,
      contacted: real.filter((h) => h.status !== 'prospect').length,
      accepted: real.filter(
        (h) =>
          (h.commissionAccepted ?? 0) >= 0.16 &&
          ['accepted', 'active'].includes(h.status),
      ).length,
      acceptedAt20: real.filter(
        (h) =>
          (h.commissionAccepted ?? 0) >= 0.2 &&
          ['accepted', 'active'].includes(h.status),
      ).length,
      testHosts: hosts.length - real.length,
    };
  }

  /** TC0: visitas, clics y leads por variante. Ganador: ≥ 60 visitas por variante y ≥ 5 pp de diferencia. */
  async abTest(range: Range) {
    const u = await this.uniques(
      ['landing_view', 'hook_cta_clicked'],
      range,
      'variant',
    );
    const [wl, rs] = await Promise.all([
      this.prisma.waitlistEntry.groupBy({
        by: ['variant'],
        where: this.created(range),
        _count: { _all: true },
      }),
      this.prisma.reservation.groupBy({
        by: ['variant'],
        where: {
          isDemo: false,
          salida: { isDemo: false, isSimulacro: false },
          ...this.created(range),
        },
        _count: { _all: true },
      }),
    ]);
    const count = (
      rows: { variant: string | null; _count: { _all: number } }[],
      v: string,
    ) => rows.find((x) => x.variant === v)?._count._all ?? 0;
    const variants = (['A', 'B'] as const).map((v) => {
      const visits = u('landing_view', v);
      const clicks = u('hook_cta_clicked', v);
      const leads = count(wl, v) + count(rs, v);
      return {
        variant: v,
        label:
          v === 'A'
            ? 'Tribu Cero · "Ve solo, sal acompañado"'
            : 'Reset 180° · "3 horas sin celular"',
        visits,
        clicks,
        waitlist: count(wl, v),
        reservations: count(rs, v),
        clickRate: ratio(clicks, visits),
        leadRate: ratio(leads, visits),
      };
    });
    const [a, b] = variants;
    const enough =
      a.visits >= TARGETS.tc0ClicksPerVariant &&
      b.visits >= TARGETS.tc0ClicksPerVariant;
    const diffPp =
      a.leadRate != null && b.leadRate != null
        ? (a.leadRate - b.leadRate) * 100
        : null;
    const winner =
      enough && diffPp != null && Math.abs(diffPp) >= TARGETS.tc0DiffPp
        ? diffPp > 0
          ? 'A'
          : 'B'
        : null;
    return {
      variants,
      enough,
      diffPp,
      winner,
      decision: !enough
        ? `Faltan visitas: se necesitan ${TARGETS.tc0ClicksPerVariant} por variante.`
        : winner
          ? `Lidera la variante ${winner}.`
          : 'Ninguna gana por 5 pp o más: se comunican los dos ganchos juntos.',
    };
  }

  async funnel(range: Range) {
    const u = await this.uniques(
      [
        'landing_view',
        'hook_cta_clicked',
        'salida_viewed',
        'reserve_started',
        'whatsapp_clicked',
      ],
      range,
    );
    const res = await this.realReservations(range);
    const reached = (k: keyof typeof REACHED) =>
      res.filter((x) => (REACHED[k] as readonly string[]).includes(x.status))
        .length;
    const steps = [
      { key: 'visit', label: 'Visitas', value: u('landing_view') },
      { key: 'cta', label: 'Clic en el gancho', value: u('hook_cta_clicked') },
      { key: 'salida', label: 'Ven una salida', value: u('salida_viewed') },
      {
        key: 'start',
        label: 'Empiezan la reserva',
        value: u('reserve_started'),
      },
      { key: 'reserved', label: 'Reserva creada', value: res.length },
      {
        key: 'whatsapp',
        label: 'Abren WhatsApp',
        value: u('whatsapp_clicked'),
      },
      {
        key: 'confirmed',
        label: 'Cupo confirmado',
        value: reached('confirmed'),
      },
      { key: 'reported', label: 'Pago reportado', value: reached('reported') },
      { key: 'paid', label: 'Pago verificado', value: reached('paid') },
      {
        key: 'attended',
        label: 'Asistieron',
        value: res.filter((x) => x.status === 'attended').length,
      },
      {
        key: 'survey',
        label: 'Respondieron la encuesta',
        value: res.filter((x) => x.survey).length,
      },
    ];
    const first = steps[0].value;
    return steps.map((s, i) => ({
      ...s,
      fromPrevious: i === 0 ? null : ratio(s.value, steps[i - 1].value),
      fromStart: ratio(s.value, first),
    }));
  }

  /** Canales: reservas, pagos, pauta y CAC por canal (regla §5.6: CAC > $10.400 dos salidas seguidas → se corta). */
  async channels(range: Range) {
    const [res, spend, visits] = await Promise.all([
      this.realReservations(range),
      this.spendByChannel(range),
      this.uniques(['landing_view'], range, 'channel'),
    ]);
    const keys = new Set<string>([
      ...Object.keys(CHANNELS),
      ...spend.keys(),
      ...res.map(channelOf),
    ]);
    return [...keys]
      .map((ch) => {
        const mine = res.filter((x) => channelOf(x) === ch);
        const paid = mine.filter((x) =>
          (REACHED.paid as readonly string[]).includes(x.status),
        ).length;
        const s = spend.get(ch) ?? 0;
        return {
          channel: ch,
          label: (CHANNELS as Record<string, string>)[ch] ?? ch,
          visits: visits('landing_view', ch),
          reservations: mine.length,
          paid,
          spend: s,
          cac: paid ? s / paid : null,
          overCac: paid ? s / paid > TARGETS.cacMax : s > 0,
        };
      })
      .filter((c) => c.visits || c.reservations || c.spend)
      .sort((a, b) => b.reservations - a.reservations);
  }

  /** Métricas de entrega de valor (documento §4.3), separadas en salidas reales y simulacros. */
  async valueDelivered() {
    const compute = async (isSimulacro: boolean) => {
      const where = { isDemo: false, salida: { isDemo: false, isSimulacro } };
      const [surveys, attended, salidas] = await Promise.all([
        this.prisma.surveyResponse.findMany({ where: { reservation: where } }),
        this.prisma.reservation.findMany({
          where: { ...where, status: 'attended' },
          select: { phoneChallenge: true, challengeCompleted: true },
        }),
        this.prisma.salida.findMany({
          where: { isDemo: false, isSimulacro, status: 'done' },
          select: {
            hostNewClients: true,
            _count: {
              select: { reservations: { where: { status: 'attended' } } },
            },
          },
        }),
      ]);
      const solo = surveys.filter((s) => s.cameAlone);
      const promoters = surveys.filter((s) => s.nps >= 9).length;
      const detractors = surveys.filter((s) => s.nps <= 6).length;
      const challenged = attended.filter(
        (a) => a.phoneChallenge && a.challengeCompleted !== null,
      );
      const interviewed = salidas.filter((s) => s.hostNewClients != null);
      const hostNew = interviewed.reduce(
        (a, s) => a + (s.hostNewClients ?? 0),
        0,
      );
      const hostBase = interviewed.reduce(
        (a, s) => a + s._count.reservations,
        0,
      );
      return {
        surveys: surveys.length,
        attended: attended.length,
        salidasDone: salidas.length,
        newContactRate: {
          value: ratio(solo.filter((s) => s.newContact).length, solo.length),
          n: solo.length,
          target: TARGETS.newContactRate,
        },
        wouldReturnRate: {
          value: ratio(
            surveys.filter((s) => s.wouldReturn).length,
            surveys.length,
          ),
          n: surveys.length,
          target: TARGETS.wouldReturnRate,
        },
        nps: {
          value: surveys.length
            ? ((promoters - detractors) / surveys.length) * 100
            : null,
          n: surveys.length,
          target: TARGETS.nps,
        },
        challengeRate: {
          value: ratio(
            challenged.filter((a) => a.challengeCompleted).length,
            challenged.length,
          ),
          n: challenged.length,
          target: TARGETS.challengeRate,
        },
        hostConfirmsRate: {
          value: ratio(hostNew, hostBase),
          n: hostBase,
          target: TARGETS.hostConfirmsRate,
        },
        improvements: surveys
          .filter((s) => s.improve)
          .slice(-20)
          .map((s) => s.improve),
      };
    };
    const [real, simulacro] = await Promise.all([
      compute(false),
      compute(true),
    ]);
    return { real, simulacro };
  }

  /** Decisión de viabilidad (documento §7.8): se evalúa con 4 salidas reales hechas. */
  async viability() {
    const fin = await this.finance({});
    const done = await this.prisma.salida.count({
      where: { isDemo: false, isSimulacro: false, status: 'done' },
    });
    const value = await this.valueDelivered();
    const returnSignal = Math.max(
      fin.unit.repurchaseRate ?? 0,
      value.real.wouldReturnRate.value ?? 0,
    );
    const hasReturnData =
      fin.unit.repurchaseRate != null ||
      value.real.wouldReturnRate.value != null;
    const conditions = [
      {
        key: 'contribution',
        label: 'Contribución por reserva ≥ $0',
        value: fin.unit.contribution,
        ok: fin.unit.contribution == null ? null : fin.unit.contribution >= 0,
      },
      {
        key: 'cac',
        label: 'CAC ≤ $10.400',
        value: fin.unit.cac,
        ok: fin.unit.cac == null ? null : fin.unit.cac <= TARGETS.cacMax,
      },
      {
        key: 'return',
        label: 'Recompra o intención de volver ≥ 25 %',
        value: hasReturnData ? returnSignal : null,
        ok: hasReturnData ? returnSignal >= TARGETS.repurchaseMin : null,
      },
    ];
    const failed = conditions.filter((c) => c.ok === false).length;
    return {
      salidasDone: done,
      ready: done >= 4,
      conditions,
      decision:
        done < 4
          ? `Se decide después de 4 salidas reales (van ${done}).`
          : failed === 0
            ? 'Se sigue: se cumplen las tres condiciones.'
            : failed === 1
              ? 'Falla una condición: se pivota esa palanca.'
              : 'Fallan dos o más: se replantea el modelo.',
    };
  }

  // ───────────── Finanzas reales ─────────────

  async finance(range: Range) {
    const inRange = (d: Date | null) =>
      !!d && (!range.from || d >= range.from) && (!range.to || d < range.to);
    const res = await this.prisma.reservation.findMany({
      where: {
        isDemo: false,
        salida: { isDemo: false, isSimulacro: false },
        status: { in: [...REACHED.paid] },
      },
      include: {
        salida: {
          select: {
            id: true,
            status: true,
            commissionRate: true,
            startsAt: true,
          },
        },
      },
    });
    const paid = res.filter((r) => inRange(r.paidAt ?? r.createdAt));
    const salidas = await this.prisma.salida.findMany({
      where: {
        isDemo: false,
        isSimulacro: false,
        status: { in: ['done', 'open', 'closed'] },
      },
      select: {
        id: true,
        startsAt: true,
        status: true,
        commissionPaidAmount: true,
        commissionPaidAt: true,
        coordinatorHours: true,
      },
    });
    const costs = await this.prisma.adminCost.findMany({
      where:
        range.from || range.to
          ? { date: { gte: range.from, lt: range.to } }
          : {},
      orderBy: { date: 'asc' },
    });

    // La comisión se causa cuando la salida se realiza (status done) con reservas pagadas o que asistieron.
    const doneIds = new Set(
      salidas.filter((s) => s.status === 'done').map((s) => s.id),
    );
    const accrued = paid
      .filter((r) => doneIds.has(r.salidaId) && r.status !== 'no_show')
      .reduce(
        (a, r) => a + r.price * r.salida.commissionRate + r.serviceFee,
        0,
      );
    const collected = salidas
      .filter((s) => inRange(s.commissionPaidAt))
      .reduce((a, s) => a + (s.commissionPaidAmount ?? 0), 0);
    const gmv = paid.reduce((a, r) => a + r.price, 0);
    const byCat = (cat: string) =>
      costs.filter((c) => c.category === cat).reduce((a, c) => a + c.amount, 0);
    const variable = byCat('pauta') + byCat('kit') + byCat('horas');
    const fixed = costs
      .filter((c) => !['pauta', 'kit', 'horas'].includes(c.category))
      .reduce((a, c) => a + c.amount, 0);

    // Recompra: personas (por WhatsApp) con más de una reserva pagada.
    const byPhone = new Map<string, number>();
    for (const r of res) byPhone.set(r.phone, (byPhone.get(r.phone) ?? 0) + 1);
    const buyers = byPhone.size;
    const repeaters = [...byPhone.values()].filter((n) => n > 1).length;

    // Por mes (America/Bogota ≈ UTC−5; se agrupa por la fecha del pago).
    const month = (d: Date) =>
      new Date(d.getTime() - 5 * 3_600_000).toISOString().slice(0, 7);
    const months = new Map<
      string,
      {
        month: string;
        bookings: number;
        gmv: number;
        commission: number;
        costs: number;
      }
    >();
    const row = (m: string) => {
      if (!months.has(m))
        months.set(m, {
          month: m,
          bookings: 0,
          gmv: 0,
          commission: 0,
          costs: 0,
        });
      return months.get(m)!;
    };
    for (const r of paid) {
      const m = row(month(r.paidAt ?? r.createdAt));
      m.bookings += 1;
      m.gmv += r.price;
      if (doneIds.has(r.salidaId) && r.status !== 'no_show')
        m.commission += r.price * r.salida.commissionRate + r.serviceFee;
    }
    for (const c of costs) row(month(c.date)).costs += c.amount;

    const n = paid.length;
    const hours = salidas.filter((s) => s.coordinatorHours != null);
    return {
      paidBookings: n,
      gmv,
      commissionAccrued: accrued,
      commissionCollected: collected,
      costs: {
        pauta: byCat('pauta'),
        kit: byCat('kit'),
        horas: byCat('horas'),
        fijos: byCat('fijos'),
        formalizacion: byCat('formalizacion'),
        otros: byCat('otros'),
        variable,
        fixed,
        total: variable + fixed,
      },
      result: accrued - variable - fixed,
      unit: {
        ticket: n ? gmv / n : null,
        commissionPerBooking: n ? accrued / n : null,
        cac: n && byCat('pauta') ? byCat('pauta') / n : n ? 0 : null,
        contribution: n ? (accrued - variable) / n : null,
        repurchaseRate: buyers ? repeaters / buyers : null,
        avgCoordinatorHours: hours.length
          ? hours.reduce((a, s) => a + (s.coordinatorHours ?? 0), 0) /
            hours.length
          : null,
      },
      byMonth: [...months.values()].sort((a, b) =>
        a.month.localeCompare(b.month),
      ),
      note: 'La comisión se causa cuando la salida queda como realizada. El valor reservado es del anfitrión, no de AiTrava.',
    };
  }

  /** Supuestos que salen de los datos reales, para "Usar datos reales" en el modelo (solo los que ya tienen datos). */
  async modelActuals() {
    const fin = await this.finance({});
    const salidas = await this.prisma.salida.findMany({
      where: { isDemo: false, isSimulacro: false, status: 'done' },
      select: {
        capacity: true,
        _count: {
          select: {
            reservations: { where: { status: { in: ['attended', 'paid'] } } },
          },
        },
      },
    });
    const cap = salidas.reduce((a, s) => a + s.capacity, 0);
    const att = salidas.reduce((a, s) => a + s._count.reservations, 0);
    const commissions = await this.prisma.salida.aggregate({
      where: { isDemo: false, isSimulacro: false, status: 'done' },
      _avg: { commissionRate: true },
    });
    return {
      salidasDone: salidas.length,
      ticket: fin.unit.ticket,
      occupancy: cap ? att / cap : null,
      cac:
        fin.paidBookings && fin.costs.pauta
          ? fin.costs.pauta / fin.paidBookings
          : null,
      hours: fin.unit.avgCoordinatorHours,
      repurchase: fin.unit.repurchaseRate,
      commission: salidas.length
        ? (commissions._avg.commissionRate ?? null)
        : null,
      kitPerSalida:
        salidas.length && fin.costs.kit ? fin.costs.kit / salidas.length : null,
      base: BASE,
    };
  }

  // ───────────── Listados ─────────────

  async salidas() {
    const salidas = await this.prisma.salida.findMany({
      orderBy: { startsAt: 'desc' },
      include: {
        place: { select: { name: true, line: true } },
        host: { select: { name: true } },
      },
    });
    const counts = await this.prisma.reservation.groupBy({
      by: ['salidaId', 'status'],
      _count: { _all: true },
    });
    const now = new Date();
    const holds = await this.prisma.reservation.groupBy({
      by: ['salidaId'],
      where: { status: 'requested', holdUntil: { gt: now } },
      _count: { _all: true },
    });
    return salidas.map((s) => {
      const c = (st: string) =>
        counts.find((x) => x.salidaId === s.id && x.status === st)?._count
          ._all ?? 0;
      const seats =
        (holds.find((h) => h.salidaId === s.id)?._count._all ?? 0) +
        c('confirmed') +
        c('payment_reported') +
        c('paid') +
        c('attended');
      return {
        ...s,
        seatsTaken: seats,
        counts: {
          requested: c('requested'),
          confirmed: c('confirmed'),
          payment_reported: c('payment_reported'),
          paid: c('paid'),
          attended: c('attended'),
          no_show: c('no_show'),
          cancelled: c('cancelled'),
          expired: c('expired'),
        },
      };
    });
  }

  reservationView(
    r: Reservation & {
      survey?: unknown;
      salida?: {
        title: string;
        slug: string;
        startsAt: Date;
        isSimulacro: boolean;
      };
    },
  ) {
    const { tokenHash, surveyTokenHash, ...rest } = r;
    void tokenHash;
    return {
      ...rest,
      code: codeOf(r.number),
      hasSurveyLink: !!surveyTokenHash,
      holdExpired: r.status === 'requested' && r.holdUntil <= new Date(),
      profile: profile(r),
    };
  }

  async reservations(filter: {
    status?: string;
    salidaId?: string;
    q?: string;
  }) {
    const q = filter.q?.trim();
    const digits = q?.replace(/\D/g, '');
    const rows = await this.prisma.reservation.findMany({
      where: {
        status: filter.status
          ? (filter.status as Reservation['status'])
          : undefined,
        salidaId: filter.salidaId || undefined,
        OR: q
          ? [
              { name: { contains: q, mode: 'insensitive' } },
              ...(digits && digits.length >= 4
                ? [{ phone: { contains: digits } }]
                : []),
              ...(/^\d{1,6}$/.test(digits ?? '')
                ? [{ number: Number(digits) }]
                : []),
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        survey: true,
        salida: {
          select: {
            title: true,
            slug: true,
            startsAt: true,
            isSimulacro: true,
          },
        },
      },
    });
    return rows.map((r) => this.reservationView(r));
  }

  // ───────────── CSV ─────────────

  async csv(entity: string): Promise<string | null> {
    const d = (x: Date | null | undefined) => x ?? '';
    if (entity === 'reservas') {
      const rows = await this.prisma.reservation.findMany({
        orderBy: { number: 'asc' },
        include: {
          salida: {
            select: {
              title: true,
              startsAt: true,
              isSimulacro: true,
              isDemo: true,
            },
          },
          survey: true,
        },
      });
      return toCsv(
        [
          'codigo',
          'salida',
          'fecha_salida',
          'simulacro',
          'demo',
          'nombre',
          'whatsapp',
          'estado',
          'precio',
          'v1_mayor',
          'v2_cali',
          'v3_no_conoce_equipo',
          'v4_canal_aitrava',
          'v5_intencion',
          'cumple_perfil',
          'motivacion',
          'canal_url',
          'como_nos_conocio',
          'variante',
          'viene_solo',
          'reto_celular',
          'reto_completado',
          'creada',
          'pago_reportado',
          'pagada',
          'nps',
          'contacto_nuevo',
          'volveria',
        ],
        rows.map((r) => {
          const p = profile(r);
          return [
            codeOf(r.number),
            r.salida.title,
            r.salida.startsAt,
            r.salida.isSimulacro,
            r.isDemo || r.salida.isDemo,
            r.name,
            r.phone,
            r.status,
            r.price,
            p.v1,
            p.v2,
            p.v3,
            p.v4,
            p.v5 ?? '',
            p.qualifies ?? 'por revisar',
            r.motivation,
            r.channel ?? '',
            r.heardFrom,
            r.variant ?? '',
            r.comesAlone,
            r.phoneChallenge,
            r.challengeCompleted ?? '',
            r.createdAt,
            d(r.paymentReportedAt),
            d(r.paidAt),
            r.survey?.nps ?? '',
            r.survey?.newContact ?? '',
            r.survey?.wouldReturn ?? '',
          ];
        }),
      );
    }
    if (entity === 'espera') {
      const rows = await this.prisma.waitlistEntry.findMany({
        orderBy: { createdAt: 'asc' },
      });
      return toCsv(
        [
          'nombre',
          'whatsapp',
          'linea',
          'motivacion',
          'variante',
          'canal',
          'fecha',
        ],
        rows.map((w) => [
          w.name,
          w.phone,
          w.line ?? '',
          w.motivation ?? '',
          w.variant ?? '',
          w.channel ?? '',
          w.createdAt,
        ]),
      );
    }
    if (entity === 'anfitriones') {
      const rows = await this.prisma.host.findMany({
        orderBy: { createdAt: 'asc' },
      });
      return toCsv(
        [
          'nombre',
          'whatsapp',
          'correo',
          'organizacion',
          'actividad',
          'zona',
          'rnt',
          'estado',
          'comision_aceptada',
          'anfitrion_de_prueba',
          'origen',
          'notas',
          'creado',
        ],
        rows.map((h) => [
          h.name,
          h.phone ?? '',
          h.email ?? '',
          h.organization ?? '',
          h.activity,
          h.area ?? '',
          h.rnt ?? '',
          h.status,
          h.commissionAccepted ?? '',
          h.isTestHost,
          h.source,
          h.notes ?? '',
          h.createdAt,
        ]),
      );
    }
    if (entity === 'encuestas') {
      const rows = await this.prisma.surveyResponse.findMany({
        orderBy: { createdAt: 'asc' },
        include: {
          reservation: {
            include: { salida: { select: { title: true, isSimulacro: true } } },
          },
        },
      });
      return toCsv(
        [
          'codigo',
          'salida',
          'simulacro',
          'vino_solo',
          'contacto_nuevo',
          'nps',
          'volveria',
          'a_donde',
          'que_cambiaria',
          'fecha',
        ],
        rows.map((s) => [
          codeOf(s.reservation.number),
          s.reservation.salida.title,
          s.reservation.salida.isSimulacro,
          s.cameAlone,
          s.newContact,
          s.nps,
          s.wouldReturn,
          s.returnPlace ?? '',
          s.improve ?? '',
          s.createdAt,
        ]),
      );
    }
    if (entity === 'costos') {
      const rows = await this.prisma.adminCost.findMany({
        orderBy: { date: 'asc' },
      });
      return toCsv(
        ['fecha', 'categoria', 'tipo', 'canal', 'valor', 'descripcion'],
        rows.map((c) => [
          c.date,
          c.category,
          c.kind,
          c.channel ?? '',
          c.amount,
          c.description ?? '',
        ]),
      );
    }
    if (entity === 'salidas') {
      const rows = await this.salidas();
      return toCsv(
        [
          'salida',
          'lugar',
          'fecha',
          'estado',
          'simulacro',
          'demo',
          'cupos',
          'ocupados',
          'pagadas',
          'asistieron',
          'precio',
          'comision',
          'clientes_nuevos_anfitrion',
          'horas_equipo',
          'comision_cobrada',
        ],
        rows.map((s) => [
          s.title,
          s.place.name,
          s.startsAt,
          s.status,
          s.isSimulacro,
          s.isDemo,
          s.capacity,
          s.seatsTaken,
          s.counts.paid,
          s.counts.attended,
          s.price,
          s.commissionRate,
          s.hostNewClients ?? '',
          s.coordinatorHours ?? '',
          s.commissionPaidAmount ?? '',
        ]),
      );
    }
    return null;
  }
}
