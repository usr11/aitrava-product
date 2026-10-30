/**
 * Pruebas de punta a punta contra Postgres real (BD *_test, ver global-setup.ts).
 * Cubren lo que más duele en producción: sobreventa de cupos, reservas duplicadas,
 * acceso a reservas ajenas, validaciones y permisos del panel.
 */
process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'jwt-secreto-de-pruebas-e2e-0123456789';
process.env.ADMIN_EMAILS = 'equipo@aitrava.co';

import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';
import { SalidasService } from '../src/salidas/salidas.service';

let app: NestExpressApplication;
let prisma: PrismaService;
let adminToken: string;
let ipSeq = 1;
/** Cada petición "viene" de una IP distinta para no chocar con los límites de intentos. */
const ip = () => `10.0.${Math.floor(ipSeq / 250)}.${(ipSeq++ % 250) + 1}`;
const http = () => request(app.getHttpServer());
const phone = (n: number) => `300${String(1_000_000 + n).slice(-7)}`;

const reserveBody = (n: number, extra: Record<string, unknown> = {}) => ({
  name: `Persona ${n}`,
  phone: phone(n),
  motivation: 'Quiero salir de la rutina y conocer gente nueva',
  inCali: true,
  knowsTeam: false,
  comesAlone: true,
  phoneChallenge: true,
  heardFrom: 'IG',
  isAdult: true,
  acceptsTerms: true,
  acceptsConduct: true,
  channel: 'ig',
  variant: 'A',
  ...extra,
});

const admin = () => ({ Authorization: `Bearer ${adminToken}` });

async function createSalida(
  capacity: number,
  extra: Record<string, unknown> = {},
) {
  const place = await prisma.place.findUniqueOrThrow({
    where: { slug: 'san-antonio' },
  });
  const res = await http()
    .post('/api/admin/salidas')
    .set(admin())
    .send({
      placeId: place.id,
      title: `Prueba ${Math.random().toString(36).slice(2, 7)}`,
      summary: 'Taller de café y tertulia para probar el sistema.',
      startsAt: new Date(Date.now() + 5 * 86_400_000).toISOString(),
      durationMin: 180,
      meetingPoint: 'Parque de San Antonio',
      capacity,
      price: 70_000,
      status: 'open',
      paymentInstructions: 'Nequi 300 000 0000 a nombre del anfitrión',
      ...extra,
    })
    .expect(201);
  return res.body as { id: string; slug: string };
}

beforeAll(async () => {
  const mod = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = mod.createNestApplication<NestExpressApplication>({
    logger: ['error'],
  });
  setupApp(app);
  await app.init();
  prisma = app.get(PrismaService);
  const login = await http()
    .post('/api/auth/login')
    .set('X-Forwarded-For', ip())
    .send({ email: 'admin@aitrava.co', password: 'aitrava123' })
    .expect(200);
  adminToken = login.body.token;
});

afterAll(async () => {
  await app.close();
});

describe('salud y datos públicos', () => {
  it('healthcheck responde con la BD arriba', async () => {
    await http()
      .get('/api/health')
      .expect(200, { ok: true, name: 'AiTrava API' });
  });

  it('lugares: 14 visibles, el excluido no sale', async () => {
    const res = await http().get('/api/places').expect(200);
    expect(res.body).toHaveLength(14);
    expect(
      res.body.find((p: { slug: string }) => p.slug === 'farallones'),
    ).toBeUndefined();
  });

  it('config pública trae la política de reembolso', async () => {
    const res = await http().get('/api/config').expect(200);
    expect(res.body.refundPolicy).toHaveLength(4);
    expect(res.body.holdHours).toBe(48);
  });

  it('salida inexistente → 404 en español', async () => {
    const res = await http().get('/api/salidas/no-existe').expect(404);
    expect(res.body.message).toMatch(/No encontramos/);
  });
});

describe('validaciones de la reserva', () => {
  let slug: string;
  beforeAll(async () => ({ slug } = await createSalida(5)));

  const bad = async (body: Record<string, unknown>, msg: RegExp) => {
    const res = await http()
      .post(`/api/salidas/${slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(body)
      .expect(400);
    expect(JSON.stringify(res.body.message)).toMatch(msg);
  };

  it('menor de edad', () =>
    bad(reserveBody(1, { isAdult: false }), /mayor de edad/));
  it('sin aceptar condiciones', () =>
    bad(reserveBody(1, { acceptsTerms: false }), /política de reembolso/));
  it('sin la pregunta filtro', () =>
    bad(reserveBody(1, { motivation: 'x' }), /motivó/));
  it('celular inválido', () =>
    bad(reserveBody(1, { phone: '6024445566' }), /celular colombiano/));
  it('campo desconocido', () =>
    bad(reserveBody(1, { role: 'ADMIN' }), /should not exist/));
  it('honeypot lleno (bot)', () =>
    bad(reserveBody(1, { website: 'http://spam' }), /No pudimos/));
  it('canal inventado no rompe nada', async () => {
    await http()
      .post(`/api/salidas/${slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(2, { channel: '<script>' }))
      .expect(201);
    const r = await prisma.reservation.findFirstOrThrow({
      where: { phone: `57${phone(2)}` },
    });
    expect(r.channel).toBe('SCRIPT');
  });
});

