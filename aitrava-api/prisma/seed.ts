import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { destinations } from './destinations';
import { providers } from './providers';

const prisma = new PrismaClient();

async function main() {
  for (const d of destinations) {
    const data = {
      ...d,
      providers: providers[d.slug],
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
  // Usuario y clave del admin: en producción vienen de ADMIN_EMAIL y ADMIN_PASSWORD
  // (los de por defecto están públicos en el repo, así que solo sirven en local).
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@aitrava.co')
    .toLowerCase()
    .trim();
  const adminHash = process.env.ADMIN_PASSWORD
    ? await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
    : passwordHash;
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', passwordHash: adminHash },
    create: {
      email: adminEmail,
      name: 'Equipo AiTrava',
      passwordHash: adminHash,
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
    `Seed listo: ${destinations.length} destinos, ${adminEmail} (clave: ${process.env.ADMIN_PASSWORD ? 'la de ADMIN_PASSWORD' : 'aitrava123'}) y demo@aitrava.co (clave: aitrava123)`,
  );
}

void main().finally(() => prisma.$disconnect());
