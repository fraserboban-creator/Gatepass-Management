'use client';

import { Check, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '@/types/notification';
import { formatNotificationTime } from '@/lib/notificationUtils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => Promise<void>;
}

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colorMap = {
  info: 'text-blue-500 bg-blue-100',
  success: 'text-green-500 bg-green-100',
  warning: 'text-yellow-500 bg-yellow-100',
  error: 'text-red-500 bg-red-100',
};

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = iconMap[notification.type] || Info;
  const colorClass = colorMap[notification.type] || colorMap.info;

  return (
    <div
      className={`group relative p-3 rounded-lg transition-all duration-200 cursor-pointer ${
        notification.is_read
          ? 'opacity-60 hover:bg-[var(--surface-hover)]'
          : 'bg-blue-50/40 hover:bg-[var(--surface-hover)]'
      }`}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">
              {formatNotificationTime(notification.created_at)}
            </span>

            {!notification.is_read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] rounded transition-all"
              >
                <Check className="w-3 h-3" />
                Mark read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
