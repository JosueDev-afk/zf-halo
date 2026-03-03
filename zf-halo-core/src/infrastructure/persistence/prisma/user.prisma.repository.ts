/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  IUserRepository,
  UserFilters,
} from '../../../domain/repositories/user.repository.interface';
import { User, CreateUserData } from '../../../domain/entities/user.entity';
import { PaginatedResult } from '../../../application/dtos/common/paginated-result.dto';

/**
 * Repository Implementation (Adapter): UserPrismaRepository
 * Infrastructure layer adapter implementing the IUserRepository port.
 *
 * NOTE: `mapToEntity` uses `unknown` + cast because Prisma's generated types
 * will not include latitude/longitude/locationName until `prisma migrate dev`
 * is run. After migration these fields will be present in the Prisma response.
 */
@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findAll(
    skip?: number,
    take?: number,
    filters?: UserFilters,
  ): Promise<PaginatedResult<User>> {
    const where: Prisma.UserWhereInput = {
      ...(filters?.role && { role: filters.role as Prisma.EnumRoleFilter }),
      ...(filters?.search && {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, records] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const page =
      skip !== undefined && take !== undefined
        ? Math.floor(skip / take) + 1
        : 1;
    const pageSize = take ?? total;

    return {
      items: records.map((user) => this.mapToEntity(user)),
      total,
      page,
      pageSize,
      pages: pageSize > 0 ? Math.ceil(total / pageSize) : 1,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        role: data.role || 'USER',
      },
    });
    return this.mapToEntity(user);
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.passwordHash && { passwordHash: data.passwordHash }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.company !== undefined && { company: data.company }),

        ...(data.latitude !== undefined &&
          ({ latitude: data.latitude } as any)),

        ...(data.longitude !== undefined &&
          ({ longitude: data.longitude } as any)),

        ...(data.locationName !== undefined &&
          ({ locationName: data.locationName } as any)),
        ...(data.role && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return this.mapToEntity(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    return this.mapToEntity(user);
  }

  private mapToEntity(prismaUser: any): User {
    return {
      id: prismaUser.id as string,
      email: prismaUser.email as string,
      passwordHash: prismaUser.passwordHash as string,
      firstName: prismaUser.firstName as string,
      lastName: prismaUser.lastName as string,
      company: (prismaUser.company as string | null) ?? undefined,
      latitude: (prismaUser.latitude as number | null | undefined) ?? null,
      longitude: (prismaUser.longitude as number | null | undefined) ?? null,
      locationName:
        (prismaUser.locationName as string | null | undefined) ?? null,
      role: prismaUser.role as User['role'],
      isActive: prismaUser.isActive as boolean,
      createdAt: prismaUser.createdAt as Date,
      updatedAt: prismaUser.updatedAt as Date,
    };
  }
}
