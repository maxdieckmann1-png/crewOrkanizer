import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  // All fields from CreateEventDto are optional
  // This is the NestJS convention for update DTOs
}
