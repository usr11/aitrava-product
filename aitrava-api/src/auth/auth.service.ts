import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

const makeReferralCode = (name: string) =>
  `${name
    .normalize('NFD')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 6)
    .toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

export const publicUser = (u: User) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  referralCode: u.referralCode,
});

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private events: EventsService,
  ) {}

  private session(user: User) {
    return {
      token: this.jwt.sign({ sub: user.id, role: user.role }),
      user: publicUser(user),
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }
    const referrer = dto.ref
      ? await this.prisma.user.findUnique({
          where: { referralCode: dto.ref.toUpperCase() },
        })
      : null;
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        referralCode: makeReferralCode(dto.name),
        referredBy: referrer?.referralCode,
        utmSource: dto.utmSource,
      },
    });
    await this.events.linkAnon(dto.anonId, user.id);
    await this.events.log('signup', user.id, {
      referred: !!referrer,
      utmSource: dto.utmSource ?? null,
    });
    return this.session(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    await this.events.linkAnon(dto.anonId, user.id);
    return this.session(user);
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return publicUser(user);
  }
}
