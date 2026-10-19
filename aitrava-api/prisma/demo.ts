/**
 * Prepara la cuenta DEMO (demo@aitrava.co) para la presentación. Se corre con `pnpm db:demo`.
 * Borra los viajes de la cuenta demo y crea dos, ambos marcados isDemo (no cuentan en métricas):
 *  1. "Mi viaje a España" (Madrid + Barcelona): empezó hace 2 días → Mi Viaje y Modo Viaje (día 3 de 7),
 *     con reservas, documentos de ejemplo en la Bóveda (incluido un QR), presupuesto, gastos y un
 *     plan de ahorro ya cumplido.
 *  2. "Japón 2027": meta de ahorro en curso (35 %), para mostrar el plan de ahorro inteligente.
 * Todos los documentos dicen "DEMO — documento de ejemplo". No toca a otros usuarios.
 */
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

const prisma = new PrismaClient();

const DAY = 86_400_000;
const today = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
};
/** Fecha "hora local del destino" guardada como UTC (ver schema.prisma). */
const at = (base: Date, dayOffset: number, hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(base.getTime() + dayOffset * DAY + (h * 60 + m) * 60_000);
};

const demoPdf = (title: string, lines: string[]) =>
  new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ size: 'A5', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fillColor('#D64545').fontSize(10).text('DEMO — documento de ejemplo, no es válido para viajar');
    doc.moveDown();
    doc.fillColor('#0B1F3A').fontSize(18).text(title);
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#333333');
    for (const l of lines) doc.text(l);
    doc.end();
  });

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@aitrava.co' } });
  if (!user) throw new Error('Primero corre `pnpm db:seed` (crea demo@aitrava.co).');
  await prisma.trip.deleteMany({ where: { userId: user.id } });

  // ── 1. España (en curso) ────────────────────────────────────────────────
  const start = new Date(today().getTime() - 2 * DAY);
  const end = new Date(start.getTime() + 6 * DAY);
  const spain = await prisma.trip.create({
    data: {
      userId: user.id,
      title: 'Mi viaje a España',
      mode: 'KNOWN',
      destinationCity: 'Madrid y Barcelona',
      destinationCountry: 'España',
      originCity: 'Bogotá',
      startDate: start,
      endDate: end,
      travelerCount: 2,
      budgetAmount: 18_000_000,
      budgetByCategory: {
        transporte: 7_600_000,
        alojamiento: 4_800_000,
        actividades: 1_600_000,
        comida: 2_600_000,
        seguros: 400_000,
        otros: 1_000_000,
      },
      preferences: { likes: ['cultura', 'comida'], avoid: [], style: 'equilibrado' },
      isDemo: true,
    },
  });

  const b = async (data: Record<string, unknown>) =>
    prisma.booking.create({ data: { tripId: spain.id, source: 'externa', isPaid: true, ...data } as never });

  const flightIn = await b({ category: 'vuelo', title: 'Vuelo Bogotá → Madrid', provider: 'Avianca', reference: 'DEMO-AV026', startAt: at(start, 0, '10:45'), cost: 3_600_000, address: 'Aeropuerto Adolfo Suárez Madrid-Barajas, T4' });
  const flightOut = await b({ category: 'vuelo', title: 'Vuelo Barcelona → Bogotá', provider: 'Avianca', reference: 'DEMO-AV011', startAt: at(start, 6, '12:30'), cost: 3_400_000, address: 'Aeropuerto Josep Tarradellas Barcelona-El Prat, T1' });
  const hotelMad = await b({ category: 'alojamiento', title: 'Hotel Riu Plaza España', provider: 'Booking.com', reference: 'DEMO-BK-55821', startAt: at(start, 0, '15:00'), endAt: at(start, 3, '12:00'), cost: 2_600_000, address: 'Calle Gran Vía, 84, Madrid' });
  const hotelBcn = await b({ category: 'alojamiento', title: 'Apartamento en el Eixample', provider: 'Airbnb', reference: 'DEMO-HM4T2X', startAt: at(start, 3, '15:00'), endAt: at(start, 6, '10:00'), cost: 2_100_000, address: 'Carrer de Mallorca, 250, Barcelona' });
  const prado = await b({ category: 'actividad', title: 'Museo del Prado · 2 entradas', provider: 'Museo del Prado', reference: 'DEMO-PRADO-4821', startAt: at(start, 2, '10:30'), cost: 140_000, address: 'Paseo del Prado, s/n, Madrid' });
  const sagrada = await b({ category: 'actividad', title: 'Sagrada Família · 2 entradas', provider: 'Civitatis', reference: 'DEMO-SF-9930', startAt: at(start, 4, '11:00'), cost: 260_000, address: 'Carrer de Mallorca, 401, Barcelona' });
  const train = await b({ category: 'transporte', title: 'Tren AVE Madrid → Barcelona', provider: 'Renfe', reference: 'DEMO-RENFE-7781', startAt: at(start, 3, '09:00'), endAt: at(start, 3, '11:30'), cost: 600_000, address: 'Estación de Madrid Puerta de Atocha' });
  const botin = await b({ category: 'restaurante', title: 'Cena en Sobrino de Botín', provider: 'Reserva directa', reference: 'DEMO-MESA-20H', startAt: at(start, 2, '20:00'), cost: 320_000, isPaid: false, address: 'Calle de Cuchilleros, 17, Madrid' });
  const seguro = await b({ category: 'seguro', title: 'Seguro de viaje Schengen', provider: 'Assist Card', reference: 'DEMO-AC-120044', startAt: start, endAt: end, cost: 380_000 });

  type It = [number, string, string, string, string?, number?, number?, string?];
  const items: It[] = [
    // [día, hora, tipo, título, lugar, lat, lng, bookingId]
    [0, '10:45', 'transporte', 'Llegada a Madrid (AV026)', 'Aeropuerto de Barajas T4', 40.4919, -3.5936, flightIn.id],
    [0, '15:00', 'alojamiento', 'Check-in Hotel Riu Plaza España', 'Gran Vía, 84', 40.4237, -3.7122, hotelMad.id],
    [0, '19:30', 'actividad', 'Atardecer en el Templo de Debod', 'Templo de Debod', 40.424, -3.7178],
    [1, '10:00', 'actividad', 'Palacio Real', 'Palacio Real de Madrid', 40.4179, -3.7143],
    [1, '13:30', 'comida', 'Almuerzo en La Latina', 'Calle de la Cava Baja', 40.4116, -3.7088],
    [1, '17:00', 'actividad', 'Parque del Retiro', 'Parque del Retiro', 40.4153, -3.6845],
    [2, '08:30', 'comida', 'Desayuno', 'Hotel Riu Plaza España', 40.4237, -3.7122],
    [2, '10:30', 'actividad', 'Museo del Prado', 'Museo del Prado', 40.4138, -3.6921, prado.id],
    [2, '13:30', 'comida', 'Almuerzo en el Mercado de San Miguel', 'Mercado de San Miguel', 40.4154, -3.709],
    [2, '16:00', 'libre', 'Tiempo libre', 'Puerta del Sol', 40.4169, -3.7035],
    [2, '20:00', 'restaurante', 'Cena en Sobrino de Botín', 'Sobrino de Botín', 40.414, -3.708, botin.id],
    [3, '09:00', 'transporte', 'Tren AVE a Barcelona', 'Estación de Atocha', 40.4065, -3.6895, train.id],
    [3, '15:00', 'alojamiento', 'Check-in apartamento Eixample', 'Carrer de Mallorca, 250', 41.3936, 2.1615, hotelBcn.id],
    [3, '18:00', 'actividad', 'Paseo por el Barrio Gótico', 'Barri Gòtic', 41.3833, 2.1777],
    [4, '11:00', 'actividad', 'Sagrada Família', 'Basílica de la Sagrada Família', 41.4036, 2.1744, sagrada.id],
    [4, '16:00', 'actividad', 'Park Güell', 'Park Güell', 41.4145, 2.1527],
    [5, '11:00', 'actividad', 'Playa de la Barceloneta', 'Barceloneta', 41.3784, 2.1925],
    [5, '19:00', 'actividad', 'Atardecer en Montjuïc', 'Montjuïc', 41.3636, 2.1586],
    [6, '12:30', 'transporte', 'Vuelo de regreso (AV011)', 'Aeropuerto de El Prat T1', 41.2974, 2.0833, flightOut.id],
  ];
  for (const [day, hhmm, type, title, locationName, latitude, longitude, bookingId] of items) {
    await prisma.itineraryItem.create({
      data: { tripId: spain.id, type, title, startAt: at(start, day, hhmm), locationName, latitude, longitude, bookingId },
    });
  }

  const docs: [string, string, string, string, Buffer][] = [
    ['vuelo', 'Tiquete Bogotá → Madrid', 'tiquete-av026.pdf', flightIn.id, await demoPdf('Tiquete electrónico AV026', ['Bogotá (BOG) → Madrid (MAD)', 'Reserva: DEMO-AV026', 'Pasajeros: 2'])],
    ['alojamiento', 'Reserva Hotel Riu Plaza España', 'reserva-riu.pdf', hotelMad.id, await demoPdf('Confirmación de reserva', ['Hotel Riu Plaza España', 'Reserva: DEMO-BK-55821', '3 noches · 2 huéspedes'])],
    ['seguros', 'Póliza de seguro de viaje', 'poliza-assist.pdf', seguro.id, await demoPdf('Seguro de viaje', ['Póliza: DEMO-AC-120044', 'Cobertura Schengen'])],
  ];
  for (const [category, title, fileName, bookingId, data] of docs) {
    await prisma.vaultDocument.create({ data: { userId: user.id, tripId: spain.id, bookingId, category, title, fileName, mimeType: 'application/pdf', size: data.length, data: new Uint8Array(data) } });
  }
  const qr = await QRCode.toBuffer('DEMO-PRADO-4821 · AITRAVA DEMO', { width: 600, margin: 2 });
  await prisma.vaultDocument.create({ data: { userId: user.id, tripId: spain.id, bookingId: prado.id, category: 'actividades', title: 'QR entrada Museo del Prado', fileName: 'qr-prado.png', mimeType: 'image/png', size: qr.length, data: new Uint8Array(qr) } });

  const expenses: [number, string, string, number][] = [
    [0, 'transporte', 'Taxi aeropuerto → hotel', 150_000],
    [0, 'comida', 'Cena de tapas', 210_000],
    [1, 'comida', 'Almuerzo en La Latina', 180_000],
    [1, 'transporte', 'Metro (abono 10 viajes)', 60_000],
    [1, 'otros', 'Recuerdos', 95_000],
  ];
  for (const [day, category, description, amount] of expenses) {
    await prisma.expense.create({ data: { tripId: spain.id, category, description, amount, date: new Date(start.getTime() + day * DAY) } });
  }

  // Plan de ahorro de España: empezó 8 meses antes y ya está cumplido.
  const spainPlanStart = new Date(start.getTime() - 240 * DAY);
  const spainPlan = await prisma.savingsPlan.create({
    data: { tripId: spain.id, targetAmount: 18_000_000, initialSaved: 4_000_000, frequency: 'BIWEEKLY', monthlyCapacity: 1_800_000, startDate: spainPlanStart },
  });
  for (let i = 0; i < 16; i++) {
    await prisma.savingsContribution.create({ data: { planId: spainPlan.id, amount: 875_000, date: new Date(spainPlanStart.getTime() + i * 15 * DAY), note: i === 0 ? 'Primera quincena' : null } });
  }

  // ── 2. Japón 2027 (meta de ahorro en curso) ─────────────────────────────
  const now = today();
  const jpStart = new Date(Date.UTC(now.getUTCFullYear() + 1, 9, 10));
  const japan = await prisma.trip.create({
    data: {
      userId: user.id,
      title: `Japón ${jpStart.getUTCFullYear()}`,
      mode: 'KNOWN',
      destinationCity: 'Tokio',
      destinationCountry: 'Japón',
      originCity: 'Bogotá',
      startDate: jpStart,
      endDate: new Date(jpStart.getTime() + 14 * DAY),
      travelerCount: 1,
      budgetAmount: 12_000_000,
      budgetByCategory: { transporte: 5_400_000, alojamiento: 3_000_000, actividades: 1_200_000, comida: 1_500_000, seguros: 300_000, otros: 600_000 },
      preferences: { likes: ['cultura', 'comida'], avoid: [], style: 'equilibrado' },
      isDemo: true,
    },
  });
  const jpPlanStart = new Date(now.getTime() - 150 * DAY);
  const jpPlan = await prisma.savingsPlan.create({
    data: { tripId: japan.id, targetAmount: 12_000_000, initialSaved: 1_600_000, frequency: 'MONTHLY', monthlyCapacity: 700_000, startDate: jpPlanStart },
  });
  for (const [i, amount] of [500_000, 550_000, 500_000, 550_000, 500_000].entries()) {
    await prisma.savingsContribution.create({ data: { planId: jpPlan.id, amount, date: new Date(jpPlanStart.getTime() + (i + 1) * 30 * DAY) } });
  }

  console.log(`Demo lista para ${user.email}: "${spain.title}" (día 3 de 7, Modo Viaje) y "${japan.title}" (meta de ahorro 35 %).`);
}

void main().finally(() => prisma.$disconnect());
