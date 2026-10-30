import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/** Errores de Prisma que tienen una respuesta clara para el cliente. */
const PRISMA: Record<string, [number, string]> = {
  P2002: [HttpStatus.CONFLICT, 'Ese registro ya existe.'],
  P2025: [HttpStatus.NOT_FOUND, 'No encontramos ese registro.'],
  P2003: [HttpStatus.CONFLICT, 'Ese registro está en uso por otro.'],
  P2028: [
    HttpStatus.SERVICE_UNAVAILABLE,
    'Hay mucha gente reservando al mismo tiempo. Intenta de nuevo en unos segundos.',
  ],
  P2034: [
    HttpStatus.SERVICE_UNAVAILABLE,
    'Hay mucha gente reservando al mismo tiempo. Intenta de nuevo en unos segundos.',
  ],
};

/**
 * Filtro global: el cliente nunca ve trazas ni detalles internos; el servidor sí los registra.
 * Las HttpException pasan tal cual (mensajes en español pensados para el usuario).
 */
@Catch()
export class ErrorsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Errores');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (res.headersSent) return;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      res
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body,
        );
      return;
    }

    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      PRISMA[exception.code]
    ) {
      const [status, message] = PRISMA[exception.code];
      if (status >= 500)
        this.logger.warn(`${exception.code}: ${exception.message}`);
      res.status(status).json({ statusCode: status, message });
      return;
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(
        `Sin conexión a la base de datos: ${exception.message}`,
      );
      res.status(503).json({
        statusCode: 503,
        message:
          'El servicio no está disponible en este momento. Intenta en un minuto.',
      });
      return;
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );
    res.status(500).json({
      statusCode: 500,
      message: 'Tuvimos un problema en el servidor. Intenta de nuevo.',
    });
  }
}
