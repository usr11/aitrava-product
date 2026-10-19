import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { destinations } from './destinations';
import { inspiration } from './inspiration';
import { providers } from './providers';

const prisma = new PrismaClient();
const isProd =
  process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;

async function main() {
  // Destinos: Colombia (sugerencias) + internacionales (inspiración, destacados en /destinos).
  const all = [
    ...destinations.map((d) => ({ ...d, country: 'Colombia', featured: false })),
    ...inspiration.map((d) => ({ ...d, featured: true })),
  ];
  for (const d of all) {
    const data = {
      ...d,
      imageUrl: `/img/destinos/${d.slug}.jpg`,
      itinerary: d.itinerary.map((it, i) => ({ day: i + 1, ...it })),
    };
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: data,
      create: data,
    });
  }

  // Proveedores: todos DEMO (sin convenio). Solo se crean si no existen, para no pisar lo editado en /admin.
  for (const p of providers) {
    const exists = await prisma.provider.findFirst({ where: { name: p.name } });
    if (!exists) await prisma.provider.create({ data: { ...p, status: 'demo' } });
  }

  const now = new Date();
  // Admin de respaldo. En producción solo se crea si hay ADMIN_PASSWORD (nada de claves por defecto).
  // Los integrantes del equipo se vuelven admin con ADMIN_EMAILS al verificar su correo.
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@aitrava.co').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || (isProd ? '' : 'aitrava123');
  if (adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'ADMIN', passwordHash: hash, emailVerifiedAt: now },
      create: {
        email: adminEmail,
        firstName: 'Equipo',
        lastName: 'AITRAVA',
        passwordHash: hash,
        role: 'ADMIN',
        emailVerifiedAt: now,
        termsAcceptedAt: now,
        dataConsentAt: now,
      },
    });
  }

  // Cuenta DEMO para la presentación (sus datos no cuentan en las métricas).
  await prisma.user.upsert({
    where: { email: 'demo@aitrava.co' },
    update: { isDemo: true, emailVerifiedAt: now },
    create: {
      email: 'demo@aitrava.co',
      firstName: 'Valentina',
      lastName: 'Demo',
      passwordHash: await bcrypt.hash('aitrava123', 10),
      isDemo: true,
      emailVerifiedAt: now,
      termsAcceptedAt: now,
      dataConsentAt: now,
    },
  });

  console.log(
    `Seed listo: ${all.length} destinos, ${providers.length} proveedores DEMO, ` +
      `${adminPassword ? `admin ${adminEmail}` : 'sin admin de respaldo (define ADMIN_PASSWORD)'} y demo@aitrava.co (clave: aitrava123).`,
  );
}

void main().finally(() => prisma.$disconnect());
