import { LoanStatus } from '../entities/loan.entity';
import { BadRequestException } from '@nestjs/common';

export class LoanStateMachineService {
  /**
   * Validates if a transition from currentStatus to targetStatus is allowed.
   */
  static validateTransition(
    currentStatus: LoanStatus,
    targetStatus: LoanStatus,
  ): void {
    const allowedTransitions: Record<LoanStatus, LoanStatus[]> = {
      REQUESTED: ['AUTHORIZED'],
      AUTHORIZED: ['CHECKED_OUT'],
      CHECKED_OUT: ['RETURNED'],
      RETURNED: [], // Terminal state
    };

    const nextAllowed = allowedTransitions[currentStatus];

    if (!nextAllowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid loan state transition: Cannot move from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }
}
