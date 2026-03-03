import { useQuery } from "@tanstack/react-query";
import { destinationsApi } from "@/infrastructure/http/destinations.api";

export function useDestinations(onlyActive = true) {
  return useQuery({
    queryKey: ["destinations", { onlyActive }],
    queryFn: () => destinationsApi.getDestinations(onlyActive),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
