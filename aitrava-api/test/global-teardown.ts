import { PrismaClient } from '@prisma/client';

/** Elimina solo el esquema efímero que creó esta corrida. */
export default async function globalTeardown() {
  const schema = process.env.E2E_SCHEMA;
  if (!schema || !/^e2e_\d+$/.test(schema)) return;
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.E2E_DATABASE_URL } },
  });
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await prisma.$disconnect();
}
