import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import type { AccountRequestRepository } from '../../../domain/repositories/account-request.repository.interface';
import { AccountRequestStatus } from '../../../domain/entities/account-request.entity';
import { ApproveAccountDto } from '../../dtos/accounts/approve-account.dto';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class ApproveAccountUseCase {
  constructor(
    @Inject('AccountRequestRepository')
    private readonly accountRequestRepository: AccountRequestRepository,
    private readonly prisma: PrismaService, // Direct Prisma access for User creation transaction
  ) {}

  async execute(requestId: string, dto: ApproveAccountDto): Promise<void> {
    const request = await this.accountRequestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Account request not found');
    }

    if (request.status !== AccountRequestStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    const passwordHash =
      await this.accountRequestRepository.getPasswordHash(requestId);
    if (!passwordHash) {
      throw new NotFoundException('Password hash not found');
    }

    // Transaction: Create User + Update Request Status
    await this.prisma.$transaction(async (tx) => {
      // 1. Create User
      await tx.user.create({
        data: {
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          company: request.company,
          passwordHash: passwordHash,
          role: dto.role,
          isActive: true, // Auto-activate upon approval
        },
      });

      // 2. Update Request Status
      await tx.accountRequest.update({
        where: { id: requestId },
        data: { status: AccountRequestStatus.APPROVED },
      });
    });
  }
}
