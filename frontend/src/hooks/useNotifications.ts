'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { Notification } from '@/types/notification';
import { useToast } from '@/components/notifications/ToastContainer';

// Demo accounts (HOD/OS) use a fake token ending in .demo — skip API calls for them
function isDemoAccount(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token') || '';
  return token.endsWith('.demo');
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { showToast } = useToast();
  const prevCountRef = useRef(0);

  const fetchNotifications = useCallback(async () => {
    // Skip for demo accounts — they have no real backend session
    if (isDemoAccount()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/notifications?limit=50');
      const data = response.data.data;

      const newNotifications: Notification[] = data.notifications || [];
      const newUnreadCount: number = data.unreadCount || 0;

      // Show toast for genuinely new unread notifications
      if (prevCountRef.current > 0 && newUnreadCount > prevCountRef.current) {
        const latestUnread = newNotifications.find(n => !n.is_read);
        if (latestUnread) showToast(latestUnread);
      }
      prevCountRef.current = newUnreadCount;

      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [showToast]); // stable — no notifications.length dependency

  const markAsRead = useCallback(async (id: number) => {
    if (isDemoAccount()) return;
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (isDemoAccount()) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
  }, [fetchNotifications]);

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refreshNotifications };
}
