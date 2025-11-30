// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Event Types
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  eventDate: string;
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
  createdAt: string;
  updatedAt: string;
  shifts?: Shift[];
  shiftsCount?: number;
  filledShiftsCount?: number;
  openShiftsCount?: number;
}

export interface CreateEventDto {
  name: string;
  description?: string;
  eventDate: string;
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
  status?: EventStatus;
  expectedAttendees?: number;
  notes?: string;
}

export interface EventStats {
  totalShifts: number;
  filledShifts: number;
  openShifts: number;
  totalApplications: number;
  pendingApplications: number;
}

// Shift Types
export enum ShiftStatus {
  OPEN = 'open',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

export interface Shift {
  id: string;
  eventId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  positionName: string;
  requiredCount: number;
  hourlyRate?: number;
  status: ShiftStatus;
  notes?: string;
  requirements?: string;
  assignedUserId?: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
  assignedUser?: User;
  applications?: ShiftApplication[];
  applicationsCount?: number;
  pendingApplicationsCount?: number;
}

export interface CreateShiftDto {
  eventId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  positionName: string;
  requiredCount: number;
  hourlyRate?: number;
  status?: ShiftStatus;
  notes?: string;
  requirements?: string;
}

// Application Types
export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ShiftApplication {
  id: string;
  shiftId: string;
  userId: string;
  priority: number;
  notes?: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  shift?: Shift;
  user?: User;
}

export interface ApplyShiftDto {
  priority: number;
  notes?: string;
}

export interface ReviewApplicationDto {
  status: ApplicationStatus;
  reviewNotes?: string;
}

// Pagination & Filtering
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export interface FilterEventsDto {
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Statistics
export interface ShiftStats {
  total: number;
  open: number;
  filled: number;
  cancelled: number;
  pendingApplications: number;
}
