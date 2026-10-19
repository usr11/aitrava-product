import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: '200kb' });

  // CORS: solo la app (APP_URL, se aceptan varias separadas por coma). En local se acepta todo para probar desde el celular.
  const origins = (process.env.APP_URL ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const isProd =
    process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;
  app.enableCors({ origin: isProd && origins.length ? origins : true });

  // Encabezados de seguridad básicos.
  app.use(
    (
      _req: unknown,
      res: { setHeader: (k: string, v: string) => void },
      next: () => void,
    ) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    },
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Healthcheck (Railway): responde solo si la BD contesta.
  const prisma = app.get(PrismaService);
  app
    .getHttpAdapter()
    .get('/api', async (_req, res: { json: (b: unknown) => void }) => {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true, name: 'AITRAVA API' });
    });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`AITRAVA API → http://localhost:${port}/api`);
}
void bootstrap();
