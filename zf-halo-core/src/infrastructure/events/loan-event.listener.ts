import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository.interface';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Injectable()
export class LoanEventListener {
  private readonly logger = new Logger(LoanEventListener.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
    @InjectQueue('notifications') private readonly notificationQueue: Queue,
  ) {}

  @OnEvent('loan.status.changed')
  async handleLoanStatusChangedEvent(payload: {
    loanId: string;
    status: string;
    folio: string;
    requesterId?: string;
  }) {
    if (!payload.requesterId) {
      this.logger.warn(
        `loan.status.changed fired without requesterId for loan ${payload.loanId} — skipping notification`,
      );
      return;
    }

    const title = `Loan Update: ${payload.folio}`;
    const message = `The status of loan ${payload.folio} changed to ${payload.status}.`;

    try {
      const notification = await this.notificationRepo.create({
        type: 'INFO',
        userId: payload.requesterId,
        title,
        message,
      });

      await this.notificationQueue.add('send-notification', {
        notificationId: notification.id,
        title,
        message,
      });
    } catch (err) {
      this.logger.error(
        `Failed to create notification for loan ${payload.loanId}: ${(err as Error).message}`,
      );
    }
  }

  @OnEvent('loan.overdue')
  async handleLoanOverdueEvent(payload: {
    loanId: string;
    folio: string;
    daysOverdue: number;
    requesterId?: string;
  }) {
    if (!payload.requesterId) {
      this.logger.warn(
        `loan.overdue fired without requesterId for loan ${payload.loanId} — skipping notification`,
      );
      return;
    }

    const title = `Loan Overdue Alert: ${payload.folio}`;
    const message = `Loan ${payload.folio} is ${payload.daysOverdue} day(s) overdue.`;

    try {
      const notification = await this.notificationRepo.create({
        type: 'ALERT',
        userId: payload.requesterId,
        title,
        message,
      });

      await this.notificationQueue.add('send-notification', {
        notificationId: notification.id,
        title,
        message,
      });
    } catch (err) {
      this.logger.error(
        `Failed to create overdue notification for loan ${payload.loanId}: ${(err as Error).message}`,
      );
    }
  }
}
