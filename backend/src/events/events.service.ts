import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, EventStatus } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventsDto } from './dto/filter-events.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  /**
   * Create new event
   */
  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  /**
   * Find all events with optional filtering
   */
  async findAll(filterDto?: FilterEventsDto): Promise<{ data: Event[]; total: number; page: number; lastPage: number }> {
    const query = this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.shifts', 'shifts');

    // Apply filters
    if (filterDto) {
      if (filterDto.status) {
        query.andWhere('event.status = :status', { status: filterDto.status });
      }

      if (filterDto.startDate && filterDto.endDate) {
        query.andWhere('event.eventDate BETWEEN :startDate AND :endDate', {
          startDate: filterDto.startDate,
          endDate: filterDto.endDate,
        });
      } else if (filterDto.startDate) {
        query.andWhere('event.eventDate >= :startDate', { startDate: filterDto.startDate });
      } else if (filterDto.endDate) {
        query.andWhere('event.eventDate <= :endDate', { endDate: filterDto.endDate });
      }

      if (filterDto.location) {
        query.andWhere('event.location ILIKE :location', { location: `%${filterDto.location}%` });
      }

      if (filterDto.search) {
        query.andWhere(
          '(event.name ILIKE :search OR event.description ILIKE :search)',
          { search: `%${filterDto.search}%` }
        );
      }

      // Sorting
      const sortBy = filterDto.sortBy || 'eventDate';
      const sortOrder = filterDto.sortOrder || 'ASC';
      query.orderBy(`event.${sortBy}`, sortOrder);

      // Pagination
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 10;
      query.skip((page - 1) * limit).take(limit);

      const [data, total] = await query.getManyAndCount();
      
      return {
        data,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    }

    // Default: return all ordered by eventDate
    const data = await query.orderBy('event.eventDate', 'ASC').getMany();
    return {
      data,
      total: data.length,
      page: 1,
      lastPage: 1,
    };
  }

  /**
   * Find one event by ID
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['shifts', 'shifts.applications', 'shifts.assignedUser'],
    });
    
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    
    return event;
  }

  /**
   * Update event
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id); // Check if exists
    
    await this.eventsRepository.update(id, updateEventDto);
    
    return this.findOne(id);
  }

  /**
   * Delete event
   */
  async remove(id: string): Promise<void> {
    const event = await this.findOne(id); // Check if exists
    await this.eventsRepository.delete(id);
  }

  /**
   * Get event statistics
   */
  async getEventStats(id: string): Promise<{
    totalShifts: number;
    filledShifts: number;
    openShifts: number;
    totalApplications: number;
    pendingApplications: number;
  }> {
    const event = await this.findOne(id);
    
    const totalShifts = event.shifts?.length || 0;
    const filledShifts = event.shifts?.filter(s => s.assignedUserId).length || 0;
    const openShifts = totalShifts - filledShifts;
    
    const allApplications = event.shifts?.flatMap(s => s.applications || []) || [];
    const totalApplications = allApplications.length;
    const pendingApplications = allApplications.filter(a => a.status === 'pending').length;

    return {
      totalShifts,
      filledShifts,
      openShifts,
      totalApplications,
      pendingApplications,
    };
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.eventsRepository.find({
      where: {
        eventDate: Between(today, new Date('2100-12-31')),
        status: EventStatus.PUBLISHED,
      },
      relations: ['shifts'],
      order: { eventDate: 'ASC' },
      take: limit,
    });
  }

  /**
   * Get past events
   */
  async getPastEvents(limit: number = 10): Promise<Event[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.eventsRepository.find({
      where: {
        eventDate: Between(new Date('2000-01-01'), today),
      },
      relations: ['shifts'],
      order: { eventDate: 'DESC' },
      take: limit,
    });
  }

  /**
   * Change event status
   */
  async changeStatus(id: string, status: EventStatus): Promise<Event> {
    await this.update(id, { status });
    return this.findOne(id);
  }
}
