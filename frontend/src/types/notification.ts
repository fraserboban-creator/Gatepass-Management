export interface Notification {
  id: number;
  user_id: number;
  gatepass_id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}
