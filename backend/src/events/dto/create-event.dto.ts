import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  eventDate: Date;

  @IsString()
  @IsNotEmpty()
  startTime: string; // Format: "HH:mm"

  @IsString()
  @IsNotEmpty()
  endTime: string; // Format: "HH:mm"

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  location: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  what3words?: string; // e.g., "filled.count.soap"

  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactPerson?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactEmail?: string;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus = EventStatus.DRAFT;

  @IsNumber()
  @IsOptional()
  @Min(0)
  expectedAttendees?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
