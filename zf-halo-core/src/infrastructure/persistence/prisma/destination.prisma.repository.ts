import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IDestinationRepository } from '../../../domain/repositories/destination.repository.interface';
import { Destination } from '../../../domain/entities/destination.entity';

@Injectable()
export class DestinationPrismaRepository implements IDestinationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = true): Promise<Destination[]> {
    const records = await this.prisma.destination.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
    return records.map((d) => this.mapToEntity(d));
  }

  async findById(id: string): Promise<Destination | null> {
    const record = await this.prisma.destination.findUnique({ where: { id } });
    return record ? this.mapToEntity(record) : null;
  }

  private mapToEntity(prismaDestination: {
    id: string;
    name: string;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    [key: string]: unknown;
  }): Destination {
    return {
      id: prismaDestination.id,
      name: prismaDestination.name,
      address: prismaDestination.address,
      latitude: (prismaDestination['latitude'] as number | null) ?? null,
      longitude: (prismaDestination['longitude'] as number | null) ?? null,
      isActive: prismaDestination.isActive,
      createdAt: prismaDestination.createdAt,
    };
  }
}
