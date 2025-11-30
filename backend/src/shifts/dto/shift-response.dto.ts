import { ShiftStatus } from './create-shift.dto';
import { ApplicationStatus } from './apply-shift.dto';

export class ShiftResponseDto {
  id: string;
  eventId: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  positionName: string;
  requiredCount: number;
  hourlyRate?: number;
  status: ShiftStatus;
  notes?: string;
  requirements?: string;
  assignedUserId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  event?: any;
  assignedUser?: any;
  applicationsCount?: number;
  pendingApplicationsCount?: number;
}

export class ShiftApplicationResponseDto {
  id: string;
  shiftId: string;
  userId: string;
  priority: number;
  notes?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;

  // Relations
  shift?: any;
  user?: any;
}

export class MyShiftsResponseDto {
  upcoming: ShiftResponseDto[];
  past: ShiftResponseDto[];
  total: number;
}

export class MyApplicationsResponseDto {
  pending: ShiftApplicationResponseDto[];
  approved: ShiftApplicationResponseDto[];
  rejected: ShiftApplicationResponseDto[];
  total: number;
}
