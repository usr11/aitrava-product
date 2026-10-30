import { Logger, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { isProduction } from './common/config';
import { ErrorsFilter } from './common/errors.filter';
import { PrismaService } from './prisma/prisma.service';

/** Configuración compartida por main.ts y las pruebas e2e (así se prueba lo mismo que corre en producción). */
export function setupApp(app: NestExpressApplication) {
  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.useBodyParser('json', { limit: '100kb' });
  app.enableShutdownHooks();

  // CORS: solo la app (APP_URL, se aceptan varias separadas por coma). En local se acepta todo para probar desde el celular.
  const origins = (process.env.APP_URL ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
  app.enableCors({
    origin: isProduction() && origins.length ? origins : true,
    maxAge: 600,
  });

  // Encabezados de seguridad básicos (es una API JSON: no sirve HTML).
  app.use(
    (
      _req: unknown,
      res: { setHeader: (k: string, v: string) => void },
      next: () => void,
    ) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Cache-Control', 'no-store');
      next();
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new ErrorsFilter());

  // Healthcheck (Railway): 200 solo si la BD contesta; 503 si no.
  const prisma = app.get(PrismaService);
  const health = async (
    _req: unknown,
    res: { status: (n: number) => { json: (b: unknown) => void } },
  ) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ ok: true, name: 'AiTrava API' });
    } catch {
      res.status(503).json({ ok: false });
    }
  };
  app.getHttpAdapter().get('/api', health);
  app.getHttpAdapter().get('/api/health', health);
}

export function guardProcess() {
  const logger = new Logger('Proceso');
  process.on('unhandledRejection', (e) =>
    logger.error(
      `Promesa sin manejar: ${e instanceof Error ? e.stack : String(e)}`,
    ),
  );
}
