import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createShiftDto: any) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  findAll() {
    return this.shiftsService.findAll();
  }

  @Get('my-shifts')
  @UseGuards(JwtAuthGuard)
  getMyShifts(@Request() req) {
    return this.shiftsService.getMyShifts(req.user.userId);
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  getMyApplications(@Request() req) {
    return this.shiftsService.getMyApplications(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  apply(@Param('id') id: string, @Request() req, @Body() applicationDto: any) {
    return this.shiftsService.apply(id, req.user.userId, applicationDto);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard)
  assignShift(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.shiftsService.assignShift(id, body.userId, req.user.userId);
  }
}
