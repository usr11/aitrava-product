import { execSync } from 'child_process';

/**
 * Cada corrida usa un esquema nuevo y propio (e2e_<timestamp>) dentro de la BD de pruebas:
 * no toca datos existentes y las corridas no se pisan. global-teardown.ts lo elimina al final.
 */
export default function globalSetup() {
  const base =
    process.env.TEST_DATABASE_URL ??
    'postgresql://aitrava:aitrava@localhost:5433/aitrava_test';
  if (!/\/[a-z0-9_]*_test(\?|$)/i.test(base))
    throw new Error(
      `TEST_DATABASE_URL debe apuntar a una BD *_test (recibí ${base}).`,
    );
  const schema = `e2e_${Date.now()}`;
  const url = `${base}${base.includes('?') ? '&' : '?'}schema=${schema}`;
  process.env.E2E_DATABASE_URL = url;
  process.env.E2E_SCHEMA = schema;
  const env = { ...process.env, DATABASE_URL: url, NODE_ENV: 'test' };
  execSync('npx prisma migrate deploy', { env, stdio: 'ignore' });
  execSync('npx tsx prisma/seed.ts', { env, stdio: 'ignore' });
}
