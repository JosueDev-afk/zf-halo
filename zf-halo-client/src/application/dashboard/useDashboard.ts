import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../infrastructure/http/dashboard.api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 30_000, // 30s - refresh every 30s
    refetchInterval: 60_000, // auto-refresh every 60s
  });
}
