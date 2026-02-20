import { Injectable, Inject } from '@nestjs/common';
import {
    type IAssetRepository,
    ASSET_REPOSITORY,
} from '../../../domain/repositories/asset.repository.interface';
import { Asset } from '../../../domain/entities/asset.entity';

@Injectable()
export class GetAssetsUseCase {
    constructor(
        @Inject(ASSET_REPOSITORY)
        private readonly assetRepository: IAssetRepository,
    ) { }

    async execute(): Promise<Asset[]> {
        return this.assetRepository.findAll();
    }
}
