import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository.interface';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Injectable()
export class LoanEventListener {
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
  }) {
    const title = `Loan Update: ${payload.folio}`;
    const message = `The status of the loan ${payload.folio} has changed to ${payload.status}.`;

    // Save to DB
    const notification = await this.notificationRepo.create({
      type: 'INFO',
      userId: '00000000-0000-0000-0000-000000000000', // Replace with dynamic logic based on loan requester/authorizer
      title,
      message,
    });

    // Enqueue job
    await this.notificationQueue.add('send-notification', {
      notificationId: notification.id,
      title,
      message,
    });
  }

  @OnEvent('loan.overdue')
  async handleLoanOverdueEvent(payload: {
    loanId: string;
    folio: string;
    daysOverdue: number;
  }) {
    const title = `Loan Overdue Alert: ${payload.folio}`;
    const message = `The loan ${payload.folio} is ${payload.daysOverdue} days overdue.`;

    const notification = await this.notificationRepo.create({
      type: 'ALERT',
      userId: '00000000-0000-0000-0000-000000000000',
      title,
      message,
    });

    await this.notificationQueue.add('send-notification', {
      notificationId: notification.id,
      title,
      message,
    });
  }
}
