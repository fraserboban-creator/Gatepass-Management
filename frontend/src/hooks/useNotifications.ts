'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Notification } from '@/types/notification';
import { useToast } from '@/components/notifications/ToastContainer';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications?limit=50');
      const data = response.data.data;
      
      const newNotifications = data.notifications || [];
      const newUnreadCount = data.unreadCount || 0;

      // Check for new notifications and show toast
      if (notifications.length > 0 && newNotifications.length > notifications.length) {
        const latestNotification = newNotifications[0];
        if (!latestNotification.is_read) {
          showToast(latestNotification);
        }
      }

      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [notifications.length, showToast]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all');
      
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
}
