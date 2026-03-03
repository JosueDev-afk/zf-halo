/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';

export interface DashboardStats {
  assets: {
    total: number;
    byStatus: Record<string, number>;
    utilizationRate: number;
  };
  loans: {
    total: number;
    requested: number;
    authorized: number;
    checkedOut: number;
    returned: number;
    rejected: number;
    overdue: number;
  };
  users: {
    total: number;
    active: number;
  };
  map: {
    activeLoans: Array<{
      destinationId: string;
      destinationName: string;
      latitude: number;
      longitude: number;
      count: number;
      overdue: number;
    }>;
  };
}

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardStats> {
    const now = new Date();

    const [
      totalAssets,
      assetsByStatus,
      loansByStatus,
      totalUsers,
      activeUsers,
      overdueCount,
      activeLoansWithDest,
    ] = await Promise.all([
      this.prisma.asset.count({ where: { isActive: true } }),

      this.prisma.asset.groupBy({
        by: ['machineStatus'],
        where: { isActive: true },
        _count: { _all: true },
      }),

      this.prisma.loan.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),

      this.prisma.user.count(),

      this.prisma.user.count({ where: { isActive: true } }),

      this.prisma.loan.count({
        where: {
          status: 'CHECKED_OUT',
          estimatedReturnDate: { lt: now },
        },
      }),

      // Active + authorized loans with destination for map
      // Using findMany with include (no select) to avoid Prisma select+include conflict
      this.prisma.loan.findMany({
        where: {
          status: { in: ['CHECKED_OUT', 'AUTHORIZED', 'REQUESTED'] },
        },
        include: {
          destination: true,
        },
      }),
    ]);

    // Build asset status map
    const byStatus: Record<string, number> = {};
    for (const group of assetsByStatus) {
      byStatus[group.machineStatus] = group._count._all;
    }

    // Build loan status map
    const loanStatusMap: Record<string, number> = {};
    for (const group of loansByStatus) {
      loanStatusMap[group.status] = group._count._all;
    }
    const totalLoans = Object.values(loanStatusMap).reduce((a, b) => a + b, 0);

    // Asset utilization: loaned assets / total
    const loanedAssets = byStatus['LOANED'] ?? 0;
    const utilizationRate =
      totalAssets > 0 ? Math.round((loanedAssets / totalAssets) * 100) : 0;

    // Build map data: group by destination
    type DestEntry = {
      name: string;
      lat: number;
      lng: number;
      count: number;
      overdue: number;
    };
    const destMap = new Map<string, DestEntry>();

    for (const loan of activeLoansWithDest) {
      const dest = loan.destination as any;
      if (!dest.latitude || !dest.longitude) continue;

      const isOverdue =
        loan.status === 'CHECKED_OUT' &&
        new Date(loan.estimatedReturnDate) < now;

      if (!destMap.has(dest.id)) {
        destMap.set(dest.id, {
          name: dest.name,
          lat: dest.latitude,
          lng: dest.longitude,
          count: 0,
          overdue: 0,
        });
      }
      const entry = destMap.get(dest.id)!;
      entry.count++;
      if (isOverdue) entry.overdue++;
    }

    const activeLoans = Array.from(destMap.entries()).map(([id, val]) => ({
      destinationId: id,
      destinationName: val.name,
      latitude: val.lat,
      longitude: val.lng,
      count: val.count,
      overdue: val.overdue,
    }));

    return {
      assets: {
        total: totalAssets,
        byStatus,
        utilizationRate,
      },
      loans: {
        total: totalLoans,
        requested: loanStatusMap['REQUESTED'] ?? 0,
        authorized: loanStatusMap['AUTHORIZED'] ?? 0,
        checkedOut: loanStatusMap['CHECKED_OUT'] ?? 0,
        returned: loanStatusMap['RETURNED'] ?? 0,
        rejected: loanStatusMap['REJECTED'] ?? 0,
        overdue: overdueCount,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
      },
      map: { activeLoans },
    };
  }
}
