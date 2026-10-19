import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hasPass, ownTrip } from '../common/access';
import { FREE_LIMITS } from '../common/config';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BOOKING_TO_BUDGET,
  BUDGET_CATEGORIES,
  BudgetByCategory,
  BudgetCategory,
  computePlan,
  splitBudget,
  startOfDay,
} from '../savings/plan';
import {
  BookingDto,
  BookingPatchDto,
  CreateTripDto,
  ExpenseDto,
  ItemDto,
  ItemPatchDto,
  SuggestQueryDto,
  UpdateTripDto,
} from './trips.dto';

const DAY = 86_400_000;

const ITEM_TO_BUDGET: Record<string, BudgetCategory> = {
  actividad: 'actividades',
  restaurante: 'comida',
  comida: 'comida',
  transporte: 'transporte',
  alojamiento: 'alojamiento',
};

const CHECKLIST: { key: string; label: string }[] = [
  { key: 'vuelo', label: 'Vuelo' },
  { key: 'alojamiento', label: 'Hotel' },
  { key: 'seguro', label: 'Seguro' },
  { key: 'transporte', label: 'Transporte' },
  { key: 'actividad', label: 'Actividades' },
  { key: 'documentos', label: 'Documentos' },
  { key: 'restaurante', label: 'Restaurantes' },
  { key: 'ahorro', label: 'Plan de ahorro cumplido' },
];

const TAG_LABELS: Record<string, string> = {
  playa: 'playa',
  montana: 'montaña',
  comida: 'buena comida',
  fiesta: 'vida nocturna',
  cultura: 'cultura e historia',
  naturaleza: 'naturaleza',
  silencio: 'desconexión',
  aventura: 'aventura',
  cafe: 'café',
  pueblo: 'pueblos',
};

const date = (s?: string | null) =>
  s ? new Date(s) : s === null ? null : undefined;

