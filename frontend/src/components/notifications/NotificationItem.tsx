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
  info: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
  success: 'text-green-500 bg-green-50 dark:bg-green-950/30',
  warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
  error: 'text-red-500 bg-red-50 dark:bg-red-950/30',
};

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const Icon = iconMap[notification.type] || Info;
  const colorClass = colorMap[notification.type] || colorMap.info;

  return (
    <div
      className={`group relative p-3 rounded-lg transition-all duration-200 cursor-pointer ${
        notification.is_read
          ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/50 opacity-60'
          : 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
              {notification.title}
            </h4>
            
            {/* Unread Indicator */}
            {!notification.is_read && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {notification.message}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatNotificationTime(notification.created_at)}
            </span>

            {/* Mark as Read Button */}
            {!notification.is_read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/50 rounded transition-all"
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
