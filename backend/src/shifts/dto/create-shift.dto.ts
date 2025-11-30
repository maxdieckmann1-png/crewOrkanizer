import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ShiftStatus {
  OPEN = 'open',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

export class CreateShiftDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  shiftDate: Date;

  @IsString()
  @IsNotEmpty()
  startTime: string; // Format: "HH:mm"

  @IsString()
  @IsNotEmpty()
  endTime: string; // Format: "HH:mm"

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  positionName: string; // e.g., "Bartender", "Security", "Stage Crew"

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  requiredCount: number; // How many people needed for this shift

  @IsNumber()
  @IsOptional()
  @Min(0)
  hourlyRate?: number; // in EUR

  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus = ShiftStatus.OPEN;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  requirements?: string; // Special requirements or qualifications
}
