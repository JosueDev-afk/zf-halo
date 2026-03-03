import { Injectable, Inject } from '@nestjs/common';
import {
  type IAssetRepository,
  ASSET_REPOSITORY,
} from '../../../domain/repositories/asset.repository.interface';
import { Asset } from '../../../domain/entities/asset.entity';
import { GetAssetsQueryDto } from '../../dtos/asset/get-assets-query.dto';
import { PaginatedResult } from '../../dtos/common/paginated-result.dto';

@Injectable()
export class GetAssetsUseCase {
  constructor(
    @Inject(ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
  ) {}

  async execute(query: GetAssetsQueryDto): Promise<PaginatedResult<Asset>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    return this.assetRepository.findAll(skip, limit, {
      search: query.search,
      status: query.status,
      category: query.category,
    });
  }
}
