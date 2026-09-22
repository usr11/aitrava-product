import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { AdminGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

class IterationDto {
  @IsString() version: string;
  @IsDateString() date: string;
  @IsString() hypothesis: string;
  @IsString() metric: string;
  @IsString() result: string;
  @IsString() decision: string;
  @IsString() change: string;
}

class IterationPatchDto {
  @IsOptional() @IsString() version?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsString() hypothesis?: string;
  @IsOptional() @IsString() metric?: string;
  @IsOptional() @IsString() result?: string;
  @IsOptional() @IsString() decision?: string;
  @IsOptional() @IsString() change?: string;
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private admin: AdminService,
    private prisma: PrismaService,
  ) {}

  @Get('metrics')
  metrics() {
    return this.admin.metrics();
  }

  @Get('feedback')
  feedback() {
    return this.admin.feedback();
  }

  @Get('users')
  users() {
    return this.admin.users();
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="aitrava-eventos.csv"')
  export() {
    return this.admin.eventsCsv();
  }

  @Get('iterations')
  iterations() {
    return this.prisma.iteration.findMany({ orderBy: { date: 'asc' } });
  }

  @Post('iterations')
  createIteration(@Body() dto: IterationDto) {
    return this.prisma.iteration.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  @Patch('iterations/:id')
  updateIteration(@Param('id') id: string, @Body() dto: IterationPatchDto) {
    return this.prisma.iteration.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  @Delete('iterations/:id')
  deleteIteration(@Param('id') id: string) {
    return this.prisma.iteration.delete({ where: { id } });
  }
}
