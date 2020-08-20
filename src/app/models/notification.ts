export default interface Notification {
  notification_time: string;
  user_email: string;
  sender_email: string;
  sender_location: string;
  subject: string;
}

export interface NotificationData {
  data?: Notification[],
  lastEvalKey?: LastEvalKey,
  stats?: NotificationDataStats
}

export interface LastEvalKey {
  notificationId: string;
  notificationTime: string;
  notificationType: string;
}

export interface NotificationDataStats {
  sender_location: object;
  subject: object;
}
