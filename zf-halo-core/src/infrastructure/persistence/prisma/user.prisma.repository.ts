import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { User, CreateUserData } from '../../../domain/entities/user.entity';
import { PaginatedResult } from '../../../application/dtos/common/paginated-result.dto';

/**
 * Repository Implementation (Adapter): UserPrismaRepository
 * Infrastructure layer adapter implementing the IUserRepository port.
 */
@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findAll(skip?: number, take?: number): Promise<PaginatedResult<User>> {
    const [total, records] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
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
        ...(data.company && { company: data.company }),
        ...(data.role && { role: data.role }),
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
      id: prismaUser.id,
      email: prismaUser.email,
      passwordHash: prismaUser.passwordHash,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      company: prismaUser.company ?? undefined,
      role: prismaUser.role,
      isActive: prismaUser.isActive,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }
}