const fullInclude = {
  pass: true,
  items: { orderBy: { startAt: 'asc' } },
  bookings: { orderBy: [{ startAt: 'asc' }, { createdAt: 'asc' }] },
  documents: {
    select: {
      id: true,
      category: true,
      title: true,
      fileName: true,
      mimeType: true,
      size: true,
      bookingId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  },
  expenses: { orderBy: { date: 'desc' } },
  savingsPlan: { include: { contributions: { orderBy: { date: 'desc' } } } },
} satisfies Prisma.TripInclude;

type FullTrip = Prisma.TripGetPayload<{ include: typeof fullInclude }>;

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  // ── Lectura ───────────────────────────────────────────────────────────

  private phase(trip: { startDate: Date; endDate: Date }, now = new Date()) {
    const today = startOfDay(now).getTime();
    const start = startOfDay(trip.startDate).getTime();
    const end = startOfDay(trip.endDate).getTime();
    const totalDays = Math.round((end - start) / DAY) + 1;
    if (today < start)
      return {
        phase: 'planning' as const,
        daysToTrip: Math.round((start - today) / DAY),
        dayOfTrip: null,
        totalDays,
      };
    if (today > end)
      return {
        phase: 'finished' as const,
        daysToTrip: 0,
        dayOfTrip: null,
        totalDays,
      };
    return {
      phase: 'active' as const,
      daysToTrip: 0,
      dayOfTrip: Math.round((today - start) / DAY) + 1,
      totalDays,
    };
  }

  private budget(trip: FullTrip) {
    const plan = splitBudget(
      trip.budgetAmount,
      trip.budgetByCategory as BudgetByCategory | null,
    );
    const estimated = Object.fromEntries(
      BUDGET_CATEGORIES.map((c) => [c, 0]),
    ) as Record<BudgetCategory, number>;
    const spent = { ...estimated };
    for (const b of trip.bookings) {
      const c = BOOKING_TO_BUDGET[b.category] ?? 'otros';
      estimated[c] += b.cost ?? 0;
      if (b.isPaid) spent[c] += b.cost ?? 0; // reserva pagada = gasto confirmado
    }
    for (const it of trip.items) {
      if (it.bookingId || it.status === 'cancelled') continue; // ya contado en la reserva
      estimated[ITEM_TO_BUDGET[it.type] ?? 'otros'] += it.estimatedCost ?? 0;
    }
    for (const e of trip.expenses)
      spent[(e.category as BudgetCategory) ?? 'otros'] += e.amount;
    const sum = (o: Record<string, number>) =>
      Object.values(o).reduce((s, v) => s + v, 0);
    return {
      total: trip.budgetAmount,
      detailed: !!trip.budgetByCategory,
      categories: BUDGET_CATEGORIES.map((c) => ({
        key: c,
        budget: plan[c],
        estimated: estimated[c],
        spent: spent[c],
      })),
      estimated: sum(estimated),
      spent: sum(spent),
      remaining: trip.budgetAmount - sum(spent),
      unassigned: trip.budgetAmount - sum(estimated),
    };
  }

  private savings(trip: FullTrip) {
    const p = trip.savingsPlan;
    if (!p) return null;
    return {
      plan: {
        id: p.id,
        targetAmount: p.targetAmount,
        initialSaved: p.initialSaved,
        frequency: p.frequency,
        monthlyCapacity: p.monthlyCapacity,
        startDate: p.startDate,
        contributions: p.contributions.map((c) => ({
          id: c.id,
          amount: c.amount,
          date: c.date,
          note: c.note,
        })),
      },
      computed: computePlan(p, {
        startDate: trip.startDate,
        budgetAmount: trip.budgetAmount,
        budgetByCategory: trip.budgetByCategory as BudgetByCategory | null,
        bookings: trip.bookings,
      }),
    };
  }

  private checklist(trip: FullTrip, savingsDone: boolean) {
    const cats = new Set(trip.bookings.map((b) => b.category));
    const items = CHECKLIST.map(({ key, label }) => ({
      key,
      label,
      done:
        key === 'documentos'
          ? trip.documents.length > 0
          : key === 'ahorro'
            ? savingsDone
            : cats.has(key),
    }));
    return {
      items,
      percent: Math.round(
        (items.filter((i) => i.done).length / items.length) * 100,
      ),
    };
  }

  private shape(trip: FullTrip) {
    const savings = this.savings(trip);
    const pass = hasPass(trip);
    return {
      id: trip.id,
      title: trip.title,
      mode: trip.mode,
      destinationCity: trip.destinationCity,
      destinationCountry: trip.destinationCountry,
      originCity: trip.originCity,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelerCount: trip.travelerCount,
      budgetAmount: trip.budgetAmount,
      budgetByCategory: trip.budgetByCategory,
      currency: trip.currency,
      preferences: trip.preferences,
      isDemo: trip.isDemo,
      createdAt: trip.createdAt,
      ...this.phase(trip),
      hasPass: pass,
      passStatus: trip.isDemo ? 'demo' : (trip.pass?.status ?? 'none'),
      readiness: this.checklist(
        trip,
        savings ? savings.computed.saved >= savings.computed.target : false,
      ),
      items: trip.items,
      bookings: trip.bookings,
      documents: trip.documents,
      expenses: trip.expenses,
      budget: this.budget(trip),
      savings,
      limits: {
        vaultDocuments: pass ? null : FREE_LIMITS.vaultDocumentsPerTrip,
      },
    };
  }

  async list(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { userId },
      include: fullInclude,
      orderBy: { startDate: 'asc' },
    });
    return trips.map((t) => {
      const s = this.shape(t);
      return {
        id: s.id,
        title: s.title,
        destinationCity: s.destinationCity,
        destinationCountry: s.destinationCountry,
        startDate: s.startDate,
        endDate: s.endDate,
        travelerCount: s.travelerCount,
        isDemo: s.isDemo,
        phase: s.phase,
        daysToTrip: s.daysToTrip,
        dayOfTrip: s.dayOfTrip,
        totalDays: s.totalDays,
        hasPass: s.hasPass,
        readiness: s.readiness.percent,
        savings: s.savings
          ? {
              progress: s.savings.computed.progress,
              saved: s.savings.computed.saved,
              target: s.savings.computed.target,
              status: s.savings.computed.status,
            }
          : null,
      };
    });
  }

  async get(userId: string, id: string) {
    await ownTrip(this.prisma, userId, id);
    const trip = await this.prisma.trip.findUniqueOrThrow({
      where: { id },
      include: fullInclude,
    });
    return this.shape(trip);
  }

  // ── Crear / editar ────────────────────────────────────────────────────

  async create(userId: string, dto: CreateTripDto) {
    const start = startOfDay(new Date(dto.startDate));
    const end = startOfDay(new Date(dto.endDate));
    if (end < start)
      throw new BadRequestException(
        'La fecha de regreso debe ser después de la salida',
      );
    if ((end.getTime() - start.getTime()) / DAY > 120)
      throw new BadRequestException('El viaje puede durar máximo 120 días');
    const dest = dto.destinationSlug
      ? await this.prisma.destination.findUnique({
          where: { slug: dto.destinationSlug },
        })
      : null;

    const trip = await this.prisma.trip.create({
      data: {
        userId,
        mode: dto.mode,
        title: dto.title?.trim() || `Mi viaje a ${dto.destinationCity.trim()}`,
        destinationCity: dto.destinationCity.trim(),
        destinationCountry: dto.destinationCountry.trim(),
        originCity: dto.originCity.trim(),
        startDate: start,
        endDate: end,
        travelerCount: dto.travelerCount,
        budgetAmount: dto.budgetAmount,
        budgetByCategory: this.cleanBudget(dto.budgetByCategory),
        preferences: (dto.preferences ?? undefined) as Prisma.InputJsonValue,
      },
    });

    // "Ayúdame a elegir" / "Sorpresa": itinerario base sugerido (editable), del catálogo.
    if (dest && dto.prefillItinerary) {
      const days = Math.round((end.getTime() - start.getTime()) / DAY) + 1;
      const base = dest.itinerary as {
        day: number;
        title: string;
        items: string[];
      }[];
      const hours = [9 * 60, 12 * 60 + 30, 15 * 60 + 30, 19 * 60];
      const data: Prisma.ItineraryItemCreateManyInput[] = [];
      base.slice(0, days).forEach((d, i) =>
        d.items.slice(0, 4).forEach((title, j) =>
          data.push({
            tripId: trip.id,
            type: 'actividad',
            title,
            description: `Sugerencia para el día ${i + 1} (${d.title}). Edítala o bórrala.`,
            startAt: new Date(start.getTime() + i * DAY + hours[j] * 60_000),
            locationName: `${title}, ${dest.name}`,
          }),
        ),
      );
      if (data.length) await this.prisma.itineraryItem.createMany({ data });
    }

    await this.events.log(
      'trip_created',
      userId,
      { mode: dto.mode, international: dto.destinationCountry !== 'Colombia' },
      null,
      trip.id,
    );

    if (dto.savings) {
      await this.prisma.savingsPlan.create({
        data: {
          tripId: trip.id,
          targetAmount: dto.savings.targetAmount ?? dto.budgetAmount,
          initialSaved: dto.savings.initialSaved ?? 0,
          frequency: dto.savings.frequency ?? 'BIWEEKLY',
          monthlyCapacity: dto.savings.monthlyCapacity ?? null,
          startDate: startOfDay(new Date()),
        },
      });
      await this.events.log(
        'savings_goal_created',
        userId,
        { frequency: dto.savings.frequency ?? 'BIWEEKLY', fromWizard: true },
        null,
        trip.id,
      );
    }
    return this.get(userId, trip.id);
  }

  private cleanBudget(b?: Record<string, number>) {
    if (!b) return undefined;
    const out: Record<string, number> = {};
    for (const c of BUDGET_CATEGORIES) {
      const v = Number(b[c] ?? 0);
      if (!Number.isFinite(v) || v < 0)
        throw new BadRequestException('Revisa los valores del presupuesto');
      out[c] = Math.round(v);
    }
    return out;
  }

  async update(userId: string, id: string, dto: UpdateTripDto) {
    await ownTrip(this.prisma, userId, id);
    const { startDate, endDate, budgetByCategory, ...rest } = dto;
    await this.prisma.trip.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? startOfDay(new Date(startDate)) : undefined,
        endDate: endDate ? startOfDay(new Date(endDate)) : undefined,
        budgetByCategory: budgetByCategory
          ? this.cleanBudget(budgetByCategory)
          : undefined,
      },
    });
    const t = await this.prisma.trip.findUniqueOrThrow({ where: { id } });
    if (t.endDate < t.startDate) {
      await this.prisma.trip.update({
        where: { id },
        data: { endDate: t.startDate },
      });
    }
    return this.get(userId, id);
  }

  async remove(userId: string, id: string) {
    const trip = await ownTrip(this.prisma, userId, id);
    if (
      await this.prisma.payment.count({
        where: { tripId: id, status: 'approved' },
      })
    ) {
      throw new BadRequestException(
        'Este viaje tiene un AITRAVA Pass pagado. Escríbenos si necesitas eliminarlo.',
      );
    }
    await this.prisma.trip.delete({ where: { id: trip.id } });
    return { ok: true };
  }

  // ── Itinerario ────────────────────────────────────────────────────────

  private async ownBooking(tripId: string, bookingId?: string | null) {
    if (!bookingId) return null;
    const b = await this.prisma.booking.findFirst({
      where: { id: bookingId, tripId },
    });
    if (!b) throw new NotFoundException('No encontramos esa reserva');
    return b;
  }

  async addItem(userId: string, tripId: string, dto: ItemDto) {
    await ownTrip(this.prisma, userId, tripId);
    await this.ownBooking(tripId, dto.bookingId);
    return this.prisma.itineraryItem.create({
      data: {
        ...dto,
        tripId,
        startAt: new Date(dto.startAt),
        endAt: date(dto.endAt),
      },
    });
  }

  async updateItem(
    userId: string,
    tripId: string,
    itemId: string,
    dto: ItemPatchDto,
  ) {
    await ownTrip(this.prisma, userId, tripId);
    const item = await this.prisma.itineraryItem.findFirst({
      where: { id: itemId, tripId },
    });
    if (!item) throw new NotFoundException('No encontramos esa actividad');
    return this.prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        ...dto,
        startAt: date(dto.startAt) ?? undefined,
        endAt: date(dto.endAt),
      },
    });
  }

  async removeItem(userId: string, tripId: string, itemId: string) {
    await ownTrip(this.prisma, userId, tripId);
    const { count } = await this.prisma.itineraryItem.deleteMany({
      where: { id: itemId, tripId },
    });
    if (!count) throw new NotFoundException('No encontramos esa actividad');
    return { ok: true };
  }

  // ── Reservas (incluidas las compradas fuera de AITRAVA) ───────────────

  async addBooking(userId: string, tripId: string, dto: BookingDto) {
    await ownTrip(this.prisma, userId, tripId);
    const { addToItinerary, ...data } = dto;
    const booking = await this.prisma.booking.create({
      data: {
        ...data,
        tripId,
        startAt: date(data.startAt),
        endAt: date(data.endAt),
      },
    });
    if (addToItinerary && booking.startAt) {
      const type =
        { vuelo: 'transporte', seguro: 'otro', otro: 'otro' }[
          booking.category
        ] ?? booking.category;
      await this.prisma.itineraryItem.create({
        data: {
          tripId,
          bookingId: booking.id,
          type,
          title: booking.title,
          startAt: booking.startAt,
          endAt: booking.endAt,
          locationName: booking.address ?? booking.provider ?? undefined,
          address: booking.address,
        },
      });
    }
    await this.events.log(
      'external_booking_added',
      userId,
      { category: dto.category, withCost: dto.cost != null },
      null,
      tripId,
    );
    return booking;
  }

  async updateBooking(
    userId: string,
    tripId: string,
    bookingId: string,
    dto: BookingPatchDto,
  ) {
    await ownTrip(this.prisma, userId, tripId);
    await this.ownBooking(tripId, bookingId);
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { ...dto, startAt: date(dto.startAt), endAt: date(dto.endAt) },
    });
  }

  async removeBooking(userId: string, tripId: string, bookingId: string) {
    await ownTrip(this.prisma, userId, tripId);
    await this.ownBooking(tripId, bookingId);
    // Las actividades creadas desde esta reserva se van con ella.
    await this.prisma.itineraryItem.deleteMany({
      where: { tripId, bookingId },
    });
    await this.prisma.booking.delete({ where: { id: bookingId } });
    return { ok: true };
  }

  // ── Gastos ────────────────────────────────────────────────────────────

  async addExpense(userId: string, tripId: string, dto: ExpenseDto) {
    await ownTrip(this.prisma, userId, tripId);
    return this.prisma.expense.create({
      data: {
        tripId,
        amount: dto.amount,
        category: dto.category,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async removeExpense(userId: string, tripId: string, expenseId: string) {
    await ownTrip(this.prisma, userId, tripId);
    const { count } = await this.prisma.expense.deleteMany({
      where: { id: expenseId, tripId },
    });
    if (!count) throw new NotFoundException('No encontramos ese gasto');
    return { ok: true };
  }

  // ── Sugerencias: "Ayúdame a elegir" y "Destino sorpresa" ──────────────

  async destinations(featuredOnly: boolean) {
    const list = await this.prisma.destination.findMany({
      where: featuredOnly ? { featured: true } : undefined,
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    });
    // minBudgetPP es una referencia interna: no se publica como precio.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return list.map(({ minBudgetPP, ...d }) => d);
  }

  async suggest(q: SuggestQueryDto) {
    const likes = (q.likes ?? '').split(',').filter(Boolean);
    const avoid = (q.avoid ?? '').split(',').filter(Boolean);
    const travelers = q.travelers ?? 1;
    const nights = q.nights ?? 3;
    const scope = q.scope ?? 'todos';
    const all = await this.prisma.destination.findMany();
    const scored = all
      .filter((d) =>
        scope === 'colombia'
          ? d.country === 'Colombia'
          : scope === 'internacional'
            ? d.country !== 'Colombia'
            : true,
      )
      .filter((d) => !avoid.some((a) => d.avoidTags.includes(a)))
      .map((d) => {
        const matches = likes.filter((l) => d.tags.includes(l));
        const baseNights = d.country === 'Colombia' ? 2 : 5;
        const reference = d.minBudgetPP * (0.6 + (0.4 * nights) / baseNights);
        const perPerson = q.budget ? q.budget / travelers : null;
        const fits = perPerson == null ? null : perPerson >= reference;
        const budgetScore =
          perPerson == null
            ? 0
            : fits
              ? 3
              : -4 * Math.min(1, (reference - perPerson) / reference);
        return {
          slug: d.slug,
          name: d.name,
          country: d.country,
          region: d.region,
          imageUrl: d.imageUrl,
          description: d.description,
          tags: d.tags,
          fitsBudget: fits,
          reasons: matches.map((m) => TAG_LABELS[m] ?? m),
          score: matches.length * 2 + budgetScore,
        };
      })
      .sort((a, b) => b.score - a.score);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return scored.slice(0, 6).map(({ score, ...rest }) => rest);
  }
}
