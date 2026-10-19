import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { existsSync } from 'fs';
import { join } from 'path';
import PDFDocument from 'pdfkit';
import { hasPass, ownTrip } from '../common/access';
import { passPrice, paymentUrl } from '../common/config';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';

const OPEN: PaymentStatus[] = [
  'created',
  'redirected',
  'pending',
  'pending_verification',
  'unknown',
];
const DAY = 86_400_000;

const newReference = () => `AT-${randomBytes(4).toString('hex').toUpperCase()}`;

export const formatCOP = (n: number) =>
  `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n)} COP`;

type WompiEvent = {
  event?: string;
  data?: { transaction?: Record<string, unknown> };
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  private view<T extends { status: PaymentStatus }>(p: T) {
    return { ...p, isPaid: p.status === 'approved' };
  }

  /** Crea (o reutiliza) el pago del Pass de un viaje. No cobra nada: el cobro lo hace Wompi. */
  async checkout(userId: string, tripId: string) {
    const trip = await ownTrip(this.prisma, userId, tripId);
    if (trip.isDemo) {
      throw new BadRequestException(
        'Este es un viaje DEMO: el Pass ya está incluido para la demostración y no se cobra.',
      );
    }
    if (hasPass(trip))
      throw new ConflictException(
        'Este viaje ya tiene el AITRAVA Pass activo.',
      );
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    let payment = await this.prisma.payment.findFirst({
      where: {
        tripId,
        userId,
        status: { in: ['created', 'redirected'] },
        createdAt: { gt: new Date(Date.now() - DAY) },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (payment && payment.amount !== passPrice()) payment = null;
    payment ??= await this.prisma.payment.create({
      data: { reference: newReference(), userId, tripId, amount: passPrice() },
    });
    return {
      payment: this.view(payment),
      paymentUrl: paymentUrl(),
      trip: {
        id: trip.id,
        title: trip.title,
        destinationCity: trip.destinationCity,
        destinationCountry: trip.destinationCountry,
        startDate: trip.startDate,
      },
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: !!user.emailVerifiedAt,
      },
    };
  }

  private async own(userId: string, id: string) {
    const p = await this.prisma.payment.findFirst({
      where: { id, userId },
      include: { trip: true },
    });
    if (!p) throw new NotFoundException('No encontramos ese pago');
    return p;
  }

  /** El usuario presionó "Activar AITRAVA Pass" y se abre Wompi. */
  async redirect(userId: string, id: string) {
    const p = await this.own(userId, id);
    if (p.status === 'created') {
      await this.prisma.payment.update({
        where: { id },
        data: { status: 'redirected' },
      });
    }
    await this.events.log(
      'wompi_redirected',
      userId,
      { reference: p.reference },
      null,
      p.tripId,
    );
    return { paymentUrl: paymentUrl(), reference: p.reference };
  }

  /**
   * El usuario volvió de Wompi y cuenta qué pasó. Volver NO significa que pagó:
   * "ya pagué" queda en verificación hasta que Wompi (webhook) o un admin lo confirme.
   */
  async reportReturn(
    userId: string,
    id: string,
    result: 'paid' | 'cancelled' | 'failed',
    note?: string,
  ) {
    const p = await this.own(userId, id);
    if (p.status === 'approved') return this.view(p);
    const status: PaymentStatus =
      result === 'paid'
        ? 'pending_verification'
        : result === 'cancelled'
          ? 'cancelled'
          : 'declined';
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status, userNote: note?.slice(0, 200) ?? p.userNote },
    });
    if (status === 'pending_verification')
      await this.events.log(
        'payment_pending',
        userId,
        { via: 'usuario' },
        null,
        p.tripId,
      );
    if (status === 'declined')
      await this.events.log(
        'payment_declined',
        userId,
        { via: 'usuario' },
        null,
        p.tripId,
      );
    return this.view(updated);
  }

  async get(userId: string, id: string) {
    const p = await this.own(userId, id);
    return this.view(p);
  }

  async mine(userId: string) {
    const list = await this.prisma.payment.findMany({
      where: { userId },
      include: { trip: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((p) => this.view(p));
  }

  /** Aprueba un pago y activa el Pass del viaje. Solo lo llaman el webhook verificado o un admin. */
  async approve(
    id: string,
    via: 'webhook' | 'admin',
    by?: string,
    providerTxId?: string,
  ) {
    const p = await this.prisma.payment.findUnique({
      where: { id },
      include: { trip: true },
    });
    if (!p) throw new NotFoundException('No encontramos ese pago');
    if (p.status === 'approved') return this.view(p);
    const updated = await this.prisma.$transaction(async (tx) => {
      const pay = await tx.payment.update({
        where: { id },
        data: {
          status: 'approved',
          verifiedVia: via,
          verifiedBy: by,
          verifiedAt: new Date(),
          providerTxId: providerTxId ?? p.providerTxId,
        },
      });
      const existing = await tx.pass.findUnique({
        where: { tripId: p.tripId },
      });
      if (!existing) {
        await tx.pass.create({
          data: {
            userId: p.userId,
            tripId: p.tripId,
            paymentId: id,
            expiresAt: new Date(p.trip.endDate.getTime() + 30 * DAY),
          },
        });
      }
      return pay;
    });
    await this.events.log(
      'payment_approved',
      p.userId,
      { via, amount: p.amount },
      null,
      p.tripId,
    );
    return this.view(updated);
  }

  async decline(
    id: string,
    via: 'webhook' | 'admin',
    by?: string,
    status: PaymentStatus = 'declined',
  ) {
    const p = await this.prisma.payment.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('No encontramos ese pago');
    if (p.status === 'approved')
      throw new BadRequestException('Ese pago ya está aprobado');
    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        status,
        verifiedVia: via,
        verifiedBy: by,
        verifiedAt: new Date(),
      },
    });
    await this.events.log(
      'payment_declined',
      p.userId,
      { via },
      null,
      p.tripId,
    );
    return this.view(updated);
  }

  // ── Webhook de Wompi ──────────────────────────────────────────────────

  /**
   * Verifica la firma del evento según la documentación de Wompi:
   * SHA256(valores de signature.properties concatenados + timestamp + secreto de eventos).
   */
  private validSignature(body: WompiEvent) {
    const secret = process.env.WOMPI_EVENTS_SECRET;
    if (
      !secret ||
      !body.signature?.properties ||
      !body.signature.checksum ||
      !body.timestamp
    )
      return false;
    const values = body.signature.properties.map((path) =>
      path
        .split('.')
        .reduce<unknown>(
          (o, k) => (o as Record<string, unknown> | undefined)?.[k],
          body.data,
        ),
    );
    const expected = createHash('sha256')
      .update(
        values
          .map((v) =>
            typeof v === 'string' ||
            typeof v === 'number' ||
            typeof v === 'boolean'
              ? String(v)
              : '',
          )
          .join('') +
          String(body.timestamp) +
          secret,
      )
      .digest('hex');
    const got = body.signature.checksum.toLowerCase();
    return (
      got.length === expected.length &&
      timingSafeEqual(Buffer.from(got), Buffer.from(expected))
    );
  }

  async webhook(body: WompiEvent) {
    const str = (v: unknown) =>
      typeof v === 'string' || typeof v === 'number' ? String(v) : '';
    if (!process.env.WOMPI_EVENTS_SECRET) {
      throw new ForbiddenException(
        'El webhook de Wompi no está configurado (falta WOMPI_EVENTS_SECRET).',
      );
    }
    if (!this.validSignature(body))
      throw new UnauthorizedException('Firma inválida');
    const tx = body.data?.transaction;
    if (body.event !== 'transaction.updated' || !tx)
      return { ok: true, ignored: true };

    const txId = str(tx.id);
    const status = str(tx.status);
    const amount = Math.round(Number(tx.amount_in_cents ?? 0) / 100);
    const email = str(tx.customer_email).toLowerCase();
    const reference = str(tx.reference);

    // 1) por id de transacción ya visto, 2) por nuestra referencia, 3) por correo + valor (links de pago).
    let payment =
      (txId &&
        (await this.prisma.payment.findFirst({
          where: { providerTxId: txId },
        }))) ||
      (reference &&
        (await this.prisma.payment.findUnique({ where: { reference } }))) ||
      null;
    if (!payment && email) {
      payment = await this.prisma.payment.findFirst({
        where: { status: { in: OPEN }, amount, user: { email } },
        orderBy: { createdAt: 'asc' },
      });
    }
    if (!payment) {
      this.logger.warn(
        `Evento de Wompi sin pago asociado: tx ${txId} (${status}).`,
      );
      await this.events.log('wompi_unmatched', null, { txId, status, amount });
      return { ok: true, matched: false };
    }
    if (status === 'APPROVED')
      await this.approve(payment.id, 'webhook', 'wompi', txId);
    else if (['DECLINED', 'VOIDED', 'ERROR'].includes(status)) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { providerTxId: txId },
      });
      await this.decline(
        payment.id,
        'webhook',
        'wompi',
        status === 'ERROR' ? 'error' : 'declined',
      );
    } else if (status === 'PENDING') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'pending', providerTxId: txId },
      });
    }
    return { ok: true, matched: true };
  }

  // ── Comprobante PDF ───────────────────────────────────────────────────

  /** Solo existe si el pago está APROBADO. No es factura electrónica. */
  async receipt(requester: { sub: string; role: string }, id: string) {
    const p = await this.prisma.payment.findUnique({
      where: { id },
      include: { user: true, trip: true },
    });
    if (!p || (p.userId !== requester.sub && requester.role !== 'ADMIN'))
      throw new NotFoundException('No encontramos ese pago');
    if (p.status !== 'approved')
      throw new ForbiddenException(
        'El comprobante solo está disponible cuando el pago está aprobado.',
      );
    if (p.userId === requester.sub)
      await this.events.log(
        'receipt_downloaded',
        p.userId,
        undefined,
        null,
        p.tripId,
      );

    const pdf = await new Promise<Buffer>((resolve) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 56,
        info: { Title: `Comprobante ${p.reference}`, Author: 'AITRAVA' },
      });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      const navy = '#0B1F3A';
      const muted = '#5B6B82';
      const logo = join(process.cwd(), 'assets', 'logo.jpg');
      if (existsSync(logo)) doc.image(logo, 56, 50, { fit: [56, 56] });
      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(20)
        .text('AITRAVA', 124, 60);
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(muted)
        .text('Tu viaje vive aquí', 124, 84);
      doc.moveTo(56, 124).lineTo(539, 124).strokeColor('#E3E8F0').stroke();
      doc
        .fillColor(navy)
        .font('Helvetica-Bold')
        .fontSize(22)
        .text('Comprobante de pago', 56, 148);
      doc.roundedRect(56, 186, 120, 26, 13).fill('#14A06B');
      doc
        .fillColor('#FFFFFF')
        .fontSize(11)
        .text('APROBADO', 56, 194, { width: 120, align: 'center' });

      const fmt = (d: Date) =>
        new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: 'America/Bogota',
        }).format(d);
      const rows: [string, string][] = [
        ['Referencia', p.reference],
        ['Fecha', fmt(p.verifiedAt ?? p.updatedAt)],
        ['Usuario', `${p.user.firstName} ${p.user.lastName}`],
        ['Correo', p.user.email],
        ['Producto', 'AITRAVA Pass'],
        [
          'Viaje asociado',
          `${p.trip.title} · ${p.trip.destinationCity}, ${p.trip.destinationCountry}`,
        ],
        ['Medio', 'Pago procesado mediante Wompi'],
        ['Valor', formatCOP(p.amount)],
        ['Estado', 'APROBADO'],
      ];
      let y = 236;
      for (const [k, v] of rows) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(muted)
          .text(k.toUpperCase(), 56, y);
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(navy)
          .text(v, 200, y - 1, { width: 339 });
        y += 30;
      }
      doc
        .moveTo(56, y + 6)
        .lineTo(539, y + 6)
        .strokeColor('#E3E8F0')
        .stroke();
      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(muted)
        .text(
          'Este comprobante corresponde exclusivamente al AITRAVA Pass y no representa el pago de vuelos, hoteles u otros servicios turísticos. ' +
            'No es una factura electrónica. AITRAVA es un proyecto universitario en desarrollo. Contacto: aitrava.25@gmail.com',
          56,
          y + 22,
          { width: 483, lineGap: 3 },
        );
      doc.end();
    });
    return { pdf, fileName: `comprobante-${p.reference}.pdf` };
  }
}
