import { Injectable, Logger } from '@nestjs/common';
import { Destination } from '@prisma/client';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import {
  Booking,
  ClueDraft,
  computeBreakdown,
  ItineraryDay,
  Provider,
  TravelDna,
  TripPlan,
  TripPreferences,
} from './types';

const CLUE_ORDER = ['empacar', 'clima', 'comida', 'musica', 'cultura'];

const TAG_LABELS: Record<string, string> = {
  playa: 'Sol, arena y agua',
  montana: 'Aire de montaña',
  comida: 'Sabores para recordar',
  fiesta: 'Noches largas',
  cultura: 'Historia en cada esquina',
  naturaleza: 'Naturaleza de verdad',
  silencio: 'Desconexión total',
  aventura: 'Adrenalina incluida',
  cafe: 'Olor a café',
  pueblo: 'Calles de pueblo',
};

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const nightsOf = (p: TripPreferences) =>
  Math.max(
    1,
    Math.round(
      (new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) /
        86_400_000,
    ),
  );

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);
  private readonly client = process.env.GROQ_API_KEY
    ? new Groq({
        apiKey: process.env.GROQ_API_KEY,
        timeout: 20_000,
        maxRetries: 1,
      })
    : null;

  constructor(private prisma: PrismaService) {}

  get aiEnabled() {
    return !!this.client;
  }

  /** Paso 1: filtra por presupuesto, cosas a evitar y origen; paso 2: puntúa por gustos + ADN viajero. */
  async rank(prefs: TripPreferences, dna: TravelDna | null) {
    const all = await this.prisma.destination.findMany();
    const nights = nightsOf(prefs);
    const budgetPP = (prefs.budgetTotal * 0.92) / prefs.travelers;
    const origin = normalize(prefs.originCity);
    const excluded = new Set(prefs.excluded ?? []);

    const eligible = all.filter(
      (d) => !excluded.has(d.slug) && !origin.includes(normalize(d.name)),
    );
    const costPP = (d: Destination) => (d.minBudgetPP * nights) / 2;

    let candidates = eligible.filter(
      (d) =>
        costPP(d) <= budgetPP &&
        !d.avoidTags.some((t) => prefs.avoid.includes(t)),
    );
    // Si nada cabe, relajamos: lo más barato que respete las restricciones (o lo más barato a secas).
    if (!candidates.length) {
      const respectful = eligible.filter(
        (d) => !d.avoidTags.some((t) => prefs.avoid.includes(t)),
      );
      candidates = [...(respectful.length ? respectful : eligible)]
        .sort((a, b) => a.minBudgetPP - b.minBudgetPP)
        .slice(0, 3);
    }

    return candidates
      .map((d) => {
        const matches = d.tags.filter((t) => prefs.vibes.includes(t));
        let score = matches.length * 3 + Math.random() * 1.5;
        for (const t of d.tags)
          score += Math.min(dna?.tagCounts?.[t] ?? 0, 3) * 0.3;
        if (dna?.visited?.includes(d.slug)) score -= 5;
        if (costPP(d) >= budgetPP * 0.5) score += 1; // aprovecha bien el presupuesto
        return { destination: d, matches, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Elige los aliados concretos del viaje y reparte el presupuesto entre ellos.
   * Si el viajero no quiere volar, se prefiere el transporte terrestre.
   */
  buildBooking(d: Destination, prefs: TripPreferences): Booking {
    const catalog = d.providers as {
      transporte: Provider[];
      alojamiento: Provider[];
      experiencias: Provider[];
    };
    const pick = <T>(list: T[]) =>
      list[Math.floor(Math.random() * list.length)];
    const flights = (p: Provider) => p.detail.startsWith('Vuelo');
    const terrestres = catalog.transporte.filter((p) => !flights(p));
    const transporte =
      prefs.avoid.includes('avion') && terrestres.length
        ? pick(terrestres)
        : pick(catalog.transporte);

    const b = computeBreakdown(prefs.budgetTotal);
    const experiencias = [...catalog.experiencias]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, catalog.experiencias.length));
    const each =
      Math.round(b.experiencias / experiencias.length / 1_000) * 1_000;

    return {
      transporte: { ...transporte, amount: b.transporte },
      alojamiento: { ...pick(catalog.alojamiento), amount: b.alojamiento },
      experiencias: experiencias.map((e, i) => ({
        ...e,
        // La última absorbe el redondeo para que la suma cuadre.
        amount:
          i === experiencias.length - 1
            ? b.experiencias - each * (experiencias.length - 1)
            : each,
      })),
    };
  }

  async plan(prefs: TripPreferences, dna: TravelDna | null): Promise<TripPlan> {
    const ranked = await this.rank(prefs, dna);
    if (this.client) {
      try {
        return await this.planWithAi(
          prefs,
          ranked.slice(0, 5).map((r) => r.destination),
        );
      } catch (error) {
        this.logger.warn(
          `IA no disponible, uso el motor por puntaje: ${(error as Error).message}`,
        );
      }
    }
    const best = ranked[0];
    return this.planFromCatalog(prefs, best.destination, best.matches);
  }

  private planFromCatalog(
    prefs: TripPreferences,
    d: Destination,
    matches: string[],
  ): TripPlan {
    const bank = d.clueBank as ClueDraft[];
    const clues = CLUE_ORDER.map((type) =>
      bank.find((c) => c.type === type),
    ).filter(Boolean) as ClueDraft[];
    const liked = matches.length
      ? matches.map((m) => TAG_LABELS[m]?.toLowerCase() ?? m).join(', ')
      : 'algo diferente';
    return {
      destinationId: d.id,
      destinationName: d.name,
      reason: `Buscabas ${liked}. ${d.name} lo tiene y cabe en tu presupuesto para ${prefs.travelers} ${prefs.travelers === 1 ? 'persona' : 'personas'}.`,
      vibes: d.tags.slice(0, 3).map((t) => TAG_LABELS[t] ?? t),
      clues: clues.length >= 5 ? clues.slice(0, 5) : bank.slice(0, 5),
      itinerary: this.fitItinerary(
        d.itinerary as ItineraryDay[],
        nightsOf(prefs) + 1,
      ),
      booking: this.buildBooking(d, prefs),
      aiGenerated: false,
    };
  }

  private fitItinerary(base: ItineraryDay[], days: number): ItineraryDay[] {
    return Array.from({ length: Math.min(days, 7) }, (_, i) => {
      const src = base[i] ?? {
        title: 'Día libre',
        items: [
          'Explora a tu ritmo',
          'Pregúntanos por planes extra en el chat',
        ],
      };
      return { ...src, day: i + 1 };
    });
  }

  /** Paso 3: la IA (Groq) elige entre el top 5 y escribe pistas e itinerario personalizados. */
  private async planWithAi(
    prefs: TripPreferences,
    candidates: Destination[],
  ): Promise<TripPlan> {
    const slugs = candidates.map((c) => c.slug) as [string, ...string[]];
    const schema = z.object({
      destinationSlug: z.enum(slugs),
      reason: z.string(),
      vibes: z.array(z.string()),
      clues: z.array(z.object({ type: z.string(), text: z.string() })),
      itinerary: z.array(
        z.object({
          day: z.coerce.number(),
          title: z.string(),
          items: z.array(z.string()),
        }),
      ),
    });

    const days = nightsOf(prefs) + 1;
    const catalog = candidates.map((c) => ({
      slug: c.slug,
      nombre: c.name,
      region: c.region,
      tags: c.tags,
      descripcion: c.description,
      pistas_ejemplo: c.clueBank,
    }));

    const completion = await this.client!.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      temperature: 0.8,
      max_completion_tokens: 4000,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Eres el motor de AiTrava, una app colombiana de viajes sorpresa. Eliges UN destino del catálogo para el viajero y escribes en español de Colombia, cercano y con emoción. ' +
            'Reglas: las pistas NUNCA mencionan el nombre del destino, su departamento ni lugares que lo delaten de inmediato; van de más difícil a más fácil. ' +
            '"vibes" son 3 frases cortas (máx. 4 palabras) que dan ambiente sin revelar el lugar. "reason" explica en 1–2 frases por qué este destino encaja con la persona (se muestra al revelar). ' +
            'Responde SOLO con un objeto JSON con esta forma exacta: ' +
            '{"destinationSlug": "<slug del catálogo>", "reason": "...", "vibes": ["...","...","..."], ' +
            '"clues": [{"type": "empacar|clima|comida|musica|cultura", "text": "..."}], ' +
            '"itinerary": [{"day": 1, "title": "...", "items": ["...", "..."]}]}',
        },
        {
          role: 'user',
          content: JSON.stringify({
            viajero: {
              sale_de: prefs.originCity,
              dias: days,
              viajeros: prefs.travelers,
              presupuesto_total_cop: prefs.budgetTotal,
              le_gusta: prefs.vibes,
              evitar: prefs.avoid,
              es_regalo: !!prefs.isGift,
            },
            catalogo: catalog,
            instrucciones: `Devuelve exactamente 5 pistas (una por tipo, en este orden: ${CLUE_ORDER.join(', ')}) y un itinerario de ${days} días con 3–4 actividades por día.`,
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      throw new Error(
        `JSON inválido de la IA: ${parsed.error.message.slice(0, 200)}`,
      );
    const out = parsed.data;
    const d = candidates.find((c) => c.slug === out.destinationSlug)!;
    const leaks = (t: string) => normalize(t).includes(normalize(d.name));
    const bank = d.clueBank as ClueDraft[];
    const clues = CLUE_ORDER.map(
      (type) =>
        out.clues.find((c) => c.type === type && !leaks(c.text)) ??
        bank.find((c) => c.type === type)!,
    ).filter(Boolean);

    return {
      destinationId: d.id,
      destinationName: d.name,
      reason: out.reason,
      vibes:
        out.vibes.filter((v) => !leaks(v)).length >= 2
          ? out.vibes.filter((v) => !leaks(v)).slice(0, 3)
          : d.tags.slice(0, 3).map((t) => TAG_LABELS[t] ?? t),
      clues,
      itinerary: out.itinerary.length
        ? out.itinerary.slice(0, 7)
        : this.fitItinerary(d.itinerary as ItineraryDay[], days),
      booking: this.buildBooking(d, prefs),
      aiGenerated: true,
    };
  }
}
