import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class ApplyShiftDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  priority: number; // 1 = highest, 5 = lowest

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string; // Why you want this shift, experience, etc.
}

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class ReviewApplicationDto {
  @IsString()
  status: ApplicationStatus; // 'approved' or 'rejected'

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reviewNotes?: string;
}
