import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { destinations } from './destinations';

const prisma = new PrismaClient();

async function main() {
  for (const d of destinations) {
    const data = {
      ...d,
      imageUrl: '',
      itinerary: d.itinerary.map((it, i) => ({ day: i + 1, ...it })),
    };
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: data,
      create: data,
    });
  }

  const passwordHash = await bcrypt.hash('aitrava123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@aitrava.co' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@aitrava.co',
      name: 'Equipo AiTrava',
      passwordHash,
      role: 'ADMIN',
      referralCode: 'AITRAVA',
    },
  });
  await prisma.user.upsert({
    where: { email: 'demo@aitrava.co' },
    update: {},
    create: {
      email: 'demo@aitrava.co',
      name: 'Valentina Demo',
      passwordHash,
      referralCode: 'VALEN2026',
    },
  });

  // Iteraciones de ejemplo: reemplazarlas por las reales desde /admin/iteraciones.
  if ((await prisma.iteration.count()) === 0) {
    await prisma.iteration.create({
      data: {
        version: 'v0',
        date: new Date(),
        hypothesis:
          '(Ejemplo, editar) Los jóvenes de 18–30 pagarían por no tener que planear y por la emoción de la sorpresa.',
        metric: 'Encuestas + clics en el CTA de la landing (Meta Pixel).',
        result: 'Pendiente de medir con la app.',
        decision: 'Construir el prototipo con wizard, pistas y revelación.',
        change: 'Primera versión del producto.',
      },
    });
  }

  console.log(
    `Seed listo: ${destinations.length} destinos, admin@aitrava.co y demo@aitrava.co (clave: aitrava123)`,
  );
}

void main().finally(() => prisma.$disconnect());
