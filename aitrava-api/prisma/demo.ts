/**
 * Prepara la cuenta demo (demo@aitrava.co) para la presentación. Se corre con `pnpm db:demo`.
 * Borra los viajes anteriores de la cuenta demo y crea dos:
 *  1. "Listo para abrir": reservado, 5 pistas desbloqueadas y 2 amigos que ya apostaron → para mostrar la revelación.
 *  2. "Pistas a medias": reservado hace poco, 2 de 5 pistas → para mostrar la espera y la cuenta regresiva.
 * No toca a otros usuarios ni las métricas.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CLUE_ORDER = ['empacar', 'clima', 'comida', 'musica', 'cultura'];

type Prov = { name: string; detail: string; rate: number };

const breakdown = (total: number) => {
  const round = (n: number) => Math.round(n / 10_000) * 10_000;
  const comision = 50_000; // tarifa fija de AiTrava
  const net = total - comision;
  const transporte = round(net * 0.39);
  const alojamiento = round(net * 0.32);
  return {
    transporte,
    alojamiento,
    experiencias: net - transporte - alojamiento,
    comision,
    total,
  };
};

/** Arma la reserva con los aliados del destino (los primeros del catálogo, para que la demo sea igual siempre). */
const bookingFor = (providers: unknown, b: ReturnType<typeof breakdown>) => {
  const cat = providers as {
    transporte: Prov[];
    alojamiento: Prov[];
    experiencias: Prov[];
  };
  const exp = cat.experiencias.slice(0, 3);
  const each = Math.round(b.experiencias / exp.length / 1_000) * 1_000;
  const booking = {
    transporte: { ...cat.transporte[0], amount: b.transporte },
    alojamiento: { ...cat.alojamiento[0], amount: b.alojamiento },
    experiencias: exp.map((e, i) => ({
      ...e,
      amount:
        i === exp.length - 1 ? b.experiencias - each * (exp.length - 1) : each,
    })),
  };
  const partnerCommission = Math.round(
    booking.transporte.amount * booking.transporte.rate +
      booking.alojamiento.amount * booking.alojamiento.rate +
      booking.experiencias.reduce((sum, e) => sum + e.amount * e.rate, 0),
  );
  return { booking, partnerCommission };
};

async function createTrip(opts: {
  userId: string;
  slug: string;
  budget: number;
  travelers: number;
  vibes: string[];
  vibeLabels: string[];
  reason: string;
  unlocked: number;
  revealInMinutes: number;
  code: string;
  friends?: { name: string; slug: string }[];
}) {
  const d = await prisma.destination.findUniqueOrThrow({
    where: { slug: opts.slug },
  });
  const bank = d.clueBank as { type: string; text: string }[];
  const now = Date.now();
  const start = new Date(now + 14 * 86_400_000);
  const revealAt = new Date(now + opts.revealInMinutes * 60_000);
  const b = breakdown(opts.budget);
  const { booking, partnerCommission } = bookingFor(d.providers, b);
  const trip = await prisma.trip.create({
    data: {
      userId: opts.userId,
      status: 'RESERVED',
      originCity: 'Bogotá',
      startDate: start,
      endDate: new Date(start.getTime() + 2 * 86_400_000),
      travelers: opts.travelers,
      budgetTotal: opts.budget,
      preferences: { vibes: opts.vibes, avoid: [], originCity: 'Bogotá' },
      destinationId: d.id,
      aiReason: opts.reason,
      aiGenerated: true,
      vibes: opts.vibeLabels,
      itinerary: d.itinerary as object,
      breakdown: b,
      booking,
      partnerCommission,
      amountPaid: opts.budget,
      shareCode: opts.code,
      reservedAt: new Date(now - 60 * 60_000),
      revealAt,
      clues: {
        create: CLUE_ORDER.map((type, i) => ({
          order: i + 1,
          type,
          text: bank.find((c) => c.type === type)?.text ?? bank[i].text,
          // Las primeras `unlocked` ya están abiertas; el resto se reparte hasta la revelación.
          unlockAt:
            i < opts.unlocked
              ? new Date(now - (opts.unlocked - i) * 60_000)
              : new Date(
                  now +
                    ((i - opts.unlocked + 1) / (5 - opts.unlocked + 1)) *
                      opts.revealInMinutes *
                      60_000,
                ),
        })),
      },
    },
  });
  for (const f of opts.friends ?? []) {
    await prisma.guess.create({
      data: {
        tripId: trip.id,
        guesserName: f.name,
        isOwner: false,
        destination: f.slug,
        correct: f.slug === opts.slug,
      },
    });
  }
  return trip;
}

async function main() {
  const demo = await prisma.user.findUniqueOrThrow({
    where: { email: 'demo@aitrava.co' },
  });
  await prisma.trip.deleteMany({ where: { userId: demo.id } });

  await createTrip({
    userId: demo.id,
    slug: 'cartagena',
    budget: 3_200_000,
    travelers: 2,
    vibes: ['playa', 'comida', 'cultura'],
    vibeLabels: [
      'Brisa caribeña',
      'Historia en cada esquina',
      'Noches de salsa',
    ],
    reason:
      'Buscaban playa, buena comida y cultura para un aniversario. Cartagena mezcla las tres cosas y cabe en su presupuesto para 2.',
    unlocked: 5,
    revealInMinutes: 0,
    code: 'DEMO01',
    friends: [
      { name: 'Camila', slug: 'santa-marta' },
      { name: 'Andrés', slug: 'cartagena' },
    ],
  });

  await createTrip({
    userId: demo.id,
    slug: 'salento',
    budget: 1_800_000,
    travelers: 2,
    vibes: ['montana', 'cafe', 'naturaleza'],
    vibeLabels: ['Aire de montaña', 'Olor a café', 'Naturaleza de verdad'],
    reason:
      'Querían montaña, café y desconectarse. Salento tiene fincas cafeteras y el Valle de Cocora a minutos.',
    unlocked: 2,
    revealInMinutes: 3 * 24 * 60,
    code: 'DEMO02',
    friends: [{ name: 'Sofía', slug: 'jardin' }],
  });

  console.log(
    'Demo lista: entra con demo@aitrava.co / aitrava123 → "Mis viajes". Links públicos: /s/DEMO01 y /s/DEMO02',
  );
}

void main().finally(() => prisma.$disconnect());
