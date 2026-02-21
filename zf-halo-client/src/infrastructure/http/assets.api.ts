import { apiClient } from "./client";
import type {
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/domain/assets/models/asset.model";
import type {
  PaginatedResult,
  PaginationQuery,
} from "@/domain/common/models/pagination.model";

export const assetsApi = {
  getAssets: async (
    query?: PaginationQuery,
  ): Promise<PaginatedResult<Asset>> => {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());

    const { data } = await apiClient.get<PaginatedResult<Asset>>(
      `/assets?${params.toString()}`,
    );
    return data;
  },

  getAssetById: async (id: string): Promise<Asset> => {
    const { data } = await apiClient.get<Asset>(`/assets/${id}`);
    return data;
  },

  createAsset: async (input: CreateAssetInput): Promise<Asset> => {
    const { data } = await apiClient.post<Asset>("/assets", input);
    return data;
  },

  updateAsset: async (id: string, input: UpdateAssetInput): Promise<Asset> => {
    const { data } = await apiClient.patch<Asset>(`/assets/${id}`, input);
    return data;
  },

  deleteAsset: async (id: string): Promise<Asset> => {
    const { data } = await apiClient.delete<Asset>(`/assets/${id}`);
    return data;
  },
};
