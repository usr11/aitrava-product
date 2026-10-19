import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Module,
  Post,
  Query,
} from '@nestjs/common';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { clientIp } from '../auth/auth.guard';
import { publicConfig } from '../common/config';
import { rateLimit } from '../common/rate-limit';
import { PrismaService } from '../prisma/prisma.service';

class ContactDto {
  @IsString() @MinLength(2) @MaxLength(80) name: string;
  @IsEmail({}, { message: 'Escribe un correo válido' })
  @MaxLength(120)
  email: string;
  @IsString() @MinLength(2) @MaxLength(120) subject: string;
  @IsString() @MinLength(5) @MaxLength(2000) message: string;
}

/** Consultas de Overpass permitidas (OpenStreetMap). El cliente solo elige categorías, nunca escribe la consulta. */
const OSM_QUERIES: Record<string, string[]> = {
  turismo: [
    '[tourism~"^(attraction|museum|viewpoint|gallery)$"]',
    '[historic~"^(monument|castle|memorial|ruins)$"]',
  ],
  comida: ['[amenity~"^(restaurant|food_court)$"]'],
  cafe: ['[amenity="cafe"]', '[shop="bakery"]'],
  experiencias: [
    '[tourism~"^(theme_park|zoo|aquarium)$"]',
    '[leisure~"^(park|garden)$"]',
    '[amenity~"^(theatre|cinema|arts_centre)$"]',
  ],
  compras: [
    '[shop~"^(mall|department_store|gift|books|marketplace)$"]',
    '[amenity="marketplace"]',
  ],
  nocturna: ['[amenity~"^(bar|pub|nightclub)$"]'],
  servicios: ['[amenity~"^(pharmacy|atm|bank|hospital|police|toilets)$"]'],
};
/** Respaldo con Photon (búsqueda de OpenStreetMap de Komoot) cuando Overpass está caído. */
const PHOTON: Record<string, { q: string; tags: string[] }> = {
  turismo: {
    q: 'museo',
    tags: [
      'tourism:museum',
      'tourism:attraction',
      'tourism:viewpoint',
      'historic:monument',
    ],
  },
  comida: { q: 'restaurante', tags: ['amenity:restaurant'] },
  cafe: { q: 'café', tags: ['amenity:cafe', 'shop:bakery'] },
  experiencias: {
    q: 'parque',
    tags: ['leisure:park', 'tourism:zoo', 'amenity:theatre', 'amenity:cinema'],
  },
  compras: {
    q: 'tienda',
    tags: [
      'shop:mall',
      'shop:department_store',
      'shop:gift',
      'amenity:marketplace',
    ],
  },
  nocturna: {
    q: 'bar',
    tags: ['amenity:bar', 'amenity:pub', 'amenity:nightclub'],
  },
  servicios: {
    q: 'farmacia',
    tags: [
      'amenity:pharmacy',
      'amenity:atm',
      'amenity:bank',
      'amenity:hospital',
    ],
  },
};
const UA = 'AiTrava-PMV/1.0 (proyecto universitario; aitrava.25@gmail.com)';

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id: number;
    osm_type: string;
    osm_key: string;
    osm_value: string;
    name?: string;
  };
};

