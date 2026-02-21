import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { IAssetRepository } from '../../../domain/repositories/asset.repository.interface';
import {
  Asset,
  CreateAssetData,
  UpdateAssetData,
} from '../../../domain/entities/asset.entity';
import { PaginatedResult } from '../../../application/dtos/common/paginated-result.dto';

/**
 * Maps a Prisma Asset record to the domain Asset entity.
 * Converts Prisma Decimal to plain number for the domain layer.
 */
function toDomain(
  record: Prisma.AssetGetPayload<Record<string, never>>,
): Asset {
  return {
    id: record.id,
    identifier: record.identifier,
    area: record.area,
    subArea: record.subArea,
    category: record.category,
    initialQuantity: record.initialQuantity,
    currentQuantity: record.currentQuantity,
    projectName: record.projectName,
    machineName: record.machineName,
    tag: record.tag,
    serialNumber: record.serialNumber,
    model: record.model,
    brand: record.brand,
    year: record.year,
    customsDocument: record.customsDocument,
    invoice: record.invoice,
    commercialValue: record.commercialValue.toNumber(),
    purchaseDate: record.purchaseDate,
    description: record.description,
    comments: record.comments,
    purchaseType: record.purchaseType,
    nationalType: record.nationalType,
    machineStatus: record.machineStatus,
    isPurchased: record.isPurchased,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/**
 * Repository Implementation (Adapter): AssetPrismaRepository
 * Infrastructure layer adapter implementing the IAssetRepository port.
 */
@Injectable()
export class AssetPrismaRepository implements IAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(skip?: number, take?: number): Promise<PaginatedResult<Asset>> {
    const where = { isActive: true };
    const [total, records] = await this.prisma.$transaction([
      this.prisma.asset.count({ where }),
      this.prisma.asset.findMany({
        where,
        skip,
        take,
        orderBy: { identifier: 'asc' },
      }),
    ]);

    const page =
      skip !== undefined && take !== undefined
        ? Math.floor(skip / take) + 1
        : 1;
    const pageSize = take ?? total;

    return {
      items: records.map(toDomain),
      total,
      page,
      pageSize,
      pages: pageSize > 0 ? Math.ceil(total / pageSize) : 1,
    };
  }

  async findById(id: string): Promise<Asset | null> {
    const record = await this.prisma.asset.findUnique({
      where: { id },
    });
    return record ? toDomain(record) : null;
  }

  async findByTag(tag: string): Promise<Asset | null> {
    const record = await this.prisma.asset.findUnique({
      where: { tag },
    });
    return record ? toDomain(record) : null;
  }

  async findByIdentifier(identifier: number): Promise<Asset | null> {
    const record = await this.prisma.asset.findUnique({
      where: { identifier },
    });
    return record ? toDomain(record) : null;
  }

  async create(data: CreateAssetData): Promise<Asset> {
    const record = await this.prisma.asset.create({
      data: {
        identifier: data.identifier,
        area: data.area,
        subArea: data.subArea,
        category: data.category,
        initialQuantity: data.initialQuantity ?? null,
        currentQuantity: data.currentQuantity ?? null,
        projectName: data.projectName,
        machineName: data.machineName,
        tag: data.tag,
        serialNumber: data.serialNumber,
        model: data.model,
        brand: data.brand,
        year: data.year ?? null,
        customsDocument: data.customsDocument ?? null,
        invoice: data.invoice ?? null,
        commercialValue: data.commercialValue,
        purchaseDate: data.purchaseDate ?? null,
        description: data.description ?? null,
        comments: data.comments ?? null,
        purchaseType: data.purchaseType,
        nationalType: data.nationalType ?? null,
        machineStatus: data.machineStatus ?? 'OPERATIVE',
        isPurchased: data.isPurchased ?? false,
      },
    });
    return toDomain(record);
  }

  async createMany(data: CreateAssetData[]): Promise<number> {
    const result = await this.prisma.asset.createMany({
      data: data.map((d) => ({
        identifier: d.identifier,
        area: d.area,
        subArea: d.subArea,
        category: d.category,
        initialQuantity: d.initialQuantity ?? null,
        currentQuantity: d.currentQuantity ?? null,
        projectName: d.projectName,
        machineName: d.machineName,
        tag: d.tag,
        serialNumber: d.serialNumber,
        model: d.model,
        brand: d.brand,
        year: d.year ?? null,
        customsDocument: d.customsDocument ?? null,
        invoice: d.invoice ?? null,
        commercialValue: d.commercialValue,
        purchaseDate: d.purchaseDate ?? null,
        description: d.description ?? null,
        comments: d.comments ?? null,
        purchaseType: d.purchaseType,
        nationalType: d.nationalType ?? null,
        machineStatus: d.machineStatus ?? 'OPERATIVE',
        isPurchased: d.isPurchased ?? false,
      })),
      skipDuplicates: true,
    });
    return result.count;
  }

  async update(id: string, data: UpdateAssetData): Promise<Asset> {
    const record = await this.prisma.asset.update({
      where: { id },
      data: {
        ...(data.identifier !== undefined && {
          identifier: data.identifier,
        }),
        ...(data.area !== undefined && { area: data.area }),
        ...(data.subArea !== undefined && { subArea: data.subArea }),
        ...(data.category !== undefined && {
          category: data.category,
        }),
        ...(data.initialQuantity !== undefined && {
          initialQuantity: data.initialQuantity,
        }),
        ...(data.currentQuantity !== undefined && {
          currentQuantity: data.currentQuantity,
        }),
        ...(data.projectName !== undefined && {
          projectName: data.projectName,
        }),
        ...(data.machineName !== undefined && {
          machineName: data.machineName,
        }),
        ...(data.tag !== undefined && { tag: data.tag }),
        ...(data.serialNumber !== undefined && {
          serialNumber: data.serialNumber,
        }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.customsDocument !== undefined && {
          customsDocument: data.customsDocument,
        }),
        ...(data.invoice !== undefined && { invoice: data.invoice }),
        ...(data.commercialValue !== undefined && {
          commercialValue: data.commercialValue,
        }),
        ...(data.purchaseDate !== undefined && {
          purchaseDate: data.purchaseDate,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.comments !== undefined && {
          comments: data.comments,
        }),
        ...(data.purchaseType !== undefined && {
          purchaseType: data.purchaseType,
        }),
        ...(data.nationalType !== undefined && {
          nationalType: data.nationalType,
        }),
        ...(data.machineStatus !== undefined && {
          machineStatus: data.machineStatus,
        }),
        ...(data.isPurchased !== undefined && {
          isPurchased: data.isPurchased,
        }),
      },
    });
    return toDomain(record);
  }

  async softDelete(id: string): Promise<Asset> {
    const record = await this.prisma.asset.update({
      where: { id },
      data: { isActive: false },
    });
    return toDomain(record);
  }
}
