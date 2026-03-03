import {
  InternalNotification,
  NotificationType,
} from '../entities/notification.entity';
import { PaginatedResult } from '../../application/dtos/common/paginated-result.dto';

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

export interface INotificationRepository {
  create(data: CreateNotificationData): Promise<InternalNotification>;
  findByUserId(
    userId: string,
    skip?: number,
    take?: number,
  ): Promise<PaginatedResult<InternalNotification>>;
  markAsRead(id: string): Promise<InternalNotification>;
  getUnreadCount(userId: string): Promise<number>;
}

export const NOTIFICATION_REPOSITORY = Symbol('INotificationRepository');
