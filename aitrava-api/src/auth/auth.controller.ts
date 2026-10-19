import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  DeleteMeDto,
  ForgotDto,
  LoginDto,
  RegisterDto,
  ResetDto,
  TokenDto,
  UpdateMeDto,
} from './auth.dto';
import { AuthGuard, AuthUser, CurrentUser, clientIp } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @clientIp() ip: string) {
    return this.auth.register(dto, ip);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @clientIp() ip: string) {
    return this.auth.login(dto, ip);
  }

  @Post('verify')
  @HttpCode(200)
  verify(@Body() dto: TokenDto) {
    return this.auth.verify(dto.token);
  }

  @Post('resend')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  resend(@CurrentUser() user: AuthUser) {
    return this.auth.resend(user.sub);
  }

  @Post('forgot')
  @HttpCode(200)
  forgot(@Body() dto: ForgotDto, @clientIp() ip: string) {
    return this.auth.forgot(dto.email, ip);
  }

  @Post('reset')
  @HttpCode(200)
  reset(@Body() dto: ResetDto) {
    return this.auth.reset(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.sub);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(user.sub, dto);
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  deleteMe(@CurrentUser() user: AuthUser, @Body() dto: DeleteMeDto) {
    return this.auth.deleteMe(user.sub, dto);
  }
}
