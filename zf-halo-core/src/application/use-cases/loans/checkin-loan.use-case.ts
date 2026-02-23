import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { ILoanRepository } from '../../../domain/repositories/loan.repository.interface';
import { LOAN_REPOSITORY } from '../../../domain/repositories/loan.repository.interface';
import { LoanStateMachineService } from '../../../domain/services/loan-state-machine.service';
import { CheckInLoanDto } from '../../dtos/loan/checkin-loan.dto';
import { Loan } from '../../../domain/entities/loan.entity';

@Injectable()
export class CheckInLoanUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: ILoanRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(loanId: string, dto: CheckInLoanDto): Promise<Loan> {
    const loan = await this.loanRepository.findById(loanId);

    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    LoanStateMachineService.validateTransition(loan.status, 'RETURNED');

    const combinedComments = this.buildComments(loan.comments, dto.comments);

    const updatedLoan = await this.loanRepository.checkin(loanId, new Date(), {
      comments: combinedComments,
    });

    this.eventEmitter.emit('loan.status.changed', {
      loanId: updatedLoan.id,
      status: updatedLoan.status,
      folio: updatedLoan.folio,
    });

    return updatedLoan;
  }

  private buildComments(
    existing: string | null,
    added?: string,
  ): string | null {
    if (!added) return existing;
    return existing
      ? `${existing}\n[CheckIn]: ${added}`
      : `[CheckIn]: ${added}`;
  }
}
