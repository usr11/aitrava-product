import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Pasos del embudo: evento → etiqueta que se muestra en el dashboard. */
export const FUNNEL = [
  ['page_view', 'Visitantes'],
  ['signup', 'Registros'],
  ['quiz_start', 'Empezaron el quiz'],
  ['trip_generated', 'Viaje generado'],
  ['checkout_view', 'Vieron el checkout'],
  ['reservation', 'Reservaron'],
  ['reveal', 'Abrieron el sobre'],
] as const;

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private async distinctByEvent() {
    const rows = await this.prisma.$queryRaw<
      { name: string; people: bigint; total: bigint }[]
    >`
      SELECT name, COUNT(DISTINCT COALESCE("userId", "anonId")) AS people, COUNT(*) AS total
      FROM "Event" GROUP BY name`;
    return Object.fromEntries(
      rows.map((r) => [
        r.name,
        { people: Number(r.people), total: Number(r.total) },
      ]),
    );
  }

  async metrics() {
    const [users, trips, feedback, byEvent, daily, quizSteps, referred, utm] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'USER' } }),
        this.prisma.trip.findMany({
          include: { destination: true, guesses: true },
        }),
        this.prisma.feedback.findMany(),
        this.distinctByEvent(),
        this.prisma.$queryRaw<{ day: Date; name: string; n: bigint }[]>`
        SELECT date_trunc('day', "createdAt") AS day, name, COUNT(DISTINCT COALESCE("userId", "anonId")) AS n
        FROM "Event"
        WHERE "createdAt" > now() - interval '30 days'
          AND name IN ('page_view', 'signup', 'trip_generated', 'reservation')
        GROUP BY 1, 2 ORDER BY 1`,
        this.prisma.$queryRaw<{ step: string; n: bigint }[]>`
        SELECT props->>'step' AS step, COUNT(DISTINCT COALESCE("userId", "anonId")) AS n
        FROM "Event" WHERE name = 'quiz_step' GROUP BY 1 ORDER BY 1`,
        this.prisma.user.count({ where: { referredBy: { not: null } } }),
        this.prisma.user.groupBy({
          by: ['utmSource'],
          _count: true,
          where: { role: 'USER' },
        }),
      ]);

    const reserved = trips.filter((t) => t.status !== 'GENERATED');
    const revealed = trips.filter(
      (t) => t.status === 'REVEALED' || t.status === 'COMPLETED',
    );
    const nps = feedback.filter((f) => f.kind === 'nps' && f.score != null);
    const promoters = nps.filter((f) => f.score! >= 9).length;
    const detractors = nps.filter((f) => f.score! <= 6).length;
    const widget = feedback.filter(
      (f) => f.kind === 'widget' && f.score != null,
    );

    const count = (items: string[]) =>
      Object.entries(
        items.reduce<Record<string, number>>(
          (acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }),
          {},
        ),
      )
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    const ownerGuesses = revealed
      .map((t) => [...t.guesses].reverse().find((g) => g.isOwner))
      .filter(Boolean);

    const dailyMap: Record<string, Record<string, number | string>> = {};
    for (const r of daily) {
      const key = r.day.toISOString().slice(0, 10);
      dailyMap[key] ??= { day: key };
      dailyMap[key][r.name] = Number(r.n);
    }

    const funnel = FUNNEL.map(([event, label]) => ({
      event,
      label,
      value: byEvent[event]?.people ?? 0,
    }));

    return {
      kpis: {
        users,
        trips: trips.length,
        reservations: reserved.length,
        reveals: revealed.length,
        revenue: reserved.reduce((s, t) => s + (t.amountPaid ?? 0), 0),
        tripToReservation: pct(reserved.length, trips.length),
        visitorToSignup: pct(
          byEvent.signup?.people ?? 0,
          byEvent.page_view?.people ?? 0,
        ),
        nps: nps.length
          ? Math.round(((promoters - detractors) / nps.length) * 100)
          : null,
        npsResponses: nps.length,
        widgetAvg: widget.length
          ? Math.round(
              (widget.reduce((s, f) => s + f.score!, 0) / widget.length) * 10,
            ) / 10
          : null,
        referred,
        friendGuesses: byEvent.friend_guess?.total ?? 0,
        shares: byEvent.share?.total ?? 0,
        guessAccuracy: pct(
          ownerGuesses.filter((g) => g!.correct).length,
          ownerGuesses.length,
        ),
        aiShare: pct(trips.filter((t) => t.aiGenerated).length, trips.length),
        extraClues: byEvent.extra_clue?.total ?? 0,
        rerolls: byEvent.trip_reroll?.total ?? 0,
        gifts: trips.filter((t) => t.isGift).length,
      },
      funnel,
      daily: Object.values(dailyMap),
      quizSteps: quizSteps.map((q) => ({
        label: `Paso ${q.step}`,
        value: Number(q.n),
      })),
      topVibes: count(
        trips.flatMap(
          (t) => (t.preferences as { vibes?: string[] }).vibes ?? [],
        ),
      ).slice(0, 8),
      topAvoid: count(
        trips.flatMap(
          (t) => (t.preferences as { avoid?: string[] }).avoid ?? [],
        ),
      ).slice(0, 6),
      topDestinations: count(trips.map((t) => t.destination.name)).slice(0, 8),
      plans: count(reserved.map((t) => t.plan ?? 'basico')),
      utm: utm
        .map((u) => ({ label: u.utmSource ?? 'directo', value: u._count }))
        .sort((a, b) => b.value - a.value),
      budgets: count(
        trips.map((t) => {
          const pp = t.budgetTotal / t.travelers;
          return pp < 800_000
            ? '< $800k'
            : pp < 1_500_000
              ? '$800k–1,5M'
              : pp < 2_500_000
                ? '$1,5M–2,5M'
                : '> $2,5M';
        }),
      ),
    };
  }

  feedback() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  }

  users() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true,
        referredBy: true,
        utmSource: true,
        createdAt: true,
        _count: { select: { trips: true } },
      },
    });
  }

  async eventsCsv() {
    const events = await this.prisma.event.findMany({
      orderBy: { createdAt: 'asc' },
    });
    const esc = (v: string | null) => `"${(v ?? '').replace(/"/g, '""')}"`;
    return [
      'fecha,evento,usuario,anonimo,props',
      ...events.map((e) =>
        [
          e.createdAt.toISOString(),
          e.name,
          e.userId,
          e.anonId,
          JSON.stringify(e.props ?? {}),
        ]
          .map(esc)
          .join(','),
      ),
    ].join('\n');
  }
}
