import { apiClient } from "./client";

export interface Destination {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
}

export const destinationsApi = {
  getDestinations: async (onlyActive = true): Promise<Destination[]> => {
    const params = new URLSearchParams();
    if (!onlyActive) params.append("all", "true");
    const response = await apiClient.get<Destination[]>(
      `/destinations${params.toString() ? `?${params}` : ""}`,
    );
    return response.data;
  },
};
