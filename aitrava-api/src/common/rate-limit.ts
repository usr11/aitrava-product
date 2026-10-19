import { HttpException, HttpStatus } from '@nestjs/common';

/** Límite de intentos en memoria (suficiente para un PMV con una sola instancia). */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    throw new HttpException(
      'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits)
      if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
}
