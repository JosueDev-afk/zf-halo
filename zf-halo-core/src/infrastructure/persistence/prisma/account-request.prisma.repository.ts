import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AccountRequestRepository } from '../../../domain/repositories/account-request.repository.interface';
import {
  AccountRequest,
  AccountRequestStatus,
} from '../../../domain/entities/account-request.entity';
import { AccountRequest as PrismaAccountRequest } from '@generated/prisma';

@Injectable()
export class PrismaAccountRequestRepository implements AccountRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    passwordHash: string;
  }): Promise<AccountRequest> {
    const request = await this.prisma.accountRequest.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        passwordHash: data.passwordHash,
        status: AccountRequestStatus.PENDING,
      },
    });
    return this.mapToEntity(request);
  }

  async findById(id: string): Promise<AccountRequest | null> {
    const request = await this.prisma.accountRequest.findUnique({
      where: { id },
    });
    return request ? this.mapToEntity(request) : null;
  }

  async findByEmail(email: string): Promise<AccountRequest | null> {
    const request = await this.prisma.accountRequest.findUnique({
      where: { email },
    });
    return request ? this.mapToEntity(request) : null;
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
  ): Promise<void> {
    await this.prisma.accountRequest.update({
      where: { id },
      data: { status },
    });
  }

  async findPending(): Promise<AccountRequest[]> {
    const requests = await this.prisma.accountRequest.findMany({
      where: { status: AccountRequestStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((req) => this.mapToEntity(req));
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const request = await this.prisma.accountRequest.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
    return request?.passwordHash || null;
  }

  private mapToEntity(prismaRequest: PrismaAccountRequest): AccountRequest {
    return {
      id: prismaRequest.id,
      email: prismaRequest.email,
      firstName: prismaRequest.firstName,
      lastName: prismaRequest.lastName,
      company: prismaRequest.company ?? undefined,
      status: prismaRequest.status as AccountRequestStatus,
      createdAt: prismaRequest.createdAt,
      updatedAt: prismaRequest.updatedAt,
    };
  }
}
