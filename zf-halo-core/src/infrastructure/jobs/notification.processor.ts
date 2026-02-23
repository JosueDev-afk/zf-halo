import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository.interface';
import type { INotificationRepository } from '../../domain/repositories/notification.repository.interface';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepo: INotificationRepository,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-notification': {
        const { notificationId, title, message } = job.data;
        this.logger.log(
          `Processing notification [${notificationId}]: ${title}`,
        );

        // Output for console demo
        this.logger.debug(
          `EMAIL CONTENT:\nTitle: ${title}\nMessage: ${message}`,
        );

        // TODO: Integrate with SendGrid, Resend, or OneSignal API here

        this.logger.log(
          `Notification [${notificationId}] processing completed.`,
        );
        break;
      }
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
