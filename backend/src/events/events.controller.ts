import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';
import { EventStatus } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/auth.decorators';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Create new event
   * POST /api/v1/events
   * Requires: admin, management, team_lead
   */
  @Post()
  @Roles('admin', 'management', 'team_lead')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEventDto: CreateEventDto, @GetUser('id') userId: string) {
    return this.eventsService.create(createEventDto);
  }

  /**
   * Get all events with optional filtering
   * GET /api/v1/events
   * Requires: authenticated user
   */
  @Get()
  findAll(@Query() filterDto: FilterEventsDto) {
    return this.eventsService.findAll(filterDto);
  }

  /**
   * Get upcoming events
   * GET /api/v1/events/upcoming
   * Public endpoint
   */
  @Get('upcoming')
  @Public()
  getUpcoming(@Query('limit') limit?: number) {
    return this.eventsService.getUpcomingEvents(limit || 10);
  }

  /**
   * Get past events
   * GET /api/v1/events/past
   * Requires: authenticated user
   */
  @Get('past')
  getPast(@Query('limit') limit?: number) {
    return this.eventsService.getPastEvents(limit || 10);
  }

  /**
   * Get single event by ID
   * GET /api/v1/events/:id
   * Requires: authenticated user
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  /**
   * Get event statistics
   * GET /api/v1/events/:id/stats
   * Requires: admin, management, team_lead
   */
  @Get(':id/stats')
  @Roles('admin', 'management', 'team_lead')
  getStats(@Param('id') id: string) {
    return this.eventsService.getEventStats(id);
  }

  /**
   * Update event
   * PATCH /api/v1/events/:id
   * Requires: admin, management, team_lead
   */
  @Patch(':id')
  @Roles('admin', 'management', 'team_lead')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  /**
   * Change event status
   * PATCH /api/v1/events/:id/status
   * Requires: admin, management
   */
  @Patch(':id/status')
  @Roles('admin', 'management')
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: EventStatus,
  ) {
    return this.eventsService.changeStatus(id, status);
  }

  /**
   * Delete event
   * DELETE /api/v1/events/:id
   * Requires: admin, management
   */
  @Delete(':id')
  @Roles('admin', 'management')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
