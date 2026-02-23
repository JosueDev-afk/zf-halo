import { Injectable, Inject } from '@nestjs/common';
import type { ILoanRepository } from '../repositories/loan.repository.interface';
import { LOAN_REPOSITORY } from '../repositories/loan.repository.interface';

@Injectable()
export class FolioGeneratorService {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: ILoanRepository,
  ) {}

  async generateFolio(): Promise<string> {
    const year = new Date().getFullYear();
    const lastFolio = await this.loanRepository.getLastFolio(year);

    if (!lastFolio) {
      return `SAL-${year}-0001`;
    }

    const parts = lastFolio.split('-');
    const sequence = parseInt(parts[2], 10);
    const nextSequence = (sequence + 1).toString().padStart(4, '0');

    return `SAL-${year}-${nextSequence}`;
  }
}
