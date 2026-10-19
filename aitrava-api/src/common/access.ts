import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * "RLS" del PMV: todo acceso a un viaje pasa por aquí y se filtra por el dueño.
 * Un usuario nunca puede leer ni tocar el viaje de otro (responde 404, no 403, para no filtrar ids).
 */
export async function ownTrip(
  prisma: PrismaService,
  userId: string,
  tripId: string,
) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: { pass: true },
  });
  if (!trip) throw new NotFoundException('No encontramos ese viaje');
  return trip;
}

/** El Pass está activo, o es un viaje DEMO (se muestra con la etiqueta DEMO). */
export const hasPass = (trip: {
  isDemo: boolean;
  pass?: { status: string } | null;
}) => trip.isDemo || trip.pass?.status === 'active';

export function requirePass(trip: {
  isDemo: boolean;
  pass?: { status: string } | null;
}) {
  if (!hasPass(trip)) {
    throw new ForbiddenException({
      message: 'Esta función es parte del AITRAVA Pass de este viaje.',
      code: 'PASS_REQUIRED',
    });
  }
}
