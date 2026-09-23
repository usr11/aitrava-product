import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Clue, Destination, Guess, Trip, User } from '@prisma/client';
import {
  DEMO_CLUE_SECONDS,
  DEMO_REVEAL_SECONDS,
  isDemoMode,
} from '../common/config';
import { EngineService } from '../engine/engine.service';
import {
  Booking,
  computeBreakdown,
  depositFor,
  partnerCommissionOf,
  MAX_REROLLS,
  TravelDna,
  TripPreferences,
} from '../engine/types';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateTripDto } from './trips.dto';

type FullTrip = Trip & {
  destination: Destination;
  clues: Clue[];
  guesses: Guess[];
  user: User;
};

const include = {
  destination: true,
  clues: { orderBy: { order: 'asc' } },
  guesses: { orderBy: { createdAt: 'asc' } },
  user: true,
} as const;

const makeCode = () =>
  Array.from(
    { length: 6 },
    () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)],
  ).join('');

/** Reparte las pistas entre `from` y `revealAt`; la primera queda desbloqueada de una. */
const schedule = (count: number, from: Date, revealAt: Date) => {
  const step = Math.max(0, revealAt.getTime() - from.getTime()) / count;
  return Array.from(
    { length: count },
    (_, i) => new Date(from.getTime() + i * step),
  );
};

