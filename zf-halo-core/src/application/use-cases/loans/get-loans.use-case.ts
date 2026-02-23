import { Injectable, Inject } from '@nestjs/common';
import type { ILoanRepository } from '../../../domain/repositories/loan.repository.interface';
import { LOAN_REPOSITORY } from '../../../domain/repositories/loan.repository.interface';
import { PaginatedResult } from '../../dtos/common/paginated-result.dto';
import { PaginationQueryDto } from '../../dtos/common/pagination-query.dto';
import { Loan } from '../../../domain/entities/loan.entity';

export interface GetLoansFilters {
  requesterId?: string;
  status?: string;
}

@Injectable()
export class GetLoansUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: ILoanRepository,
  ) {}

  async execute(
    query: PaginationQueryDto,
    filters?: GetLoansFilters,
  ): Promise<PaginatedResult<Loan>> {
    const skip = ((query.page || 1) - 1) * (query.limit || 10);
    const take = query.limit || 10;
    return this.loanRepository.findAll(skip, take, filters);
  }
}
