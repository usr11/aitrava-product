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
      throw new UnauthorizedException('Inicia sesión para continuar');
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

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AuthRequest>();
    req.user = readToken(req);
    if (!req.user) throw new UnauthorizedException();
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser | null =>
    ctx.switchToHttp().getRequest<AuthRequest>().user ?? null,
);
