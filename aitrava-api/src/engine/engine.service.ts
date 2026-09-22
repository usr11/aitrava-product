import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { Injectable, Logger } from '@nestjs/common';
import { Destination } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClueDraft,
  ItineraryDay,
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
  private readonly client = process.env.ANTHROPIC_API_KEY
    ? new Anthropic()
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

  /** Paso 3: Claude elige entre el top 5 y escribe pistas e itinerario personalizados. */
  private async planWithAi(
    prefs: TripPreferences,
    candidates: Destination[],
  ): Promise<TripPlan> {
    const slugs = candidates.map((c) => c.slug) as [string, ...string[]];
    const schema = z.object({
      destinationSlug: z.enum(slugs),
      reason: z.string(),
      vibes: z.array(z.string()),
      clues: z.array(
        z.object({
          type: z.enum(CLUE_ORDER as [string, ...string[]]),
          text: z.string(),
        }),
      ),
      itinerary: z.array(
        z.object({
          day: z.number(),
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

    const response = await this.client!.messages.parse(
      {
        model: process.env.ANTHROPIC_MODEL || 'claude-opus-5',
        max_tokens: 4000,
        output_config: { effort: 'low', format: zodOutputFormat(schema) },
        system:
          'Eres el motor de AiTrava, una app colombiana de viajes sorpresa. Eliges UN destino del catálogo para el viajero y escribes en español de Colombia, cercano y con emoción. ' +
          'Reglas: las pistas NUNCA mencionan el nombre del destino, su departamento ni lugares que lo delaten de inmediato; van de más difícil a más fácil. ' +
          '"vibes" son 3 frases cortas (máx. 4 palabras) que dan ambiente sin revelar el lugar. "reason" explica en 1–2 frases por qué este destino encaja con la persona (se muestra al revelar).',
        messages: [
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
              instrucciones: `Devuelve exactamente 5 pistas (una por tipo: ${CLUE_ORDER.join(', ')}) y un itinerario de ${days} días con 3–4 actividades por día.`,
            }),
          },
        ],
      },
      { timeout: 45_000 },
    );

    const out = response.parsed_output;
    if (!out)
      throw new Error(
        `respuesta sin JSON válido (stop_reason=${response.stop_reason})`,
      );
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
      vibes: out.vibes.filter((v) => !leaks(v)).slice(0, 3),
      clues,
      itinerary: out.itinerary.length
        ? out.itinerary.slice(0, 7)
        : this.fitItinerary(d.itinerary as ItineraryDay[], days),
      aiGenerated: true,
    };
  }
}
