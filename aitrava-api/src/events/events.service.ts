import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { normalizeChannel, normalizeVariant } from '../salidas/rules';
import { PrismaService } from '../prisma/prisma.service';

/** Claves que nunca se guardan en `props` (privacidad: nada de contacto ni datos personales). */
const BLOCKED =
  /pass|token|card|email|phone|name|nombre|motiv|note|document|data/i;

const clean = (props?: Record<string, unknown>) => {
  if (!props) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props).slice(0, 20)) {
    if (BLOCKED.test(k)) continue;
    if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) {
      out[k] = typeof v === 'string' ? v.slice(0, 120) : v;
    }
  }
  return out as Prisma.InputJsonValue;
};

export type EventInput = {
  userId?: string | null;
  anonId?: string | null;
  salidaId?: string | null;
  variant?: string | null;
  channel?: string | null;
  props?: Record<string, unknown>;
  isDemo?: boolean;
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Guarda un evento. Lo que hace el equipo (admin con sesión) o pasa en una salida DEMO no cuenta en las métricas.
   * Nunca rompe la operación que lo llama: si falla, solo se registra en el log.
   */
  async log(name: string, e: EventInput = {}) {
    try {
      const [user, salida] = await Promise.all([
        e.userId
          ? this.prisma.user.findUnique({
              where: { id: e.userId },
              select: { isDemo: true, role: true },
            })
          : null,
        e.salidaId
          ? this.prisma.salida.findUnique({
              where: { id: e.salidaId },
              select: { isDemo: true },
            })
          : null,
      ]);
      await this.prisma.event.create({
        data: {
          name,
          userId: user ? e.userId : null,
          anonId: e.anonId?.slice(0, 80) ?? null,
          salidaId: salida ? e.salidaId : null,
          variant: normalizeVariant(e.variant),
          channel: normalizeChannel(e.channel),
          props: clean(e.props),
          isDemo: !!(
            e.isDemo ||
            user?.isDemo ||
            user?.role === 'ADMIN' ||
            salida?.isDemo
          ),
        },
      });
    } catch (err) {
      this.logger.warn(
        `No se guardó el evento ${name}: ${(err as Error).message}`,
      );
    }
  }
}