describe('concurrencia: sin sobreventa', () => {
  it('30 reservas simultáneas sobre 8 cupos → exactamente 8 entran', async () => {
    const { slug } = await createSalida(8);
    const results = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        http()
          .post(`/api/salidas/${slug}/reservations`)
          .set('X-Forwarded-For', ip())
          .send(reserveBody(100 + i)),
      ),
    );
    const ok = results.filter((r) => r.status === 201);
    const soldOut = results.filter(
      (r) => r.status === 409 && r.body.code === 'SOLD_OUT',
    );
    expect(ok).toHaveLength(8);
    expect(soldOut).toHaveLength(22);
    // códigos únicos y consecutivos-seguros
    expect(new Set(ok.map((r) => r.body.code)).size).toBe(8);
    const pub = await http().get(`/api/salidas/${slug}`).expect(200);
    expect(pub.body.seatsLeft).toBe(0);
    expect(pub.body.bookable).toBe(false);
  });

  it('el mismo WhatsApp 10 veces al tiempo → 1 cupo, el resto 409', async () => {
    const { slug, id } = await createSalida(8);
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        http()
          .post(`/api/salidas/${slug}/reservations`)
          .set('X-Forwarded-For', ip())
          .send(reserveBody(500)),
      ),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(
      results.filter((r) => r.body.code === 'ALREADY_RESERVED'),
    ).toHaveLength(9);
    expect(await prisma.reservation.count({ where: { salidaId: id } })).toBe(1);
  });
});

describe('ciclo de una reserva', () => {
  let salida: { id: string; slug: string };
  let code: string;
  let token: string;

  beforeAll(async () => {
    salida = await createSalida(2);
    const res = await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(700))
      .expect(201);
    ({ code, token } = res.body);
    expect(code).toMatch(/^AITRAVA-C\d{2,}$/);
  });

  it('sin token o con token ajeno → 404', async () => {
    await http().get(`/api/reservations/${code}`).expect(400);
    await http()
      .get(`/api/reservations/${code}?token=${'x'.repeat(32)}`)
      .expect(404);
    const other = await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(701))
      .expect(201);
    await http()
      .get(`/api/reservations/${other.body.code}?token=${token}`)
      .expect(404);
  });

  it('los datos de pago solo aparecen con el cupo confirmado', async () => {
    const before = await http()
      .get(`/api/reservations/${code}?token=${token}`)
      .expect(200);
    expect(before.body.status).toBe('requested');
    expect(before.body.paymentInstructions).toBeNull();
    const r = await prisma.reservation.findFirstOrThrow({
      where: { salidaId: salida.id, phone: `57${phone(700)}` },
    });
    await http()
      .patch(`/api/admin/reservations/${r.id}`)
      .set(admin())
      .send({ status: 'confirmed' })
      .expect(200);
    const after = await http()
      .get(`/api/reservations/${code}?token=${token}`)
      .expect(200);
    expect(after.body.paymentInstructions).toMatch(/Nequi/);
  });

  it('"ya pagué" → pago reportado (y es idempotente)', async () => {
    const res = await http()
      .post(`/api/reservations/${code}/payment`)
      .send({ token, note: 'Nequi 12:30' })
      .expect(200);
    expect(res.body.status).toBe('payment_reported');
    await http()
      .post(`/api/reservations/${code}/payment`)
      .send({ token })
      .expect(200);
  });

  it('salida llena: un tercero no entra; si alguien cancela, se libera el cupo', async () => {
    const full = await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(702))
      .expect(409);
    expect(full.body.code).toBe('SOLD_OUT');
    const res = await http()
      .post(`/api/reservations/${code}/cancel`)
      .send({ token })
      .expect(200);
    expect(res.body.status).toBe('cancelled');
    expect(res.body.refundNote).toMatch(/100 %/);
    await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(702))
      .expect(201);
  });

  it('el admin tampoco puede sobrevender al reactivar una cancelada', async () => {
    const r = await prisma.reservation.findFirstOrThrow({
      where: { salidaId: salida.id, status: 'cancelled' },
    });
    const res = await http()
      .patch(`/api/admin/reservations/${r.id}`)
      .set(admin())
      .send({ status: 'requested' })
      .expect(409);
    expect(res.body.code).toBe('SOLD_OUT');
  });

  it('no deja bajar la capacidad por debajo de lo ocupado', async () => {
    const s3 = await createSalida(3);
    for (const n of [710, 711, 712]) {
      await http()
        .post(`/api/salidas/${s3.slug}/reservations`)
        .set('X-Forwarded-For', ip())
        .send(reserveBody(n))
        .expect(201);
    }
    const res = await http()
      .patch(`/api/admin/salidas/${s3.id}`)
      .set(admin())
      .send({ capacity: 2 })
      .expect(409);
    expect(res.body.message).toMatch(/3 cupos ocupados/);
    await http()
      .patch(`/api/admin/salidas/${s3.id}`)
      .set(admin())
      .send({ capacity: 4 })
      .expect(200);
  });

  it('transición inválida → 400', async () => {
    const r = await prisma.reservation.findFirstOrThrow({
      where: { salidaId: salida.id, status: 'requested' },
    });
    await http()
      .patch(`/api/admin/reservations/${r.id}`)
      .set(admin())
      .send({ status: 'attended' })
      .expect(400);
  });
});

