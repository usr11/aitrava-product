import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  log(
    name: string,
    userId?: string | null,
    props?: Record<string, unknown>,
    anonId?: string | null,
  ) {
    return this.prisma.event.create({
      data: {
        name,
        userId: userId ?? null,
        anonId: anonId ?? null,
        props: (props ?? undefined) as Prisma.InputJsonValue,
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