async function photon(lat: number, lng: number, cats: string[]) {
  const elements: {
    id: number;
    type: string;
    lat: number;
    lon: number;
    tags: Record<string, string>;
  }[] = [];
  await Promise.all(
    cats.map(async (c) => {
      const { q, tags } = PHOTON[c];
      const qs = new URLSearchParams({
        q,
        lat: String(lat),
        lon: String(lng),
        limit: '15',
        location_bias_scale: '0.1',
        zoom: '16',
        lang: 'default',
      });
      tags.forEach((t) => qs.append('osm_tag', t));
      const res = await fetch(`https://photon.komoot.io/api/?${qs}`, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { features: PhotonFeature[] };
      for (const f of data.features) {
        const [lon, la] = f.geometry.coordinates;
        // solo lo que está a menos de ~2 km
        if (
          !f.properties.name ||
          Math.abs(la - lat) > 0.02 ||
          Math.abs(lon - lng) > 0.025
        )
          continue;
        elements.push({
          id: f.properties.osm_id,
          type: f.properties.osm_type,
          lat: la,
          lon,
          tags: {
            name: f.properties.name,
            [f.properties.osm_key]: f.properties.osm_value,
          },
        });
      }
    }),
  );
  return { elements, source: 'photon' };
}

const nearbyCache = new Map<string, { at: number; data: unknown }>();

@Controller()
export class PublicController {
  private readonly logger = new Logger('Nearby');
  constructor(private prisma: PrismaService) {}

  @Get('config')
  config() {
    return publicConfig();
  }

  /** Ecosistema de proveedores. Solo `active` podría presentarse como aliado real; el resto es DEMO. */
  @Get('providers')
  providers() {
    return this.prisma.provider.findMany({
      where: { status: { in: ['demo', 'prospect', 'active'] } },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        category: true,
        country: true,
        logoUrl: true,
        websiteUrl: true,
        description: true,
        status: true,
      },
    });
  }

  /**
   * Lugares cercanos (OpenStreetMap vía Overpass). Pasa por el backend para enviar un User-Agent
   * identificado (Overpass rechaza algunos navegadores) y guardar 10 min en caché.
   */
  @Get('nearby')
  async nearby(
    @Query('lat') latRaw: string,
    @Query('lng') lngRaw: string,
    @Query('cats') catsRaw: string,
    @clientIp() ip: string,
  ) {
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180
    ) {
      throw new BadRequestException('Ubicación inválida');
    }
    const cats = (catsRaw ?? '').split(',').filter((c) => OSM_QUERIES[c]);
    if (!cats.length) throw new BadRequestException('Categoría inválida');
    const key = `${lat.toFixed(3)},${lng.toFixed(3)}:${cats.sort().join(',')}`;
    const hit = nearbyCache.get(key);
    if (hit && Date.now() - hit.at < 600_000) return hit.data;
    rateLimit(`nearby:${ip}`, 30, 60_000);
    const parts = cats.flatMap((c) =>
      OSM_QUERIES[c].map((q) => `nwr(around:1200,${lat},${lng})${q}[name];`),
    );
    const body = `data=${encodeURIComponent(`[out:json][timeout:8];(${parts.join('')});out center 80;`)}`;
    for (const url of ['https://overpass-api.de/api/interpreter']) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          body,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': UA,
          },
          signal: AbortSignal.timeout(7_000),
        });
        if (!res.ok) {
          this.logger.warn(`Overpass ${url} respondió ${res.status}`);
          continue;
        }
        const data = (await res.json()) as unknown;
        nearbyCache.set(key, { at: Date.now(), data });
        if (nearbyCache.size > 500)
          nearbyCache.delete(nearbyCache.keys().next().value);
        return data;
      } catch (e) {
        this.logger.warn(`Overpass ${url} falló: ${(e as Error).message}`);
      }
    }
    try {
      const data = await photon(lat, lng, cats);
      if (data.elements.length) {
        nearbyCache.set(key, { at: Date.now(), data });
        return data;
      }
    } catch (e) {
      this.logger.warn(`Photon falló: ${(e as Error).message}`);
    }
    throw new BadGatewayException(
      'No pudimos consultar los lugares cercanos. Intenta en un momento.',
    );
  }

  /** El mensaje se guarda de verdad y el equipo lo ve en /admin/mensajes. */
  @Post('contact')
  @HttpCode(201)
  async contact(@Body() dto: ContactDto, @clientIp() ip: string) {
    rateLimit(`contact:${ip}`, 5, 3600_000);
    await this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        subject: dto.subject.trim(),
        message: dto.message.trim(),
      },
    });
    return { ok: true };
  }
}

@Module({ controllers: [PublicController] })
export class PublicModule {}
