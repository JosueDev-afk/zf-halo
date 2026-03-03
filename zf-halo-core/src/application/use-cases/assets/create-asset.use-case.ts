import { Injectable, Inject } from '@nestjs/common';
import {
  type IAssetRepository,
  ASSET_REPOSITORY,
} from '../../../domain/repositories/asset.repository.interface';
import { Asset, CreateAssetData } from '../../../domain/entities/asset.entity';
import { CreateAssetDto } from '../../dtos/asset/create-asset.dto';

@Injectable()
export class CreateAssetUseCase {
  constructor(
    @Inject(ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
  ) {}

  async execute(dto: CreateAssetDto): Promise<Asset> {
    const data: CreateAssetData = {
      identifier: dto.identifier,
      area: dto.area,
      subArea: dto.subArea,
      category: dto.category,
      initialQuantity: dto.initialQuantity ?? null,
      currentQuantity: dto.currentQuantity ?? null,
      projectName: dto.projectName,
      machineName: dto.machineName,
      tag: dto.tag,
      serialNumber: dto.serialNumber,
      model: dto.model,
      brand: dto.brand,
      year: dto.year ?? null,
      customsDocument: dto.customsDocument ?? null,
      invoice: dto.invoice ?? null,
      commercialValue: dto.commercialValue,
      purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
      description: dto.description ?? null,
      comments: dto.comments ?? null,
      purchaseType: dto.purchaseType,
      nationalType: dto.nationalType ?? null,
      machineStatus: dto.machineStatus,
      isPurchased: dto.isPurchased,
    };

    return this.assetRepository.create(data);
  }
}
