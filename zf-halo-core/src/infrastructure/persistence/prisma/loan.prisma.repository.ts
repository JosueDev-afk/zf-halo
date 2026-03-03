/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unused-vars */
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  ILoanRepository,
  CreateLoanData,
} from '../../../domain/repositories/loan.repository.interface';
import { Loan, LoanStatus } from '../../../domain/entities/loan.entity';
import { PaginatedResult } from '../../../application/dtos/common/paginated-result.dto';

@Injectable()
export class LoanPrismaRepository implements ILoanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLoanData): Promise<Loan> {
    return this.prisma.loan.create({
      data: {
        folio: data.folio,
        status: data.status,
        quantity: data.quantity,
        estimatedReturnDate: data.estimatedReturnDate,
        comments: data.comments,
        requesterId: data.requesterId,
        assetId: data.assetId,
        destinationId: data.destinationId,
      },
      include: {
        asset: true,
        requester: true,
        authorizer: true,
        destination: true,
      },
    }) as unknown as Promise<Loan>;
  }

  async findById(id: string): Promise<Loan | null> {
    return this.prisma.loan.findUnique({
      where: { id },
      include: {
        asset: true,
        requester: true,
        authorizer: true,
        destination: true,
      },
    }) as unknown as Promise<Loan | null>;
  }

  async findByFolio(folio: string): Promise<Loan | null> {
    return this.prisma.loan.findUnique({
      where: { folio },
      include: {
        asset: true,
        requester: true,
        authorizer: true,
        destination: true,
      },
    }) as unknown as Promise<Loan | null>;
  }

  async findAll(
    skip = 0,
    take = 10,
    filters?: Record<string, any>,
  ): Promise<PaginatedResult<Loan>> {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.requesterId) where.requesterId = filters.requesterId;

    const [total, items] = await this.prisma.$transaction([
      this.prisma.loan.count({ where }),
      this.prisma.loan.findMany({
        where,
        skip,
        take,
        include: {
          asset: true,
          requester: true,
          destination: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      items: items as unknown as Loan[],
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      pages: Math.ceil(total / take),
    };
  }

  async updateStatus(
    id: string,
    status: LoanStatus,
    extras?: Partial<Loan>,
  ): Promise<Loan> {
    return this.prisma.loan.update({
      where: { id },
      data: {
        status,
        ...(() => {
          const { id, asset, requester, authorizer, destination, ...rest } =
            extras || {};
          return rest as any;
        })(),
      },
      include: {
        asset: true,
        requester: true,
        authorizer: true,
      },
    }) as unknown as Promise<Loan>;
  }

  async checkout(
    id: string,
    departureDate: Date,
    extras?: Partial<Loan>,
  ): Promise<Loan> {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id },
        include: { asset: true },
      });

      if (!loan) throw new Error('Loan not found');
      if (loan.asset.assetType === 'SERIALIZED') {
        if (loan.asset.machineStatus === 'LOANED') {
          throw new BadRequestException('Asset is already loaned out');
        }
        await tx.asset.update({
          where: { id: loan.assetId },
          data: { machineStatus: 'LOANED' },
        });
      } else if (loan.asset.assetType === 'BULK') {
        if ((loan.asset.currentQuantity || 0) < loan.quantity) {
          throw new BadRequestException('Insufficient stock');
        }
        await tx.asset.update({
          where: { id: loan.assetId },
          data: { currentQuantity: { decrement: loan.quantity } },
        });
      }

      return tx.loan.update({
        where: { id },
        data: {
          status: 'CHECKED_OUT',
          departureDate,
          ...(() => {
            const { id, asset, requester, authorizer, destination, ...rest } =
              extras || {};
            return rest as any;
          })(),
        },
        include: { asset: true, requester: true, destination: true },
      }) as unknown as Promise<Loan>;
    });
  }

  async checkin(
    id: string,
    actualReturnDate: Date,
    extras?: Partial<Loan>,
  ): Promise<Loan> {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id },
        include: { asset: true },
      });

      if (!loan) throw new Error('Loan not found');

      if (loan.asset.assetType === 'SERIALIZED') {
        await tx.asset.update({
          where: { id: loan.assetId },
          data: { machineStatus: 'OPERATIVE' },
        });
      } else if (loan.asset.assetType === 'BULK') {
        await tx.asset.update({
          where: { id: loan.assetId },
          data: { currentQuantity: { increment: loan.quantity } },
        });
      }

      return tx.loan.update({
        where: { id },
        data: {
          status: 'RETURNED',
          actualReturnDate,
          ...(() => {
            const { id, asset, requester, authorizer, destination, ...rest } =
              extras || {};
            return rest as any;
          })(),
        },
        include: { asset: true, requester: true, destination: true },
      }) as unknown as Promise<Loan>;
    });
  }

  async findOverdueLoans(): Promise<Loan[]> {
    const now = new Date();
    return this.prisma.loan.findMany({
      where: {
        status: 'CHECKED_OUT',
        estimatedReturnDate: { lt: now },
        actualReturnDate: null,
      },
      include: { asset: true, requester: true },
    }) as unknown as Promise<Loan[]>;
  }

  async getLastFolio(year: number): Promise<string | null> {
    const loan = await this.prisma.loan.findFirst({
      where: {
        folio: { startsWith: `SAL-${year}-` },
      },
      orderBy: { folio: 'desc' },
      select: { folio: true },
    });
    return loan ? loan.folio : null;
  }
}
