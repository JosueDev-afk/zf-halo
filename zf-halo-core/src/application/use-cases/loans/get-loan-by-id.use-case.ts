import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ILoanRepository } from '../../../domain/repositories/loan.repository.interface';
import { LOAN_REPOSITORY } from '../../../domain/repositories/loan.repository.interface';
import { Loan } from '../../../domain/entities/loan.entity';

@Injectable()
export class GetLoanByIdUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: ILoanRepository,
  ) {}

  async execute(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    return loan;
  }
}
