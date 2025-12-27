import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairRequest } from '../entities/repair-request.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepairRequest])],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {}
