import {
  Body,
  Controller,
  Delete,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser, VerifiedGuard } from '../auth/auth.guard';
import { ownTrip } from '../common/access';
import { EventsModule } from '../events/events.module';
import { EventsService } from '../events/events.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContributionDto, SavingsSetupDto } from '../trips/trips.dto';
import { TripsModule } from '../trips/trips.module';
import { TripsService } from '../trips/trips.service';
import { startOfDay } from './plan';

/**
 * Plan de ahorro inteligente. AITRAVA no recibe ni guarda dinero:
 * el usuario declara cuánto tiene y cuánto va aportando en su propia cuenta.
 */
@Injectable()
export class SavingsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
    private trips: TripsService,
  ) {}

  async upsert(userId: string, tripId: string, dto: SavingsSetupDto) {
    const trip = await ownTrip(this.prisma, userId, tripId);
    const existing = await this.prisma.savingsPlan.findUnique({
      where: { tripId },
    });
    if (existing) {
      await this.prisma.savingsPlan.update({
        where: { tripId },
        data: {
          targetAmount: dto.targetAmount,
          initialSaved: dto.initialSaved,
          frequency: dto.frequency,
          monthlyCapacity:
            dto.monthlyCapacity === undefined ? undefined : dto.monthlyCapacity,
        },
      });
    } else {
      await this.prisma.savingsPlan.create({
        data: {
          tripId,
          targetAmount: dto.targetAmount ?? trip.budgetAmount,
          initialSaved: dto.initialSaved ?? 0,
          frequency: dto.frequency ?? 'BIWEEKLY',
          monthlyCapacity: dto.monthlyCapacity ?? null,
          startDate: startOfDay(new Date()),
        },
      });
      await this.events.log(
        'savings_goal_created',
        userId,
        { frequency: dto.frequency ?? 'BIWEEKLY' },
        null,
        tripId,
      );
    }
    return this.trips.get(userId, tripId);
  }

  async remove(userId: string, tripId: string) {
    await ownTrip(this.prisma, userId, tripId);
    await this.prisma.savingsPlan.deleteMany({ where: { tripId } });
    return this.trips.get(userId, tripId);
  }

  async contribute(userId: string, tripId: string, dto: ContributionDto) {
    await ownTrip(this.prisma, userId, tripId);
    const plan = await this.prisma.savingsPlan.findUnique({
      where: { tripId },
    });
    if (!plan) throw new NotFoundException('Primero crea tu plan de ahorro');
    await this.prisma.savingsContribution.create({
      data: {
        planId: plan.id,
        amount: dto.amount,
        date: dto.date ? new Date(dto.date) : new Date(),
        note: dto.note,
      },
    });
    await this.events.log(
      'savings_contribution_added',
      userId,
      { withdrawal: dto.amount < 0 },
      null,
      tripId,
    );
    return this.trips.get(userId, tripId);
  }

  async removeContribution(userId: string, tripId: string, id: string) {
    await ownTrip(this.prisma, userId, tripId);
    const { count } = await this.prisma.savingsContribution.deleteMany({
      where: { id, plan: { tripId } },
    });
    if (!count) throw new NotFoundException('No encontramos ese aporte');
    return this.trips.get(userId, tripId);
  }
}

@Controller('trips/:id/savings')
@UseGuards(VerifiedGuard)
export class SavingsController {
  constructor(private savings: SavingsService) {}

  @Put()
  upsert(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: SavingsSetupDto,
  ) {
    return this.savings.upsert(u.sub, id, dto);
  }

  @Delete()
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.savings.remove(u.sub, id);
  }

  @Post('contributions')
  contribute(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: ContributionDto,
  ) {
    return this.savings.contribute(u.sub, id, dto);
  }

  @Delete('contributions/:cid')
  removeContribution(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('cid') cid: string,
  ) {
    return this.savings.removeContribution(u.sub, id, cid);
  }
}

@Module({
  imports: [EventsModule, TripsModule],
  controllers: [SavingsController],
  providers: [SavingsService],
})
export class SavingsModule {}
