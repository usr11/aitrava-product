import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export type AuthUser = { sub: string; role: 'USER' | 'ADMIN' };
type AuthRequest = Request & { user?: AuthUser | null };

const readToken = (req: AuthRequest): AuthUser | null => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return new JwtService({ secret: process.env.JWT_SECRET }).verify<AuthUser>(
      header.slice(7),
    );
  } catch {
    return null;
  }
};

/** Exige sesión. */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    req.user = readToken(req);
    if (!req.user)
      throw new UnauthorizedException(
        'Tu sesión expiró. Inicia sesión de nuevo.',
      );
    return true;
  }
}

/** Sesión opcional: si hay token válido lo deja en req.user. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    req.user = readToken(req);
    return true;
  }
}

/** Solo admins. El rol se confirma en la BD (un token viejo no basta si le quitaron el rol). */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    const token = readToken(req);
    if (!token) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({
      where: { id: token.sub },
      select: { id: true, role: true },
    });
    if (user?.role !== 'ADMIN') throw new ForbiddenException();
    req.user = { sub: user.id, role: user.role };
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser | null =>
    ctx.switchToHttp().getRequest<AuthRequest>().user ?? null,
);

export const clientIp = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const fwd = req.headers['x-forwarded-for'];
    return (
      (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0].trim() ?? req.ip ?? 'x'
    );
  },
);
