import { apiClient } from './client';
import type {
    Asset,
    CreateAssetInput,
    UpdateAssetInput,
} from '@/domain/assets/models/asset.model';

export const assetsApi = {
    getAssets: async (): Promise<Asset[]> => {
        const { data } = await apiClient.get<Asset[]>('/assets');
        return data;
    },

    getAssetById: async (id: string): Promise<Asset> => {
        const { data } = await apiClient.get<Asset>(`/assets/${id}`);
        return data;
    },

    createAsset: async (input: CreateAssetInput): Promise<Asset> => {
        const { data } = await apiClient.post<Asset>('/assets', input);
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
