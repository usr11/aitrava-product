import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Embudo de validación (especificación §48). Cada paso cuenta personas únicas (usuario o anónimo). */
export const FUNNEL: { key: string; label: string; events: string[] }[] = [
  { key: 'visit', label: 'Visita', events: ['page_view'] },
  {
    key: 'signup_started',
    label: 'Registro iniciado',
    events: ['signup_started'],
  },
  {
    key: 'signup_completed',
    label: 'Usuario registrado',
    events: ['signup_completed'],
  },
  {
    key: 'email_verified',
    label: 'Correo verificado',
    events: ['email_verified'],
  },
  { key: 'trip_created', label: 'Viaje creado', events: ['trip_created'] },
  {
    key: 'content_added',
    label: 'Reserva o documento agregado',
    events: ['external_booking_added', 'document_uploaded'],
  },
  { key: 'checkout', label: 'Checkout', events: ['checkout_viewed'] },
  {
    key: 'payment_started',
    label: 'Pago iniciado (Wompi)',
    events: ['wompi_redirected'],
  },
  {
    key: 'payment_approved',
    label: 'Pago confirmado',
    events: ['payment_approved'],
  },
  {
    key: 'travel_mode',
    label: 'Modo Viaje usado',
    events: ['travel_mode_opened'],
  },
];

export type Range = { from?: Date; to?: Date };

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