describe('apartados vencidos', () => {
  it('un apartado vencido libera el cupo y el barrido lo marca como vencido', async () => {
    const salida = await createSalida(2);
    const first = await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(800))
      .expect(201);
    const keep = await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(802))
      .expect(201);
    await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(801))
      .expect(409);
    // vence solo el apartado del primero
    await prisma.reservation.updateMany({
      where: { salidaId: salida.id, phone: `57${phone(800)}` },
      data: { holdUntil: new Date(Date.now() - 1000) },
    });
    expect(keep.body.code).toBeTruthy();
    const second = await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(801))
      .expect(201);
    expect(await app.get(SalidasService).expireHolds()).toBeGreaterThanOrEqual(
      1,
    );
    // el primero quiere reportar pago pero su cupo ya es de otro → 409 claro
    const late = await http()
      .post(`/api/reservations/${first.body.code}/payment`)
      .send({ token: first.body.token })
      .expect(409);
    expect(late.body.code).toBe('SOLD_OUT');
    const view = await http()
      .get(`/api/reservations/${second.body.code}?token=${second.body.token}`)
      .expect(200);
    expect(view.body.status).toBe('requested');
  });
});

describe('encuesta de cierre', () => {
  it('solo después de asistir, una vez, con el enlace del equipo', async () => {
    const salida = await createSalida(3);
    const res = await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(900))
      .expect(201);
    const body = {
      cameAlone: true,
      newContact: true,
      nps: 9,
      wouldReturn: true,
      returnPlace: 'Dapa',
      improve: 'Más tiempo',
    };
    await http()
      .post(`/api/surveys/${res.body.code}`)
      .set('X-Forwarded-For', ip())
      .send({ ...body, token: res.body.token })
      .expect(409);
    const r = await prisma.reservation.findFirstOrThrow({
      where: { salidaId: salida.id },
    });
    await http()
      .patch(`/api/admin/reservations/${r.id}`)
      .set(admin())
      .send({ status: 'paid', intentValid: true })
      .expect(200);
    await http()
      .patch(`/api/admin/reservations/${r.id}`)
      .set(admin())
      .send({ status: 'attended', challengeCompleted: true })
      .expect(200);
    const link = await http()
      .post(`/api/admin/reservations/${r.id}/survey-link`)
      .set(admin())
      .expect(200);
    const surveyToken = new URL(link.body.url).searchParams.get('t')!;
    // el enlace de la encuesta no abre la reserva
    await http()
      .get(`/api/reservations/${res.body.code}?token=${surveyToken}`)
      .expect(404);
    await http()
      .get(`/api/surveys/${res.body.code}?token=${surveyToken}`)
      .expect(200);
    await http()
      .post(`/api/surveys/${res.body.code}`)
      .set('X-Forwarded-For', ip())
      .send({ ...body, token: surveyToken })
      .expect(200);
    await http()
      .post(`/api/surveys/${res.body.code}`)
      .set('X-Forwarded-For', ip())
      .send({ ...body, token: surveyToken })
      .expect(409);
    await http()
      .post(`/api/surveys/${res.body.code}`)
      .set('X-Forwarded-For', ip())
      .send({ ...body, nps: 11, token: surveyToken })
      .expect(400);
  });
});

