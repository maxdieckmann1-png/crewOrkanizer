import { EventStatus } from './create-event.dto';

export class EventResponseDto {
  id: string;
  name: string;
  description?: string;
  eventDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  what3words?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  status: EventStatus;
  expectedAttendees?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  shiftsCount?: number;
  filledShiftsCount?: number;
  openShiftsCount?: number;
}

export class EventWithShiftsDto extends EventResponseDto {
  shifts: any[]; // Will be typed with ShiftResponseDto later
}
