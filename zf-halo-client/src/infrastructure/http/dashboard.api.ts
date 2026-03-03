import { apiClient } from "./client";
import type { DashboardStats } from "../../domain/dashboard/dashboard.model";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>("/dashboard/stats");
    return response.data;
  },
};
