import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** Claves que nunca se guardan en `props` (privacidad: nada sensible ni de la Bóveda). */
const BLOCKED = /pass|token|card|cvv|cvc|email|phone|file|document|data/i;

const clean = (props?: Record<string, unknown>) => {
  if (!props) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (BLOCKED.test(k)) continue;
    if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) {
      out[k] = typeof v === 'string' ? v.slice(0, 200) : v;
    }
  }
  return out as Prisma.InputJsonValue;
};

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async log(
    name: string,
    userId?: string | null,
    props?: Record<string, unknown>,
    anonId?: string | null,
    tripId?: string | null,
  ) {
    // Lo que hace una cuenta o un viaje DEMO no cuenta en las métricas.
    const [user, trip] = await Promise.all([
      userId
        ? this.prisma.user.findUnique({
            where: { id: userId },
            select: { isDemo: true },
          })
        : null,
      tripId
        ? this.prisma.trip.findUnique({
            where: { id: tripId },
            select: { isDemo: true },
          })
        : null,
    ]);
    return this.prisma.event.create({
      data: {
        name,
        userId: user ? userId : null,
        anonId: anonId ?? null,
        tripId: trip ? tripId : null,
        props: clean(props),
        isDemo: !!(user?.isDemo || trip?.isDemo),
      },
    });
  }

  /** Al registrarse o iniciar sesión, los eventos anónimos previos pasan a ser del usuario (embudo sin duplicados). */
  async linkAnon(anonId: string | undefined, userId: string) {
    if (!anonId) return;
    await this.prisma.event.updateMany({
      where: { anonId, userId: null },
      data: { userId },
    });
  }
}
