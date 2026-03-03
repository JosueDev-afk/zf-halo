import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  type IAssetRepository,
  ASSET_REPOSITORY,
} from '../../../domain/repositories/asset.repository.interface';
import { Asset, UpdateAssetData } from '../../../domain/entities/asset.entity';
import { UpdateAssetDto } from '../../dtos/asset/update-asset.dto';

@Injectable()
export class UpdateAssetUseCase {
  constructor(
    @Inject(ASSET_REPOSITORY)
    private readonly assetRepository: IAssetRepository,
  ) {}

  async execute(id: string, dto: UpdateAssetDto): Promise<Asset> {
    const existing = await this.assetRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Asset with ID "${id}" not found`);
    }

    const data: UpdateAssetData = {
      ...(dto.identifier !== undefined && {
        identifier: dto.identifier,
      }),
      ...(dto.area !== undefined && { area: dto.area }),
      ...(dto.subArea !== undefined && { subArea: dto.subArea }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.initialQuantity !== undefined && {
        initialQuantity: dto.initialQuantity,
      }),
      ...(dto.currentQuantity !== undefined && {
        currentQuantity: dto.currentQuantity,
      }),
      ...(dto.projectName !== undefined && {
        projectName: dto.projectName,
      }),
      ...(dto.machineName !== undefined && {
        machineName: dto.machineName,
      }),
      ...(dto.tag !== undefined && { tag: dto.tag }),
      ...(dto.serialNumber !== undefined && {
        serialNumber: dto.serialNumber,
      }),
      ...(dto.model !== undefined && { model: dto.model }),
      ...(dto.brand !== undefined && { brand: dto.brand }),
      ...(dto.year !== undefined && { year: dto.year }),
      ...(dto.customsDocument !== undefined && {
        customsDocument: dto.customsDocument,
      }),
      ...(dto.invoice !== undefined && { invoice: dto.invoice }),
      ...(dto.commercialValue !== undefined && {
        commercialValue: dto.commercialValue,
      }),
      ...(dto.purchaseDate !== undefined && {
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
      }),
      ...(dto.description !== undefined && {
        description: dto.description,
      }),
      ...(dto.comments !== undefined && { comments: dto.comments }),
      ...(dto.purchaseType !== undefined && {
        purchaseType: dto.purchaseType,
      }),
      ...(dto.nationalType !== undefined && {
        nationalType: dto.nationalType,
      }),
      ...(dto.machineStatus !== undefined && {
        machineStatus: dto.machineStatus,
      }),
      ...(dto.isPurchased !== undefined && {
        isPurchased: dto.isPurchased,
      }),
    };

    return this.assetRepository.update(id, data);
  }
}
