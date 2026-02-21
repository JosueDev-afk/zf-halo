import {
  Asset,
  CreateAssetData,
  UpdateAssetData,
} from '../entities/asset.entity';
import { PaginatedResult } from '../../application/dtos/common/paginated-result.dto';

/**
 * Repository Interface (Port): IAssetRepository
 * Defines the contract for asset persistence operations.
 * Part of the hexagonal architecture ports layer.
 */
export interface IAssetRepository {
  /**
   * Find all active assets with pagination
   */
  findAll(skip?: number, take?: number): Promise<PaginatedResult<Asset>>;

  /**
   * Find an asset by its unique ID
   */
  findById(id: string): Promise<Asset | null>;

  /**
   * Find an asset by its QR tag
   */
  findByTag(tag: string): Promise<Asset | null>;

  /**
   * Find an asset by its identifier number
   */
  findByIdentifier(identifier: number): Promise<Asset | null>;

  /**
   * Create a new asset
   */
  create(data: CreateAssetData): Promise<Asset>;

  /**
   * Bulk create assets (for future mass imports)
   */
  createMany(data: CreateAssetData[]): Promise<number>;

  /**
   * Update an existing asset
   */
  update(id: string, data: UpdateAssetData): Promise<Asset>;

  /**
   * Soft delete an asset by setting isActive to false
   */
  softDelete(id: string): Promise<Asset>;
}

/**
 * Injection token for the asset repository
 */
export const ASSET_REPOSITORY = Symbol('IAssetRepository');
