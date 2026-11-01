import { PlaceLine, PlaceStatus, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const isProd = process.env.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;

type PlaceSeed = {
  slug: string;
  line: PlaceLine;
  name: string;
  area: string;
  experience: string;
  duration: string;
  distance?: string;
  refPrice: number;
  note?: string;
  status?: PlaceStatus;
};

/** Catálogo del documento (docs/AiTrava-final.md §3). Precios de referencia estimados [EST]. */
export const PLACES: PlaceSeed[] = [
  // Línea 1 · Urbano
  { slug: 'lago-de-las-garzas', line: 'URBANO', name: 'Ecoparque Lago de las Garzas', area: 'Pance, Cali', experience: 'Bienestar al aire libre: movilidad, respiración y pausa junto al lago.', duration: '3 h', refPrice: 60_000, note: 'Entorno controlado y de bajo impacto.' },
  { slug: 'san-antonio', line: 'URBANO', name: 'Barrio San Antonio y su colina', area: 'Cali', experience: 'Café, cultura y conversación: taller sensorial de café de especialidad y tertulia.', duration: '3 h', refPrice: 70_000, note: 'Cultural, sin esfuerzo físico.' },
  { slug: 'tres-cruces', line: 'URBANO', name: 'Cerro de las Tres Cruces', area: 'Cali', experience: 'Caminata al amanecer con desayuno al bajar.', duration: '3,5 h', refPrice: 55_000, note: 'Solo en grupo y temprano. Seguridad de la ruta por verificar.', status: 'verify' },
  { slug: 'cerro-de-la-bandera', line: 'URBANO', name: 'Ecoparque Cerro de la Bandera', area: 'Cali', experience: 'Atardecer, escritura en bitácora y cierre sin celular.', duration: '2,5 h', refPrice: 55_000, note: 'Bajo impacto.' },
  { slug: 'jardin-botanico', line: 'URBANO', name: 'Jardín Botánico de Cali', area: 'Cali', experience: 'Baño de bosque guiado.', duration: '3 h', refPrice: 70_000, note: 'Horarios y tarifa de entrada por verificar.', status: 'verify' },
  // Línea 2 · Naturaleza cerca
  { slug: 'km-18', line: 'NATURALEZA', name: 'Kilómetro 18', area: 'Vía al mar', experience: 'Avistamiento de aves en bosque de niebla y café de finca.', duration: 'Medio día', distance: '~40 min', refPrice: 120_000, note: 'Uno de los destinos de aves más conocidos del Valle.' },
  { slug: 'rio-pance', line: 'NATURALEZA', name: 'Río Pance y La Vorágine', area: 'Pance, Cali', experience: 'Sendero corto y pausa en el río con picnic.', duration: 'Medio día', distance: '~40 min', refPrice: 95_000, note: 'Se evita en temporada de lluvias y crecientes.', status: 'verify' },
  { slug: 'dapa', line: 'NATURALEZA', name: 'Dapa', area: 'Yumbo', experience: 'Caminata por fincas cafeteras, mirador y almuerzo campesino.', duration: 'Medio día', distance: '~45 min', refPrice: 110_000, note: 'Clima frío. Buena para el reto sin celular.' },
  { slug: 'felidia-la-leonera', line: 'NATURALEZA', name: 'Felidia y La Leonera', area: 'Corregimientos de Cali', experience: 'Ruta de río y montaña con anfitrión campesino.', duration: 'Medio día', distance: '~1 h', refPrice: 110_000, note: 'Accesos y anfitriones con RNT por verificar.', status: 'verify' },
  { slug: 'hacienda-el-paraiso', line: 'NATURALEZA', name: 'Hacienda El Paraíso', area: 'El Cerrito', experience: 'Ruta cultural de María y paisaje del valle.', duration: 'Medio día', distance: '~1 h', refPrice: 115_000, note: 'Cultural, con entrada pagada (por verificar).', status: 'verify' },
  // Línea 3 · Escapada de un día
  { slug: 'lago-calima', line: 'ESCAPADA', name: 'Lago Calima', area: 'Darién', experience: 'Día de lago: kayak o paddle y almuerzo.', duration: 'Día completo', distance: '~2 h', refPrice: 230_000, note: 'Actividad acuática solo con operador certificado.' },
  { slug: 'san-cipriano', line: 'ESCAPADA', name: 'San Cipriano', area: 'Buenaventura', experience: 'Río cristalino, "brujitas" y comunidad local.', duration: 'Día completo', distance: '~2,5 h', refPrice: 240_000, note: 'Se coordina con la comunidad. Orden público de la vía por verificar.', status: 'verify' },
  { slug: 'laguna-de-sonso', line: 'ESCAPADA', name: 'Laguna de Sonso', area: 'Buga', experience: 'Humedal, aves y atardecer.', duration: 'Día completo', distance: '~1,5 h', refPrice: 190_000, note: 'Ideal para aves y desconexión.' },
  { slug: 'yotoco', line: 'ESCAPADA', name: 'Reserva Forestal de Yotoco', area: 'Yotoco', experience: 'Sendero de bosque seco tropical y monos aulladores.', duration: 'Día completo', distance: '~1,5 h', refPrice: 200_000, note: 'Combinable con Calima.' },
  // Excluido del lanzamiento (no se muestra)
  { slug: 'farallones', line: 'ESCAPADA', name: 'PNN Farallones de Cali', area: 'Cali', experience: 'Alta montaña (Pico de Loro).', duration: 'Día completo', refPrice: 0, note: 'Excluido del lanzamiento: acceso restringido y guía autorizado obligatorio.', status: 'excluded' },
];

async function main() {
  // Lugares: se crean si no existen (lo editado en /admin no se pisa).
  for (const [i, p] of PLACES.entries()) {
    await prisma.place.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, status: p.status ?? 'active', sortOrder: i },
    });
  }

  const now = new Date();
  // Admin de respaldo. En producción solo se crea si hay ADMIN_PASSWORD (nada de claves por defecto).
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
        lastName: 'AiTrava',
        passwordHash: hash,
        role: 'ADMIN',
        emailVerifiedAt: now,
        termsAcceptedAt: now,
        dataConsentAt: now,
      },
    });
  }

  // Piloto Savoraa (roadmap paso 94, decisión del 2026-11-01). Se crea en TODOS los entornos, una sola vez
  // y solo si la fecha no ha pasado: lo que el equipo edite en /admin no se vuelve a pisar.
  const savoraaStart = new Date('2026-11-01T21:00:00.000Z'); // domingo 1 de noviembre, 4:00 p. m. en Colombia
  const savoraaExists = await prisma.salida.findUnique({ where: { slug: 'duelo-de-sabores-savoraa' }, select: { id: true } });
  if (!savoraaExists && savoraaStart > now) {
    const place = await prisma.place.upsert({
      where: { slug: 'savoraa-miranda' },
      update: {},
      create: {
        slug: 'savoraa-miranda',
        line: 'URBANO',
        name: 'Savoraa, Miranda',
        area: 'Miranda, Cauca',
        experience: 'Degustación a ciegas de yogur artesanal y votación en grupo.',
        duration: '45–60 min',
        refPrice: 10_000,
        note: 'Piloto con un negocio local.',
        status: 'active',
        sortOrder: 100,
      },
    });
    const host =
      (await prisma.host.findFirst({ where: { name: 'Savoraa' } })) ??
      (await prisma.host.create({
        data: { name: 'Savoraa', activity: 'Yogur artesanal: degustación a ciegas', area: 'Miranda, Cauca', status: 'active', source: 'admin' },
      }));
    await prisma.salida.create({
      data: {
        slug: 'duelo-de-sabores-savoraa',
        placeId: place.id,
        hostId: host.id,
        title: 'Duelo de Sabores — Savoraa x AITRAVA',
        summary:
          'Una experiencia de degustación a ciegas en la que probarás dos sabores de yogur Savoraa, intentarás descubrir cuáles son y votarás junto al grupo por el ganador. No necesitas tener el parche antes de hacer el plan. Reserva tu cupo y AITRAVA arma el grupo.',
        startsAt: savoraaStart,
        durationMin: 60,
        meetingPoint: 'Miranda, Cauca. Te enviamos el punto exacto por WhatsApp al confirmar tu cupo.',
        capacity: 4,
        minToRun: 1,
        price: 10_000,
        includes: ['250 ml de degustación de yogur Savoraa', 'Dos sabores sorpresa', 'Cata y votación a ciegas', 'Dinámica grupal AITRAVA'],
        paymentUrl: 'https://checkout.nequi.wompi.co/l/jv4Sbh',
        status: 'open',
      },
    });
  }

  // Salida DEMO para mostrar el flujo en la presentación. Nunca en producción salvo SEED_DEMO=true.
  if (!isProd || process.env.SEED_DEMO === 'true') {
    const place = await prisma.place.findUniqueOrThrow({ where: { slug: 'lago-de-las-garzas' } });
    const start = new Date(now.getTime() + 9 * 86_400_000);
    start.setUTCHours(11, 30, 0, 0); // 6:30 a. m. en Cali
    await prisma.salida.upsert({
      where: { slug: 'demo-lago-de-las-garzas' },
      update: { startsAt: start, status: 'open' },
      create: {
        slug: 'demo-lago-de-las-garzas',
        placeId: place.id,
        title: 'Mañana de pausa en el Lago de las Garzas',
        summary:
          'Tres horas de movilidad suave, respiración y conversación junto al lago, con un grupo de personas que también llegan solas. Empezamos con tarjetas rompehielos y, si te animas, guardas el celular en un sobre sellado hasta el final.',
        startsAt: start,
        durationMin: 180,
        meetingPoint: 'Entrada principal del Ecoparque Lago de las Garzas, Pance',
        capacity: 8,
        minToRun: 5,
        price: 65_000,
        includes: ['Anfitrión de bienestar', 'Tarjetas rompehielos y sobre para el celular', 'Bebida al cierre', 'Un integrante del equipo presente'],
        paymentInstructions: 'DEMO: aquí van los datos de pago del anfitrión (Nequi o Bre-B) y la referencia AITRAVA-Cxx.',
        status: 'open',
        isDemo: true,
      },
    });
  }

  console.log(
    `Seed listo: ${PLACES.length} lugares` +
      `${adminPassword ? `, admin ${adminEmail}` : ', sin admin de respaldo (define ADMIN_PASSWORD)'}` +
      `${!isProd || process.env.SEED_DEMO === 'true' ? ' y una salida DEMO' : ''}.`,
  );
}

void main().finally(() => prisma.$disconnect());