describe('lista de espera, anfitriones y eventos', () => {
  it('lista de espera no duplica por WhatsApp', async () => {
    const body = {
      name: 'Ana',
      phone: '3109998877',
      line: 'NATURALEZA',
      consent: true,
      variant: 'B',
      channel: 'grp',
    };
    const a = await http()
      .post('/api/waitlist')
      .set('X-Forwarded-For', ip())
      .send(body)
      .expect(200);
    const b = await http()
      .post('/api/waitlist')
      .set('X-Forwarded-For', ip())
      .send({ ...body, phone: '+57 310 999 8877' })
      .expect(200);
    expect(a.body.alreadyIn).toBe(false);
    expect(b.body.alreadyIn).toBe(true);
    expect(
      await prisma.waitlistEntry.count({ where: { phone: '573109998877' } }),
    ).toBe(1);
  });

  it('postulación de anfitrión', async () => {
    await http()
      .post('/api/hosts/apply')
      .set('X-Forwarded-For', ip())
      .send({
        name: 'Guía Dapa',
        phone: '3157776655',
        activity: 'Caminatas por fincas cafeteras',
        consent: true,
      })
      .expect(200);
    const h = await prisma.host.findFirstOrThrow({
      where: { phone: '573157776655' },
    });
    expect(h.source).toBe('form');
  });

  it('el navegador no puede inventar eventos de negocio', async () => {
    const before = await prisma.event.count({
      where: { name: 'reservation_created' },
    });
    await http()
      .post('/api/events')
      .set('X-Forwarded-For', ip())
      .send({ name: 'reservation_created', anonId: 'x' })
      .expect(204);
    expect(
      await prisma.event.count({ where: { name: 'reservation_created' } }),
    ).toBe(before);
    await http()
      .post('/api/events')
      .set('X-Forwarded-For', ip())
      .send({
        name: 'landing_view',
        anonId: 'abc',
        variant: 'B',
        channel: 'IG',
      })
      .expect(204);
    const ev = await prisma.event.findFirstOrThrow({
      where: { name: 'landing_view', anonId: 'abc' },
    });
    expect(ev.variant).toBe('B');
  });

  it('límite de intentos por IP', async () => {
    const fixed = '203.0.113.9';
    const codes: number[] = [];
    for (let i = 0; i < 7; i++) {
      const r = await http()
        .post('/api/hosts/apply')
        .set('X-Forwarded-For', fixed)
        .send({
          name: 'Spam',
          phone: phone(9000 + i),
          activity: 'xxxxx',
          consent: true,
        });
      codes.push(r.status);
    }
    expect(codes).toContain(429);
  });
});

describe('panel del equipo', () => {
  it('sin sesión o con token falso → 401', async () => {
    await http().get('/api/admin/overview').expect(401);
    await http()
      .get('/api/admin/overview')
      .set('Authorization', 'Bearer falso')
      .expect(401);
  });

  it('solo el equipo puede crear cuenta', async () => {
    const body = {
      firstName: 'Ana',
      lastName: 'Viajera',
      email: 'ana@gmail.com',
      password: 'clave-segura-123',
      acceptTerms: true,
      acceptData: true,
    };
    await http()
      .post('/api/auth/register')
      .set('X-Forwarded-For', ip())
      .send(body)
      .expect(403);
    await http()
      .post('/api/auth/register')
      .set('X-Forwarded-For', ip())
      .send({ ...body, email: 'equipo@aitrava.co' })
      .expect(201);
  });

  it('tablero de evidencia: no cuenta DEMO ni simulacros, sí el pagado V1–V5', async () => {
    const res = await http()
      .get('/api/admin/overview')
      .set(admin())
      .expect(200);
    const ev = res.body.evidence;
    expect(ev.paidQualified).toBe(1); // la del bloque de encuesta
    expect(ev.reservations).toBeGreaterThan(10);
    expect(res.body.ab.variants).toHaveLength(2);
    expect(res.body.funnel[0].key).toBe('visit');
    expect(res.body.value.real.surveys).toBe(1);
    expect(res.body.value.real.nps.value).toBe(100);
  });

  it('modelo financiero: base y supuestos inválidos', async () => {
    const res = await http().get('/api/admin/model').set(admin()).expect(200);
    expect(Math.round(res.body.baseResult)).toBe(2_383_915);
    await http()
      .post('/api/admin/model')
      .set(admin())
      .send({ lines: [{ name: 'X', price: 1, cupo: 8, mix: 0.4 }] })
      .expect(400);
    await http()
      .post('/api/admin/model')
      .set(admin())
      .send({ salidas: [1, 2] })
      .expect(400);
    const up = await http()
      .post('/api/admin/model')
      .set(admin())
      .send({ comision: 0.24 })
      .expect(200);
    expect(Math.round(up.body.baseResult)).toBe(6_820_763);
  });

  it('exporta CSV sin fórmulas peligrosas', async () => {
    const salida = await createSalida(2);
    await http()
      .post(`/api/salidas/${salida.slug}/reservations`)
      .set('X-Forwarded-For', ip())
      .send(reserveBody(950, { name: '=HYPERLINK("x")' }))
      .expect(201);
    const res = await http()
      .get('/api/admin/export/reservas.csv')
      .set(admin())
      .expect(200);
    expect(res.text).toContain(`"'=HYPERLINK(""x"")"`);
    await http().get('/api/admin/export/nada.csv').set(admin()).expect(404);
  });
});
