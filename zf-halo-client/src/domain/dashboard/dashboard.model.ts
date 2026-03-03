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
