import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Between } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { ShiftApplication } from './entities/shift-application.entity';
import { CreateShiftDto, ShiftStatus } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ApplyShiftDto, ApplicationStatus, ReviewApplicationDto } from './dto/apply-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    @InjectRepository(ShiftApplication)
    private applicationsRepository: Repository<ShiftApplication>,
  ) {}

  /**
   * Create new shift
   */
  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const shift = this.shiftsRepository.create(createShiftDto);
    return this.shiftsRepository.save(shift);
  }

  /**
   * Find all shifts with optional filtering
   */
  async findAll(filters?: {
    eventId?: string;
    status?: ShiftStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Shift[]> {
    const query = this.shiftsRepository.createQueryBuilder('shift')
      .leftJoinAndSelect('shift.event', 'event')
      .leftJoinAndSelect('shift.assignedUser', 'assignedUser')
      .leftJoinAndSelect('shift.applications', 'applications');

    if (filters?.eventId) {
      query.andWhere('shift.eventId = :eventId', { eventId: filters.eventId });
    }

    if (filters?.status) {
      query.andWhere('shift.status = :status', { status: filters.status });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('shift.shiftDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query
      .orderBy('shift.shiftDate', 'ASC')
      .addOrderBy('shift.startTime', 'ASC')
      .getMany();
  }

  /**
   * Find one shift by ID
   */
  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: ['event', 'assignedUser', 'applications', 'applications.user'],
    });
    
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    
    return shift;
  }

  /**
   * Update shift
   */
  async update(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findOne(id);
    
    await this.shiftsRepository.update(id, updateShiftDto);
    
    return this.findOne(id);
  }

  /**
   * Delete shift
   */
  async remove(id: string): Promise<void> {
    const shift = await this.findOne(id);
    await this.shiftsRepository.delete(id);
  }

  /**
   * Apply for shift
   */
  async apply(shiftId: string, userId: string, applyDto: ApplyShiftDto): Promise<ShiftApplication> {
    const shift = await this.findOne(shiftId);

    // Check if shift is open
    if (shift.status !== ShiftStatus.OPEN) {
      throw new BadRequestException('This shift is not open for applications');
    }

    // Check if already applied
    const existing = await this.applicationsRepository.findOne({
      where: { shiftId, userId },
    });

    if (existing) {
      throw new BadRequestException('You have already applied for this shift');
    }

    // Check if shift is in the future
    const shiftDateTime = new Date(shift.shiftDate);
    if (shiftDateTime < new Date()) {
      throw new BadRequestException('Cannot apply for past shifts');
    }

    const application = this.applicationsRepository.create({
      shiftId,
      userId,
      priority: applyDto.priority,
      notes: applyDto.notes,
      status: ApplicationStatus.PENDING,
    });

    return this.applicationsRepository.save(application);
  }

  /**
   * Review application (approve/reject)
   */
  async reviewApplication(
    applicationId: string,
    reviewDto: ReviewApplicationDto,
    reviewedBy: string,
  ): Promise<ShiftApplication> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['shift', 'user'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application has already been reviewed');
    }

    application.status = reviewDto.status as ApplicationStatus;
    application.reviewedBy = reviewedBy;
    application.reviewedAt = new Date();
    application.reviewNotes = reviewDto.reviewNotes;

    await this.applicationsRepository.save(application);

    // If approved, assign shift
    if (reviewDto.status === ApplicationStatus.APPROVED) {
      await this.assignShift(application.shiftId, application.userId, reviewedBy);
    }

    return this.applicationsRepository.findOne({
      where: { id: applicationId },
      relations: ['shift', 'user'],
    });
  }

  /**
   * Assign shift to user (auto-approve application if exists)
   */
  async assignShift(shiftId: string, userId: string, assignedBy: string): Promise<Shift> {
    const shift = await this.findOne(shiftId);

    if (shift.assignedUserId) {
      throw new BadRequestException('Shift is already assigned');
    }

    // Assign shift
    shift.assignedUserId = userId;
    shift.status = ShiftStatus.FILLED;
    await this.shiftsRepository.save(shift);

    // Update application if exists
    const application = await this.applicationsRepository.findOne({
      where: { shiftId, userId },
    });

    if (application && application.status === ApplicationStatus.PENDING) {
      application.status = ApplicationStatus.APPROVED;
      application.reviewedBy = assignedBy;
      application.reviewedAt = new Date();
      await this.applicationsRepository.save(application);
    }

    // Reject other pending applications
    await this.applicationsRepository
      .createQueryBuilder()
      .update(ShiftApplication)
      .set({
        status: ApplicationStatus.REJECTED,
        reviewedBy: assignedBy,
        reviewedAt: new Date(),
        reviewNotes: 'Shift was assigned to another user',
      })
      .where('shiftId = :shiftId', { shiftId })
      .andWhere('userId != :userId', { userId })
      .andWhere('status = :status', { status: ApplicationStatus.PENDING })
      .execute();

    return this.findOne(shiftId);
  }

  /**
   * Unassign shift
   */
  async unassignShift(shiftId: string): Promise<Shift> {
    const shift = await this.findOne(shiftId);

    if (!shift.assignedUserId) {
      throw new BadRequestException('Shift is not assigned');
    }

    shift.assignedUserId = null;
    shift.status = ShiftStatus.OPEN;
    await this.shiftsRepository.save(shift);

    return this.findOne(shiftId);
  }

  /**
   * Get user's assigned shifts
   */
  async getMyShifts(userId: string): Promise<Shift[]> {
    return this.shiftsRepository.find({
      where: { assignedUserId: userId },
      relations: ['event'],
      order: { shiftDate: 'ASC', startTime: 'ASC' },
    });
  }

  /**
   * Get user's shift applications
   */
  async getMyApplications(userId: string): Promise<ShiftApplication[]> {
    return this.applicationsRepository.find({
      where: { userId },
      relations: ['shift', 'shift.event'],
      order: { appliedAt: 'DESC' },
    });
  }

  /**
   * Get available (open) shifts
   */
  async getAvailableShifts(userId?: string): Promise<Shift[]> {
    const query = this.shiftsRepository.createQueryBuilder('shift')
      .leftJoinAndSelect('shift.event', 'event')
      .leftJoinAndSelect('shift.applications', 'applications')
      .where('shift.status = :status', { status: ShiftStatus.OPEN })
      .andWhere('shift.shiftDate >= :today', { today: new Date() });

    // If userId provided, exclude shifts already applied for
    if (userId) {
      query.andWhere(
        `shift.id NOT IN (
          SELECT "shiftId" FROM shift_application 
          WHERE "userId" = :userId
        )`,
        { userId }
      );
    }

    return query
      .orderBy('shift.shiftDate', 'ASC')
      .addOrderBy('shift.startTime', 'ASC')
      .getMany();
  }

  /**
   * Get all applications for a shift (management)
   */
  async getShiftApplications(shiftId: string): Promise<ShiftApplication[]> {
    await this.findOne(shiftId); // Check if shift exists

    return this.applicationsRepository.find({
      where: { shiftId },
      relations: ['user'],
      order: { priority: 'ASC', appliedAt: 'ASC' },
    });
  }

  /**
   * Get pending applications (management)
   */
  async getPendingApplications(): Promise<ShiftApplication[]> {
    return this.applicationsRepository.find({
      where: { status: ApplicationStatus.PENDING },
      relations: ['shift', 'shift.event', 'user'],
      order: { priority: 'ASC', appliedAt: 'ASC' },
    });
  }

  /**
   * Cancel shift application
   */
  async cancelApplication(applicationId: string, userId: string): Promise<void> {
    const application = await this.applicationsRepository.findOne({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own applications');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending applications');
    }

    await this.applicationsRepository.delete(applicationId);
  }

  /**
   * Get shift statistics
   */
  async getShiftStats(): Promise<{
    total: number;
    open: number;
    filled: number;
    cancelled: number;
    pendingApplications: number;
  }> {
    const [total, open, filled, cancelled] = await Promise.all([
      this.shiftsRepository.count(),
      this.shiftsRepository.count({ where: { status: ShiftStatus.OPEN } }),
      this.shiftsRepository.count({ where: { status: ShiftStatus.FILLED } }),
      this.shiftsRepository.count({ where: { status: ShiftStatus.CANCELLED } }),
    ]);

    const pendingApplications = await this.applicationsRepository.count({
      where: { status: ApplicationStatus.PENDING },
    });

    return {
      total,
      open,
      filled,
      cancelled,
      pendingApplications,
    };
  }
}
