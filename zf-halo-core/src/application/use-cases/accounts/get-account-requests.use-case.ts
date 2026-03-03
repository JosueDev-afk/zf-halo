import { Injectable, Inject } from '@nestjs/common';
import type { AccountRequestRepository } from '../../../domain/repositories/account-request.repository.interface';
import { AccountRequest } from '../../../domain/entities/account-request.entity';

@Injectable()
export class GetAccountRequestsUseCase {
  constructor(
    @Inject('AccountRequestRepository')
    private readonly accountRequestRepository: AccountRequestRepository,
  ) {}

  async execute(): Promise<AccountRequest[]> {
    return this.accountRequestRepository.findPending();
  }
}
