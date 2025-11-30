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
import { ShiftsService } from './shifts.service';
import { CreateShiftDto, ShiftStatus } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ApplyShiftDto, ReviewApplicationDto } from './dto/apply-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/auth.decorators';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  /**
   * Create new shift
   * POST /api/v1/shifts
   * Requires: admin, management, team_lead
   */
  @Post()
  @Roles('admin', 'management', 'team_lead')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  /**
   * Get all shifts with optional filtering
   * GET /api/v1/shifts
   * Requires: authenticated user
   */
  @Get()
  findAll(
    @Query('eventId') eventId?: string,
    @Query('status') status?: ShiftStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};
    if (eventId) filters.eventId = eventId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    return this.shiftsService.findAll(Object.keys(filters).length > 0 ? filters : undefined);
  }

  /**
   * Get my assigned shifts
   * GET /api/v1/shifts/my-shifts
   * Requires: authenticated user
   */
  @Get('my-shifts')
  getMyShifts(@GetUser('id') userId: string) {
    return this.shiftsService.getMyShifts(userId);
  }

  /**
   * Get my shift applications
   * GET /api/v1/shifts/my-applications
   * Requires: authenticated user
   */
  @Get('my-applications')
  getMyApplications(@GetUser('id') userId: string) {
    return this.shiftsService.getMyApplications(userId);
  }

  /**
   * Get available (open) shifts
   * GET /api/v1/shifts/available
   * Requires: authenticated user
   */
  @Get('available')
  getAvailableShifts(@GetUser('id') userId: string) {
    return this.shiftsService.getAvailableShifts(userId);
  }

  /**
   * Get pending applications (for management)
   * GET /api/v1/shifts/applications/pending
   * Requires: admin, management, team_lead
   */
  @Get('applications/pending')
  @Roles('admin', 'management', 'team_lead')
  getPendingApplications() {
    return this.shiftsService.getPendingApplications();
  }

  /**
   * Get shift statistics
   * GET /api/v1/shifts/stats
   * Requires: admin, management, team_lead
   */
  @Get('stats')
  @Roles('admin', 'management', 'team_lead')
  getStats() {
    return this.shiftsService.getShiftStats();
  }

  /**
   * Get single shift by ID
   * GET /api/v1/shifts/:id
   * Requires: authenticated user
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  /**
   * Get applications for specific shift
   * GET /api/v1/shifts/:id/applications
   * Requires: admin, management, team_lead
   */
  @Get(':id/applications')
  @Roles('admin', 'management', 'team_lead')
  getShiftApplications(@Param('id') id: string) {
    return this.shiftsService.getShiftApplications(id);
  }

  /**
   * Apply for shift
   * POST /api/v1/shifts/:id/apply
   * Requires: authenticated user (employee or higher)
   */
  @Post(':id/apply')
  @HttpCode(HttpStatus.CREATED)
  applyForShift(
    @Param('id') shiftId: string,
    @GetUser('id') userId: string,
    @Body() applyDto: ApplyShiftDto,
  ) {
    return this.shiftsService.apply(shiftId, userId, applyDto);
  }

  /**
   * Review application (approve/reject)
   * POST /api/v1/shifts/applications/:applicationId/review
   * Requires: admin, management, team_lead
   */
  @Post('applications/:applicationId/review')
  @Roles('admin', 'management', 'team_lead')
  @HttpCode(HttpStatus.OK)
  reviewApplication(
    @Param('applicationId') applicationId: string,
    @Body() reviewDto: ReviewApplicationDto,
    @GetUser('id') reviewedBy: string,
  ) {
    return this.shiftsService.reviewApplication(applicationId, reviewDto, reviewedBy);
  }

  /**
   * Assign shift to user
   * POST /api/v1/shifts/:id/assign
   * Requires: admin, management, team_lead
   */
  @Post(':id/assign')
  @Roles('admin', 'management', 'team_lead')
  @HttpCode(HttpStatus.OK)
  assignShift(
    @Param('id') shiftId: string,
    @Body('userId') userId: string,
    @GetUser('id') assignedBy: string,
  ) {
    return this.shiftsService.assignShift(shiftId, userId, assignedBy);
  }

  /**
   * Unassign shift
   * POST /api/v1/shifts/:id/unassign
   * Requires: admin, management, team_lead
   */
  @Post(':id/unassign')
  @Roles('admin', 'management', 'team_lead')
  @HttpCode(HttpStatus.OK)
  unassignShift(@Param('id') shiftId: string) {
    return this.shiftsService.unassignShift(shiftId);
  }

  /**
   * Cancel application
   * DELETE /api/v1/shifts/applications/:applicationId
   * Requires: authenticated user (own applications only)
   */
  @Delete('applications/:applicationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancelApplication(
    @Param('applicationId') applicationId: string,
    @GetUser('id') userId: string,
  ) {
    return this.shiftsService.cancelApplication(applicationId, userId);
  }

  /**
   * Update shift
   * PATCH /api/v1/shifts/:id
   * Requires: admin, management, team_lead
   */
  @Patch(':id')
  @Roles('admin', 'management', 'team_lead')
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  /**
   * Delete shift
   * DELETE /api/v1/shifts/:id
   * Requires: admin, management
   */
  @Delete(':id')
  @Roles('admin', 'management')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }
}
