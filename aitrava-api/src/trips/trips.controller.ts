import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser, VerifiedGuard } from '../auth/auth.guard';
import {
  BookingDto,
  BookingPatchDto,
  CreateTripDto,
  ExpenseDto,
  ItemDto,
  ItemPatchDto,
  SuggestQueryDto,
  UpdateTripDto,
} from './trips.dto';
import { TripsService } from './trips.service';

/** Públicos: inspiración y sugerencias (el wizard se puede llenar antes de crear la cuenta). */
@Controller()
export class DestinationsController {
  constructor(private trips: TripsService) {}

  @Get('destinations')
  destinations(@Query('featured') featured?: string) {
    return this.trips.destinations(featured === 'true');
  }

  @Get('suggestions')
  suggest(@Query() q: SuggestQueryDto) {
    return this.trips.suggest(q);
  }
}

@Controller('trips')
@UseGuards(VerifiedGuard)
export class TripsController {
  constructor(private trips: TripsService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    return this.trips.list(u.sub);
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateTripDto) {
    return this.trips.create(u.sub, dto);
  }

  @Get(':id')
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.trips.get(u.sub, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateTripDto,
  ) {
    return this.trips.update(u.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.trips.remove(u.sub, id);
  }

  @Post(':id/items')
  addItem(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: ItemDto,
  ) {
    return this.trips.addItem(u.sub, id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: ItemPatchDto,
  ) {
    return this.trips.updateItem(u.sub, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.trips.removeItem(u.sub, id, itemId);
  }

  @Post(':id/bookings')
  addBooking(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: BookingDto,
  ) {
    return this.trips.addBooking(u.sub, id, dto);
  }

  @Patch(':id/bookings/:bookingId')
  updateBooking(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('bookingId') bid: string,
    @Body() dto: BookingPatchDto,
  ) {
    return this.trips.updateBooking(u.sub, id, bid, dto);
  }

  @Delete(':id/bookings/:bookingId')
  removeBooking(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('bookingId') bid: string,
  ) {
    return this.trips.removeBooking(u.sub, id, bid);
  }

  @Post(':id/expenses')
  addExpense(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Body() dto: ExpenseDto,
  ) {
    return this.trips.addExpense(u.sub, id, dto);
  }

  @Delete(':id/expenses/:expenseId')
  removeExpense(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('expenseId') eid: string,
  ) {
    return this.trips.removeExpense(u.sub, id, eid);
  }
}
