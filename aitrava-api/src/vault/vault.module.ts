import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { Response } from 'express';
import { AuthUser, CurrentUser, VerifiedGuard } from '../auth/auth.guard';
import { hasPass, ownTrip } from '../common/access';
import { FREE_LIMITS, UPLOAD } from '../common/config';
import { EventsModule } from '../events/events.module';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';

export const VAULT_CATEGORIES = [
  'vuelos',
  'alojamiento',
  'actividades',
  'transporte',
  'seguros',
  'restaurantes',
  'otros',
];

class UploadDto {
  @IsIn(VAULT_CATEGORIES) category: string;
  @IsString() @MinLength(1) @MaxLength(120) title: string;
  @IsOptional() @IsString() bookingId?: string;
}

/** El tipo real del archivo se comprueba por sus primeros bytes, no solo por lo que dice el navegador. */
function sniff(buf: Buffer): string | null {
  if (buf.subarray(0, 4).toString('latin1') === '%PDF')
    return 'application/pdf';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return 'image/jpeg';
  if (
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return 'image/png';
  if (
    buf.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buf.subarray(8, 12).toString('latin1') === 'WEBP'
  )
    return 'image/webp';
  return null;
}

const safeName = (n: string) =>
  n
    .normalize('NFD')
    .replace(/[^\w.-]+/g, '_')
    .slice(-100) || 'documento';

@Injectable()
export class VaultService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  async upload(
    userId: string,
    tripId: string,
    dto: UploadDto,
    file?: Express.Multer.File,
  ) {
    const trip = await ownTrip(this.prisma, userId, tripId);
    if (!file) throw new BadRequestException('Elige un archivo');
    if (file.size > UPLOAD.maxBytes)
      throw new BadRequestException('El archivo pesa más de 5 MB');
    const type = sniff(file.buffer);
    if (!type || !UPLOAD.mimeTypes.includes(type)) {
      throw new BadRequestException('Solo se aceptan PDF, JPG, PNG o WEBP');
    }
    if (!hasPass(trip)) {
      const count = await this.prisma.vaultDocument.count({
        where: { tripId },
      });
      if (count >= FREE_LIMITS.vaultDocumentsPerTrip) {
        throw new ForbiddenException({
          message: `El plan gratis guarda hasta ${FREE_LIMITS.vaultDocumentsPerTrip} documentos por viaje. Activa el AITRAVA Pass para tener la Bóveda completa.`,
          code: 'PASS_REQUIRED',
        });
      }
    }
    if (
      dto.bookingId &&
      !(await this.prisma.booking.findFirst({
        where: { id: dto.bookingId, tripId },
      }))
    ) {
      throw new NotFoundException('No encontramos esa reserva');
    }
    const doc = await this.prisma.vaultDocument.create({
      data: {
        userId,
        tripId,
        bookingId: dto.bookingId || null,
        category: dto.category,
        title: dto.title.trim(),
        fileName: safeName(file.originalname),
        mimeType: type,
        size: file.size,
        data: new Uint8Array(file.buffer),
      },
      select: {
        id: true,
        category: true,
        title: true,
        fileName: true,
        mimeType: true,
        size: true,
        bookingId: true,
        createdAt: true,
      },
    });
    await this.events.log(
      'document_uploaded',
      userId,
      { category: dto.category, type },
      null,
      tripId,
    );
    return doc;
  }

  async file(userId: string, tripId: string, id: string) {
    await ownTrip(this.prisma, userId, tripId);
    const doc = await this.prisma.vaultDocument.findFirst({
      where: { id, tripId, userId },
    });
    if (!doc) throw new NotFoundException('No encontramos ese documento');
    return doc;
  }

  async remove(userId: string, tripId: string, id: string) {
    await ownTrip(this.prisma, userId, tripId);
    const { count } = await this.prisma.vaultDocument.deleteMany({
      where: { id, tripId, userId },
    });
    if (!count) throw new NotFoundException('No encontramos ese documento');
    return { ok: true };
  }
}

@Controller('trips/:id/documents')
@UseGuards(VerifiedGuard)
export class VaultController {
  constructor(private vault: VaultService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: UPLOAD.maxBytes + 1, files: 1 },
    }),
  )
  upload(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UploadDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.vault.upload(u.sub, id, dto, file);
  }

  /** Solo el dueño, con su sesión. No hay URLs públicas: la app lo abre como blob. */
  @Get(':docId/file')
  async file(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Res() res: Response,
  ) {
    const doc = await this.vault.file(u.sub, id, docId);
    res.set({
      'Content-Type': doc.mimeType,
      'Content-Length': String(doc.size),
      'Content-Disposition': `inline; filename="${doc.fileName}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(Buffer.from(doc.data));
  }

  @Delete(':docId')
  remove(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('docId') docId: string,
  ) {
    return this.vault.remove(u.sub, id, docId);
  }
}

@Module({
  imports: [EventsModule],
  controllers: [VaultController],
  providers: [VaultService],
})
export class VaultModule {}