/** Filtro de eventos reales: sin DEMO y sin las cuentas del equipo (admins). */
const realEvents = (r: Range) => Prisma.sql`
  e."isDemo" = false
  AND (e."userId" IS NULL OR e."userId" NOT IN (SELECT id FROM "User" WHERE role = 'ADMIN' OR "isDemo" = true))
  ${r.from ? Prisma.sql`AND e."createdAt" >= ${r.from}` : Prisma.empty}
  ${r.to ? Prisma.sql`AND e."createdAt" < ${r.to}` : Prisma.empty}`;

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
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};
export const toCsv = (header: string[], rows: unknown[][]) =>
  '﻿' +
  [
    header.map(csvCell).join(','),
    ...rows.map((r) => r.map(csvCell).join(',')),
  ].join('\n');

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private realUser(r: Range = {}): Prisma.UserWhereInput {
    return {
      role: 'USER',
      isDemo: false,
      createdAt: { gte: r.from, lt: r.to },
    };
  }

  private realTrip(r: Range = {}): Prisma.TripWhereInput {
    return {
      isDemo: false,
      user: { role: 'USER', isDemo: false },
      createdAt: { gte: r.from, lt: r.to },
    };
  }

  private realPayment(
    r: Range = {},
    dateField: 'createdAt' | 'verifiedAt' = 'createdAt',
  ): Prisma.PaymentWhereInput {
    return {
      trip: { isDemo: false },
      user: { isDemo: false },
      [dateField]: { gte: r.from, lt: r.to },
    };
  }

  async metrics(r: Range) {
    const [
      byEvent,
      funnelRows,
      daily,
      users,
      verified,
      trips,
      docs,
      bookings,
      vaults,
      plans,
      payments,
      revenue,
      passes,
    ] = await Promise.all([
      this.prisma.$queryRaw<
        { name: string; people: bigint; total: bigint; anon: bigint }[]
      >`
          SELECT name, COUNT(DISTINCT COALESCE(e."userId", e."anonId")) AS people, COUNT(*) AS total,
                 COUNT(DISTINCT e."anonId") AS anon
          FROM "Event" e WHERE ${realEvents(r)} GROUP BY name`,
      Promise.all(
        FUNNEL.map(
          (s) =>
            this.prisma.$queryRaw<{ n: bigint }[]>`
              SELECT COUNT(DISTINCT COALESCE(e."userId", e."anonId")) AS n FROM "Event" e
              WHERE ${realEvents(r)} AND e.name IN (${Prisma.join(s.events)})`,
        ),
      ),
      this.prisma.$queryRaw<{ day: Date; name: string; n: bigint }[]>`
          SELECT date_trunc('day', e."createdAt") AS day, e.name, COUNT(DISTINCT COALESCE(e."userId", e."anonId")) AS n
          FROM "Event" e
          WHERE ${realEvents({ from: r.from ?? new Date(Date.now() - 30 * 86_400_000), to: r.to })}
            AND e.name IN ('page_view', 'signup_completed', 'trip_created', 'checkout_viewed', 'payment_approved')
          GROUP BY 1, 2 ORDER BY 1`,
      this.prisma.user.count({ where: this.realUser(r) }),
      this.prisma.user.count({
        where: { ...this.realUser(r), emailVerifiedAt: { not: null } },
      }),
      this.prisma.trip.count({ where: this.realTrip(r) }),
      this.prisma.vaultDocument.count({
        where: { trip: this.realTrip(), createdAt: { gte: r.from, lt: r.to } },
      }),
      this.prisma.booking.count({
        where: { trip: this.realTrip(), createdAt: { gte: r.from, lt: r.to } },
      }),
      this.prisma.trip.count({
        where: {
          ...this.realTrip(),
          documents: { some: { createdAt: { gte: r.from, lt: r.to } } },
        },
      }),
      this.prisma.savingsPlan.count({
        where: { trip: this.realTrip(), createdAt: { gte: r.from, lt: r.to } },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: true,
        where: this.realPayment(r),
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { ...this.realPayment(r, 'verifiedAt'), status: 'approved' },
      }),
      this.prisma.pass.count({
        where: { status: 'active', trip: { isDemo: false } },
      }),
    ]);

    const ev = Object.fromEntries(
      byEvent.map((e) => [
        e.name,
        {
          people: Number(e.people),
          total: Number(e.total),
          anon: Number(e.anon),
        },
      ]),
    );
    const status = Object.fromEntries(
      payments.map((p) => [p.status, p._count]),
    ) as Record<string, number>;
    const funnel = FUNNEL.map((s, i) => ({
      key: s.key,
      label: s.label,
      value: Number(funnelRows[i][0]?.n ?? 0),
    }));
    const withRates = funnel.map((s, i) => ({
      ...s,
      fromPrevious: i === 0 ? 100 : pct(s.value, funnel[i - 1].value),
      fromStart: pct(s.value, funnel[0].value),
    }));

    const dailyMap: Record<string, Record<string, number | string>> = {};
    for (const row of daily) {
      const key = row.day.toISOString().slice(0, 10);
      dailyMap[key] ??= { day: key };
      dailyMap[key][row.name] = Number(row.n);
    }

    return {
      kpis: {
        visits: ev.page_view?.total ?? 0,
        uniqueVisitors: ev.page_view?.anon ?? 0,
        users,
        verified,
        trips,
        vaultsUsed: vaults,
        documents: docs,
        bookings,
        savingsPlans: plans,
        checkouts: ev.checkout_viewed?.people ?? 0,
        wompiClicks: ev.wompi_redirected?.total ?? 0,
        paymentsApproved: revenue._count,
        paymentsPending:
          (status.pending ?? 0) + (status.pending_verification ?? 0),
        paymentsDeclined: (status.declined ?? 0) + (status.error ?? 0),
        passesActive: passes,
        revenue: revenue._sum.amount ?? 0,
        travelModeUsers: ev.travel_mode_opened?.people ?? 0,
        whatsappClicks: ev.whatsapp_click?.total ?? 0,
      },
      funnel: withRates,
      daily: Object.values(dailyMap),
      events: Object.entries(ev)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.total - a.total),
    };
  }

  async finance(r: Range) {
    const [approved, pending, declined, costs, monthly] = await Promise.all([
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { ...this.realPayment(r, 'verifiedAt'), status: 'approved' },
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          ...this.realPayment(r),
          status: { in: ['pending', 'pending_verification'] },
        },
      }),
      this.prisma.payment.count({
        where: {
          ...this.realPayment(r),
          status: { in: ['declined', 'error'] },
        },
      }),
      this.prisma.adminCost.findMany({
        where: { date: { gte: r.from, lt: r.to } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.$queryRaw<{ month: Date; revenue: bigint; sales: bigint }[]>`
        SELECT date_trunc('month', p."verifiedAt") AS month, SUM(p.amount) AS revenue, COUNT(*) AS sales
        FROM "Payment" p JOIN "Trip" t ON t.id = p."tripId" JOIN "User" u ON u.id = p."userId"
        WHERE p.status = 'approved' AND t."isDemo" = false AND u."isDemo" = false
        GROUP BY 1 ORDER BY 1`,
    ]);
    const revenue = approved._sum.amount ?? 0;
    const variable = costs
      .filter((c) => c.kind === 'variable')
      .reduce((s, c) => s + c.amount, 0);
    const fixed = costs
      .filter((c) => c.kind === 'fijo')
      .reduce((s, c) => s + c.amount, 0);
    const byCategory = Object.entries(
      costs.reduce<Record<string, number>>(
        (acc, c) => ({
          ...acc,
          [c.category]: (acc[c.category] ?? 0) + c.amount,
        }),
        {},
      ),
    ).map(([category, amount]) => ({ category, amount }));
    return {
      revenue,
      sales: approved._count,
      avgTicket: approved._count ? Math.round(revenue / approved._count) : 0,
      pendingCount: pending._count,
      pendingAmount: pending._sum.amount ?? 0,
      declinedCount: declined,
      variableCosts: variable,
      fixedCosts: fixed,
      contributionMargin: revenue - variable,
      operatingResult: revenue - variable - fixed,
      costsByCategory: byCategory,
      costs,
      monthly: monthly.map((m) => ({
        month: m.month.toISOString().slice(0, 7),
        revenue: Number(m.revenue),
        sales: Number(m.sales),
      })),
    };
  }

  users() {
    return this.prisma.user
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isDemo: true,
          emailVerifiedAt: true,
          utmSource: true,
          createdAt: true,
          _count: {
            select: {
              trips: true,
              payments: { where: { status: 'approved' } },
            },
          },
        },
      })
      .then((list) =>
        list.map(({ _count, ...u }) => ({
          ...u,
          trips: _count.trips,
          paidPasses: _count.payments,
        })),
      );
  }

  trips() {
    return this.prisma.trip
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          pass: { select: { status: true } },
          savingsPlan: {
            select: {
              targetAmount: true,
              initialSaved: true,
              contributions: { select: { amount: true } },
            },
          },
          _count: {
            select: {
              bookings: true,
              documents: true,
              items: true,
              expenses: true,
            },
          },
        },
      })
      .then((list) =>
        list.map((t) => {
          const saved = t.savingsPlan
            ? t.savingsPlan.initialSaved +
              t.savingsPlan.contributions.reduce((s, c) => s + c.amount, 0)
            : null;
          return {
            id: t.id,
            title: t.title,
            mode: t.mode,
            destination: `${t.destinationCity}, ${t.destinationCountry}`,
            startDate: t.startDate,
            endDate: t.endDate,
            travelerCount: t.travelerCount,
            budgetAmount: t.budgetAmount,
            isDemo: t.isDemo,
            user: t.user,
            pass: t.isDemo ? 'demo' : (t.pass?.status ?? 'none'),
            savingsProgress:
              t.savingsPlan && saved != null
                ? Math.min(
                    100,
                    Math.round((saved / t.savingsPlan.targetAmount) * 100),
                  )
                : null,
            counts: t._count,
            createdAt: t.createdAt,
          };
        }),
      );
  }

  payments() {
    return this.prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            isDemo: true,
          },
        },
        trip: { select: { id: true, title: true, isDemo: true } },
      },
    });
  }

  feedback() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  }

  messages() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  }

  // ── Exportaciones CSV (sin contraseñas ni tokens) ─────────────────────

  async exportCsv(entity: string) {
    if (entity === 'usuarios') {
      const rows = await this.users();
      return toCsv(
        [
          'id',
          'nombre',
          'apellido',
          'correo',
          'rol',
          'demo',
          'correo_verificado',
          'fuente',
          'viajes',
          'pass_pagados',
          'creado',
        ],
        rows.map((u) => [
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.role,
          u.isDemo,
          u.emailVerifiedAt,
          u.utmSource,
          u.trips,
          u.paidPasses,
          u.createdAt,
        ]),
      );
    }
    if (entity === 'viajes') {
      const rows = await this.trips();
      return toCsv(
        [
          'id',
          'titulo',
          'modo',
          'destino',
          'salida',
          'regreso',
          'viajeros',
          'presupuesto',
          'demo',
          'correo',
          'pass',
          'ahorro_pct',
          'reservas',
          'documentos',
          'actividades',
          'creado',
        ],
        rows.map((t) => [
          t.id,
          t.title,
          t.mode,
          t.destination,
          t.startDate,
          t.endDate,
          t.travelerCount,
          t.budgetAmount,
          t.isDemo,
          t.user.email,
          t.pass,
          t.savingsProgress,
          t.counts.bookings,
          t.counts.documents,
          t.counts.items,
          t.createdAt,
        ]),
      );
    }
    if (entity === 'pagos') {
      const rows = await this.payments();
      return toCsv(
        [
          'referencia',
          'estado',
          'valor',
          'moneda',
          'correo',
          'viaje',
          'verificado_por',
          'verificado',
          'tx_wompi',
          'creado',
        ],
        rows.map((p) => [
          p.reference,
          p.status,
          p.amount,
          p.currency,
          p.user.email,
          p.trip.title,
          p.verifiedVia,
          p.verifiedAt,
          p.providerTxId,
          p.createdAt,
        ]),
      );
    }
    if (entity === 'finanzas') {
      const rows = await this.prisma.adminCost.findMany({
        orderBy: { date: 'asc' },
      });
      return toCsv(
        ['fecha', 'categoria', 'tipo', 'valor', 'descripcion'],
        rows.map((c) => [c.date, c.category, c.kind, c.amount, c.description]),
      );
    }
    const events = await this.prisma.event.findMany({
      orderBy: { createdAt: 'asc' },
      take: 50_000,
    });
    return toCsv(
      ['fecha', 'evento', 'usuario', 'viaje', 'anonimo', 'demo', 'props'],
      events.map((e) => [
        e.createdAt,
        e.name,
        e.userId,
        e.tripId,
        e.anonId,
        e.isDemo,
        e.props,
      ]),
    );
  }
}
