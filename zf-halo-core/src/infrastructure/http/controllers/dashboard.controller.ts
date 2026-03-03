import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetDashboardStatsUseCase } from '../../../application/use-cases/dashboard/get-dashboard-stats.use-case';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard statistics' })
  async getStats() {
    return this.getDashboardStatsUseCase.execute();
  }
}
