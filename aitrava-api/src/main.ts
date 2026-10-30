import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { guardProcess, setupApp } from './app.setup';
import { isProduction } from './common/config';

// Carga aitrava-api/.env en local (en Railway las variables ya vienen del entorno).
try {
  process.loadEnvFile();
} catch {
  /* sin .env: se usan las variables del entorno */
}

async function bootstrap() {
  const secret = process.env.JWT_SECRET ?? '';
  if (!secret || (isProduction() && secret.length < 32)) {
    throw new Error('Falta JWT_SECRET (en producción, mínimo 32 caracteres).');
  }
  guardProcess();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  new Logger('AiTrava').log(`API → http://localhost:${port}/api`);
}
void bootstrap();
