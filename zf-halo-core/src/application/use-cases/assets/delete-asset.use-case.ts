import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
    type IAssetRepository,
    ASSET_REPOSITORY,
} from '../../../domain/repositories/asset.repository.interface';
import { Asset } from '../../../domain/entities/asset.entity';

@Injectable()
export class DeleteAssetUseCase {
    constructor(
        @Inject(ASSET_REPOSITORY)
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(id: string): Promise<Asset> {
        const existing = await this.assetRepository.findById(id);
        if (!existing) {
            throw new NotFoundException(`Asset with ID "${id}" not found`);
        }
        return this.assetRepository.softDelete(id);
    }
}