const defaultRevealAt = (startDate: Date) => {
  const dayBefore = new Date(startDate.getTime() - 86_400_000);
  const min = new Date(Date.now() + 10 * 60_000);
  return dayBefore > min ? dayBefore : min;
};

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private engine: EngineService,
    private events: EventsService,
  ) {}

  // ---------- Serialización: el destino jamás sale antes de revelar ----------

  private isRevealed(t: Trip) {
    return t.status === 'REVEALED' || t.status === 'COMPLETED';
  }

  private clueView(t: Trip, clues: Clue[]) {
    const now = Date.now();
    const active = t.status !== 'GENERATED';
    return clues.map((c) => {
      const unlocked =
        this.isRevealed(t) || (active && c.unlockAt.getTime() <= now);
      return {
        order: c.order,
        type: c.type,
        unlockAt: c.unlockAt,
        locked: !unlocked,
        text: unlocked ? c.text : null,
      };
    });
  }

  private destinationView(d: Destination) {
    return {
      slug: d.slug,
      name: d.name,
      region: d.region,
      imageUrl: d.imageUrl,
      description: d.description,
    };
  }

  toOwnerView(t: FullTrip) {
    const revealed = this.isRevealed(t);
    const ownerGuess = [...t.guesses].reverse().find((g) => g.isOwner) ?? null;
    return {
      id: t.id,
      status: t.status,
      originCity: t.originCity,
      startDate: t.startDate,
      endDate: t.endDate,
      travelers: t.travelers,
      budgetTotal: t.budgetTotal,
      breakdown: t.breakdown,
      amountPaid: t.amountPaid,
      vibes: t.vibes,
      isGift: t.isGift,
      giftTo: t.giftTo,
      giftMessage: t.giftMessage,
      shareCode: t.shareCode,
      revealAt: t.revealAt,
      canReveal: t.status === 'RESERVED' && t.revealAt.getTime() <= Date.now(),
      rerolls: t.rerolls,
      maxRerolls: MAX_REROLLS,
      aiGenerated: t.aiGenerated,
      clues: this.clueView(t, t.clues),
      ownerGuess: ownerGuess
        ? {
            destination: ownerGuess.destination,
            correct: revealed ? ownerGuess.correct : null,
          }
        : null,
      friendGuesses: t.guesses
        .filter((g) => !g.isOwner)
        .map((g) => ({
          name: g.guesserName,
          destination: revealed ? g.destination : null,
          correct: revealed ? g.correct : null,
        })),
      destination: revealed ? this.destinationView(t.destination) : null,
      itinerary: revealed ? t.itinerary : null,
      booking: revealed ? t.booking : null,
      aiReason: revealed ? t.aiReason : null,
      createdAt: t.createdAt,
    };
  }

  private toPublicView(t: FullTrip) {
    const revealed = this.isRevealed(t);
    return {
      ownerName: t.user.name.split(' ')[0],
      status: t.status,
      isGift: t.isGift,
      giftTo: t.giftTo,
      giftMessage: t.giftMessage,
      startDate: t.startDate,
      travelers: t.travelers,
      vibes: t.vibes,
      revealAt: t.revealAt,
      clues: this.clueView(t, t.clues),
      guesses: t.guesses.map((g) => ({
        name: g.guesserName,
        isOwner: g.isOwner,
        destination: revealed ? g.destination : null,
        correct: revealed ? g.correct : null,
      })),
      destination: revealed ? this.destinationView(t.destination) : null,
      referralCode: t.user.referralCode,
    };
  }

  // ---------- Consultas ----------

  private async findOwned(id: string, userId: string) {
    const trip = await this.prisma.trip.findUnique({ where: { id }, include });
    if (!trip) throw new NotFoundException('Viaje no encontrado');
    if (trip.userId !== userId) throw new ForbiddenException();
    return trip;
  }

  private async findByCode(code: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { shareCode: code.toUpperCase() },
      include,
    });
    if (!trip) throw new NotFoundException('Este link no existe');
    return trip;
  }

  async get(id: string, userId: string) {
    return this.toOwnerView(await this.findOwned(id, userId));
  }

  async list(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      include,
      orderBy: { createdAt: 'desc' },
    });
    return trips.map((t) => this.toOwnerView(t));
  }

  async share(code: string) {
    return this.toPublicView(await this.findByCode(code));
  }

  destinations() {
    return this.prisma.destination.findMany({
      select: { slug: true, name: true, region: true },
      orderBy: { name: 'asc' },
    });
  }

  // ---------- Acciones ----------

  async generate(userId: string, dto: GenerateTripDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const prefs: TripPreferences = { ...dto, excluded: [] };
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (end <= start)
      throw new BadRequestException(
        'La fecha de regreso debe ser después de la salida',
      );

    const plan = await this.engine.plan(
      prefs,
      user.travelDna as TravelDna | null,
    );
    const revealAt = defaultRevealAt(start);
    const times = schedule(plan.clues.length, new Date(), revealAt);

    const trip = await this.prisma.trip.create({
      data: {
        userId,
        originCity: dto.originCity,
        startDate: start,
        endDate: end,
        travelers: dto.travelers,
        budgetTotal: dto.budgetTotal,
        preferences: prefs,
        destinationId: plan.destinationId,
        aiReason: plan.reason,
        aiGenerated: plan.aiGenerated,
        vibes: plan.vibes,
        itinerary: plan.itinerary,
        booking: plan.booking,
        breakdown: computeBreakdown(dto.budgetTotal),
        isGift: !!dto.isGift,
        giftTo: dto.giftTo,
        giftMessage: dto.giftMessage,
        shareCode: makeCode(),
        revealAt,
        clues: {
          create: plan.clues.map((c, i) => ({
            order: i + 1,
            type: c.type,
            text: c.text,
            unlockAt: times[i],
          })),
        },
      },
    });

    // ADN viajero: acumula los gustos elegidos.
    const dna: TravelDna = (user.travelDna as TravelDna | null) ?? {
      tagCounts: {},
      visited: [],
    };
    for (const v of dto.vibes) dna.tagCounts[v] = (dna.tagCounts[v] ?? 0) + 1;
    await this.prisma.user.update({
      where: { id: userId },
      data: { travelDna: dna },
    });

    await this.events.log('trip_generated', userId, {
      tripId: trip.id,
      aiGenerated: plan.aiGenerated,
      budget: dto.budgetTotal,
      travelers: dto.travelers,
      vibes: dto.vibes,
      isGift: !!dto.isGift,
    });
    return { id: trip.id };
  }

  async reroll(id: string, userId: string) {
    const trip = await this.findOwned(id, userId);
    if (trip.status !== 'GENERATED')
      throw new BadRequestException('Solo puedes re-sortear antes de reservar');
    if (trip.rerolls >= MAX_REROLLS)
      throw new BadRequestException(
        `Máximo ${MAX_REROLLS} re-sorteos por viaje`,
      );
    const prefs = trip.preferences as unknown as TripPreferences;
    prefs.excluded = [...(prefs.excluded ?? []), trip.destination.slug];

    const plan = await this.engine.plan(
      prefs,
      trip.user.travelDna as TravelDna | null,
    );
    const times = schedule(plan.clues.length, new Date(), trip.revealAt);
    await this.prisma.clue.deleteMany({ where: { tripId: id } });
    await this.prisma.trip.update({
      where: { id },
      data: {
        preferences: prefs,
        destinationId: plan.destinationId,
        aiReason: plan.reason,
        aiGenerated: plan.aiGenerated,
        vibes: plan.vibes,
        itinerary: plan.itinerary,
        booking: plan.booking,
        rerolls: { increment: 1 },
        clues: {
          create: plan.clues.map((c, i) => ({
            order: i + 1,
            type: c.type,
            text: c.text,
            unlockAt: times[i],
          })),
        },
      },
    });
    await this.events.log('trip_reroll', userId, {
      tripId: id,
      number: trip.rerolls + 1,
    });
    return this.get(id, userId);
  }

  async reserve(id: string, userId: string, deposit = false) {
    const trip = await this.findOwned(id, userId);
    if (trip.status !== 'GENERATED')
      throw new BadRequestException('Este viaje ya está reservado');

    const breakdown = computeBreakdown(trip.budgetTotal);
    const now = new Date();
    const demo = isDemoMode();
    const revealAt = demo
      ? new Date(now.getTime() + DEMO_REVEAL_SECONDS * 1000)
      : trip.revealAt;
    const times = demo
      ? trip.clues.map(
          (_, i) => new Date(now.getTime() + i * DEMO_CLUE_SECONDS * 1000),
        )
      : schedule(trip.clues.length, now, revealAt);

    await this.prisma.$transaction([
      ...trip.clues.map((c, i) =>
        this.prisma.clue.update({
          where: { id: c.id },
          data: { unlockAt: times[i] },
        }),
      ),
      this.prisma.trip.update({
        where: { id },
        data: {
          status: 'RESERVED',
          breakdown,
          amountPaid: deposit ? depositFor(breakdown.total) : breakdown.total,
          partnerCommission: partnerCommissionOf(
            trip.booking as unknown as Booking,
          ),
          reservedAt: now,
          revealAt,
        },
      }),
    ]);
    await this.events.log('reservation', userId, {
      tripId: id,
      deposit,
      commission: breakdown.comision,
      amount: deposit ? depositFor(breakdown.total) : breakdown.total,
      partnerCommission: partnerCommissionOf(
        trip.booking as unknown as Booking,
      ),
    });
    return this.get(id, userId);
  }

  async guess(id: string, userId: string, slug: string) {
    const trip = await this.findOwned(id, userId);
    if (this.isRevealed(trip))
      throw new BadRequestException('El destino ya fue revelado');
    await this.prisma.guess.create({
      data: {
        tripId: id,
        guesserName: trip.user.name,
        isOwner: true,
        destination: slug,
        correct: slug === trip.destination.slug,
      },
    });
    await this.events.log('guess', userId, { tripId: id });
    return this.get(id, userId);
  }

  async reveal(id: string, userId: string) {
    const trip = await this.findOwned(id, userId);
    if (this.isRevealed(trip)) return this.toOwnerView(trip);
    if (trip.status !== 'RESERVED')
      throw new BadRequestException('Primero reserva tu viaje');
    if (trip.revealAt.getTime() > Date.now())
      throw new BadRequestException('Todavía no es momento de abrir el sobre');

    await this.prisma.trip.update({
      where: { id },
      data: { status: 'REVEALED', revealedAt: new Date() },
    });
    const dna: TravelDna = (trip.user.travelDna as TravelDna | null) ?? {
      tagCounts: {},
      visited: [],
    };
    dna.visited = [...new Set([...(dna.visited ?? []), trip.destination.slug])];
    await this.prisma.user.update({
      where: { id: userId },
      data: { travelDna: dna },
    });

    const ownerGuess = [...trip.guesses].reverse().find((g) => g.isOwner);
    await this.events.log('reveal', userId, {
      tripId: id,
      guessed: !!ownerGuess,
      correct: ownerGuess?.correct ?? false,
    });
    return this.get(id, userId);
  }

  /** Solo en modo demo: desbloquea todas las pistas y deja el sobre listo para abrir (para la presentación). */
  async demoSkip(id: string, userId: string) {
    if (!isDemoMode())
      throw new ForbiddenException('Solo disponible en modo demo');
    const trip = await this.findOwned(id, userId);
    if (trip.status !== 'RESERVED')
      throw new BadRequestException('Primero reserva tu viaje');
    const now = new Date();
    await this.prisma.clue.updateMany({
      where: { tripId: id, unlockAt: { gt: now } },
      data: { unlockAt: now },
    });
    await this.prisma.trip.update({ where: { id }, data: { revealAt: now } });
    return this.get(id, userId);
  }

  async friendGuess(code: string, name: string, slug: string, anonId?: string) {
    const trip = await this.findByCode(code);
    if (this.isRevealed(trip))
      throw new BadRequestException('El destino ya fue revelado');
    await this.prisma.guess.create({
      data: {
        tripId: trip.id,
        guesserName: name.trim(),
        isOwner: false,
        destination: slug,
        correct: slug === trip.destination.slug,
      },
    });
    await this.events.log('friend_guess', null, { tripId: trip.id }, anonId);
    return this.toPublicView(await this.findByCode(code));
  }
}
