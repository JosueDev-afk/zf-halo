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
    query?: PaginationQuery & {
      search?: string;
      status?: string;
      category?: string;
    },
  ): Promise<PaginatedResult<Asset>> => {
    const params = new URLSearchParams();
    if (query?.page) params.append("page", query.page.toString());
    if (query?.limit) params.append("limit", query.limit.toString());
    if (query?.search?.trim()) params.append("search", query.search.trim());
    if (query?.status) params.append("status", query.status);
    if (query?.category) params.append("category", query.category);

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

  getAssetByTag: async (tag: string): Promise<Asset | null> => {
    const { data } = await apiClient.get<PaginatedResult<Asset>>(
      `/assets?tag=${encodeURIComponent(tag)}&limit=1`,
    );
    return data.items?.[0] ?? null;
  },
};
