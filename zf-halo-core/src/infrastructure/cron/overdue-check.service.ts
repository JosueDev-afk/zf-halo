import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LOAN_REPOSITORY } from '../../domain/repositories/loan.repository.interface';
import type { ILoanRepository } from '../../domain/repositories/loan.repository.interface';

@Injectable()
export class OverdueCheckService {
  private readonly logger = new Logger(OverdueCheckService.name);

  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepo: ILoanRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueLoans() {
    this.logger.log('Starting daily overdue loans check...');

    const overdueLoans = await this.loanRepo.findOverdueLoans();
    const now = new Date();

    for (const loan of overdueLoans) {
      const diffTime = Math.abs(
        now.getTime() - loan.estimatedReturnDate.getTime(),
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Emit alert on days 1, 3, 7, or recurring every 7 days after 14
      if (diffDays === 1 || diffDays === 3 || diffDays === 7 || diffDays > 14) {
        this.logger.warn(
          `Loan ${loan.folio} is ${diffDays} days overdue! Emitting event...`,
        );
        this.eventEmitter.emit('loan.overdue', {
          loanId: loan.id,
          folio: loan.folio,
          daysOverdue: diffDays,
        });
      }
    }

    this.logger.log(
      `Overdue check completed. Found ${overdueLoans.length} overdue loans.`,
    );
  }
}
