'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastNotification from './ToastNotification';
import { Notification } from '@/types/notification';

interface ToastContextType {
  showToast: (notification: Notification) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<(Notification & { key: string })[]>([]);

  const showToast = useCallback((notification: Notification) => {
    const key = `${notification.id}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...notification, key }]);
  }, []);

  const removeToast = useCallback((key: string) => {
    setToasts((prev) => prev.filter((toast) => toast.key !== key));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.key}
            notification={toast}
            onClose={() => removeToast(toast.key)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
