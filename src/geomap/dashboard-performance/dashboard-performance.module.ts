import { Module } from '@nestjs/common';
import { DashboardPerformanceController } from './dashboard-performance.controller';
import { DashboardPerformanceService } from './dashboard-performance.service';

@Module({
  controllers: [DashboardPerformanceController],
  providers: [DashboardPerformanceService],
})
export class DashboardPerformanceModule {}
