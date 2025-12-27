import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { StatisticsService } from './statistics.service';

@ApiTags('statistics')
@Controller('api/statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get()
  @Roles('Manager', 'Operator', 'QualityManager')
  getStats() {
    return this.statisticsService.getStats();
  }
}
