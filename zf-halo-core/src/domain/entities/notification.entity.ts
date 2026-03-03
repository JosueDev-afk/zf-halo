import { User } from './user.entity';

export type NotificationStatus = 'UNREAD' | 'READ';
export type NotificationType = 'INFO' | 'ALERT' | 'ESCALATION';

export interface InternalNotification {
  readonly id: string;
  readonly userId: string;
  readonly user?: User;
  readonly title: string;
  readonly message: string;
  readonly status: NotificationStatus;
  readonly type: NotificationType;
  readonly createdAt: Date;
}
