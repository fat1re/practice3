import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepairRequest } from '../entities/repair-request.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(RepairRequest) private reqRepo: Repository<RepairRequest>,
  ) {}

  async getStats() {
    const total = await this.reqRepo.count();
    const completed = await this.reqRepo.count({ where: { requestStatus: 'Завершена' } });

    const completedRequests = await this.reqRepo.find({
      where: { requestStatus: 'Завершена' },
      select: ['dateAdded', 'completionDate'],
    });

    const avgHours =
      completedRequests.length === 0
        ? 0
        : completedRequests
            .filter((r) => r.completionDate)
            .map((r) => (r.completionDate!.getTime() - r.dateAdded.getTime()) / 36e5)
            .reduce((a, b) => a + b, 0) / completedRequests.length;

    const byTypeRaw = await this.reqRepo
      .createQueryBuilder('r')
      .select('r.climateTechType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.climateTechType')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      totalRequests: total,
      completedCount: completed,
      averageRepairHours: Number(avgHours.toFixed(2)),
      byClimateTechType: byTypeRaw.map((x) => ({ type: x.type, count: Number(x.count) })),
    };
  }
}
