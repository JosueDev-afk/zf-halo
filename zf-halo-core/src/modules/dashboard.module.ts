import { Module } from '@nestjs/common';
import { DashboardController } from '../infrastructure/http/controllers/dashboard.controller';
import { GetDashboardStatsUseCase } from '../application/use-cases/dashboard/get-dashboard-stats.use-case';
import { PrismaModule } from '../infrastructure/persistence/prisma/prisma.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DashboardController],
  providers: [GetDashboardStatsUseCase],
})
export class DashboardModule {}
