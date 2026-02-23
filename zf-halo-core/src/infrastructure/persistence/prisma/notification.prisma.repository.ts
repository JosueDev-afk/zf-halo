import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  INotificationRepository,
  CreateNotificationData,
} from '../../../domain/repositories/notification.repository.interface';
import {
  InternalNotification,
  NotificationStatus,
  NotificationType,
} from '../../../domain/entities/notification.entity';
import { PaginatedResult } from '../../../application/dtos/common/paginated-result.dto';

@Injectable()
export class NotificationPrismaRepository implements INotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationData): Promise<InternalNotification> {
    const record = await this.prisma.internalNotification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
      },
    });
    return record as unknown as InternalNotification;
  }

  async findByUserId(
    userId: string,
    skip = 0,
    take = 10,
  ): Promise<PaginatedResult<InternalNotification>> {
    const [total, items] = await this.prisma.$transaction([
      this.prisma.internalNotification.count({ where: { userId } }),
      this.prisma.internalNotification.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      items: items as unknown as InternalNotification[],
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      pages: Math.ceil(total / take),
    };
  }

  async markAsRead(id: string): Promise<InternalNotification> {
    const record = await this.prisma.internalNotification.update({
      where: { id },
      data: { status: 'READ' },
    });
    return record as unknown as InternalNotification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.prisma.internalNotification.count({
      where: { userId, status: 'UNREAD' },
    });
  }
}
