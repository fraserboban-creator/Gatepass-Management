'use client';

import { Check, CheckCheck, Inbox } from 'lucide-react';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import { Notification } from '@/types/notification';
import { groupNotificationsByDate } from '@/lib/notificationUtils';

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  onClose: () => void;
  onMarkAsRead: (id: number) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

export default function NotificationDropdown({
  notifications,
  loading,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const groupedNotifications = groupNotificationsByDate(notifications);
  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[var(--bg-secondary)] rounded-xl shadow-2xl border border-[var(--border-primary)] z-50 animate-slideDown">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)]">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Notifications
          </h3>
          {notifications.length > 0 && (
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {notifications.filter(n => !n.is_read).length} unread
            </p>
          )}
        </div>
        
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[480px] overflow-y-auto">
        {loading ? (
          <div className="p-2">
            {[1, 2, 3].map((i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">
              No notifications
            </h4>
            <p className="text-xs text-[var(--text-tertiary)] text-center">
              You're all caught up! Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(groupedNotifications).map(([date, items]) => (
              <div key={date} className="mb-4 last:mb-0">
                <div className="sticky top-0 bg-[var(--bg-secondary)] px-3 py-2 z-10">
                  <h4 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    {date}
                  </h4>
                </div>
                <div className="space-y-1">
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-[var(--border-primary)]">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
