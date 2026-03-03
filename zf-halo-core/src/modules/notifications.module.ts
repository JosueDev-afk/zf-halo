import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationPrismaRepository } from '../infrastructure/persistence/prisma/notification.prisma.repository';
import { NOTIFICATION_REPOSITORY } from '../domain/repositories/notification.repository.interface';
import { NotificationProcessor } from '../infrastructure/jobs/notification.processor';
import { LoanEventListener } from '../infrastructure/events/loan-event.listener';
import { PrismaModule } from '../infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: NotificationPrismaRepository,
    },
    NotificationProcessor,
    LoanEventListener,
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationsModule {}
