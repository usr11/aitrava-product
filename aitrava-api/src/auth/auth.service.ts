import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { adminEmails } from '../common/config';
import { rateLimit } from '../common/rate-limit';
import { EventsService } from '../events/events.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  DeleteMeDto,
  LoginDto,
  RegisterDto,
  ResetDto,
  UpdateMeDto,
} from './auth.dto';

const VERIFY_TTL_MS = 24 * 3600_000;
const RESET_TTL_MS = 3600_000;
const RESEND_COOLDOWN_MS = 60_000;

const sha = (t: string) => createHash('sha256').update(t).digest('hex');
const newToken = () => randomBytes(32).toString('hex');

/** Lo único que sale del backend sobre un usuario (nunca el hash ni los tokens). */
export const publicUser = (u: User) => ({
  id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  role: u.role,
  emailVerified: !!u.emailVerifiedAt,
  isDemo: u.isDemo,
  createdAt: u.createdAt,
});

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private events: EventsService,
    private mail: MailService,
  ) {}

  private session(user: User) {
    return {
      token: this.jwt.sign({ sub: user.id, role: user.role }),
      user: publicUser(user),
    };
  }

  private async issueVerification(user: User) {
    const token = newToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { verifyTokenHash: sha(token), verifySentAt: new Date() },
    });
    return this.mail.sendVerification(user.email, user.firstName, token);
  }

  async register(dto: RegisterDto, ip: string) {
    rateLimit(`register:${ip}`, 10, 3600_000);
    const email = dto.email.toLowerCase().trim();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException(
        'Ya existe una cuenta con ese correo. Inicia sesión.',
      );
    }
    const now = new Date();
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        termsAcceptedAt: now,
        dataConsentAt: now,
        utmSource: dto.utmSource,
      },
    });
    await this.events.linkAnon(dto.anonId, user.id);
    await this.events.log('signup_completed', user.id, {
      utmSource: dto.utmSource ?? null,
    });
    const mail = await this.issueVerification(user);
    return { ...this.session(user), mail };
  }

  async login(dto: LoginDto, ip: string) {
    const email = dto.email.toLowerCase().trim();
    rateLimit(`login:${ip}:${email}`, 8, 10 * 60_000);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    const promoted = await this.promoteIfTeam(user);
    await this.events.linkAnon(dto.anonId, user.id);
    await this.events.log('login', user.id);
    return this.session(promoted);
  }

  /** Los correos de ADMIN_EMAILS reciben el rol admin, pero solo con el correo verificado. */
  private async promoteIfTeam(user: User) {
    if (
      user.role === 'USER' &&
      user.emailVerifiedAt &&
      adminEmails().includes(user.email)
    ) {
      return this.prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
    }
    return user;
  }

  async verify(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verifyTokenHash: sha(token) },
    });
    if (!user)
      throw new BadRequestException('El enlace no es válido o ya se usó.');
    if (
      !user.verifySentAt ||
      Date.now() - user.verifySentAt.getTime() > VERIFY_TTL_MS
    ) {
      throw new BadRequestException(
        'El enlace venció. Pide uno nuevo desde la app.',
      );
    }
    const verified = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        verifyTokenHash: null,
      },
    });
    await this.events.log('email_verified', user.id);
    return this.session(await this.promoteIfTeam(verified));
  }

  async resend(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.emailVerifiedAt)
      return { alreadyVerified: true, mail: { sent: false } };
    const wait = user.verifySentAt
      ? RESEND_COOLDOWN_MS - (Date.now() - user.verifySentAt.getTime())
      : 0;
    if (wait > 0) {
      throw new HttpException(
        {
          message: `Espera ${Math.ceil(wait / 1000)} s para reenviar el correo.`,
          retryIn: Math.ceil(wait / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return { alreadyVerified: false, mail: await this.issueVerification(user) };
  }

  /** Siempre responde lo mismo, exista o no la cuenta (no revela qué correos están registrados). */
  async forgot(emailRaw: string, ip: string) {
    rateLimit(`forgot:${ip}`, 5, 15 * 60_000);
    const email = emailRaw.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    let devLink: string | undefined;
    if (user) {
      const token = newToken();
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: sha(token),
          resetExpiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      });
      devLink = (await this.mail.sendReset(user.email, user.firstName, token))
        .devLink;
    }
    return { ok: true, mailEnabled: this.mail.enabled, devLink };
  }

  async reset(dto: ResetDto) {
    const user = await this.prisma.user.findFirst({
      where: { resetTokenHash: sha(dto.token) },
    });
    if (!user || !user.resetExpiresAt || user.resetExpiresAt < new Date()) {
      throw new BadRequestException(
        'El enlace no es válido o ya venció. Pide uno nuevo.',
      );
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.password, 10),
        resetTokenHash: null,
        resetExpiresAt: null,
        // abrir el enlace prueba que el correo es suyo
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      },
    });
    return this.session(updated);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new UnauthorizedException(
        'Tu sesión expiró. Inicia sesión de nuevo.',
      );
    return publicUser(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
      },
    });
    return publicUser(user);
  }

  /** Elimina la cuenta y todo lo suyo (viajes, Bóveda, pagos). Los eventos quedan anónimos. */
  async deleteMe(userId: string, dto: DeleteMeDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (!(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('La contraseña no coincide');
    }
    if (
      await this.prisma.payment.count({ where: { userId, status: 'approved' } })
    ) {
      // Los pagos aprobados son registros contables: se conservan sin datos personales.
      throw new BadRequestException(
        'Tienes pagos aprobados. Escríbenos a aitrava.25@gmail.com y eliminamos tu cuenta conservando solo el registro contable.',
      );
    }
    await this.prisma.event.updateMany({
      where: { userId },
      data: { userId: null },
    });
    await this.prisma.user.delete({ where: { id: userId } });
    return { ok: true };
  }
}
