import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftDto } from './create-shift.dto';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateShiftDto extends PartialType(CreateShiftDto) {
  @IsUUID()
  @IsOptional()
  assignedUserId?: string | null; // null to unassign
}
