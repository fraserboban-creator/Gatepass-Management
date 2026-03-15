'use client';

import '../styles/globals.css'
import '../styles/layoutSystem.css'
import { ToastProvider } from '@/components/notifications/ToastContainer'
import { Toaster } from 'react-hot-toast'
import FixedSidebar from '@/components/layout/FixedSidebar'
import FloatingActionButtons from '@/components/layout/FloatingActionButtons'
import ErrorPopupContainer from '@/components/error/ErrorPopupContainer'
import PageContainer from '@/components/layout/PageContainer'
import { ErrorProvider } from '@/context/ErrorContext'
import { EmergencyProvider } from '@/context/EmergencyContext'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { initializeTheme } from '@/lib/theme'

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  // Apply saved theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <html lang="en">
      <body>
        <ErrorProvider>
          <EmergencyProvider>
            <ToastProvider>
              {!isLoginPage && <FixedSidebar />}
              <ErrorPopupContainer />
              {!isLoginPage && <FloatingActionButtons />}
              <main className={isLoginPage ? '' : 'md:ml-64 bg-[#f9fafb] min-h-screen'}>
                {isLoginPage ? children : <PageContainer>{children}</PageContainer>}
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#FFFFFF',
                    color: '#0F172A',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#FFFFFF',
                      border: '1px solid #10B981',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#FFFFFF',
                      border: '1px solid #EF4444',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: '#3B82F6',
                      secondary: '#fff',
                    },
                    style: {
                      background: '#FFFFFF',
                      border: '1px solid #3B82F6',
                    },
                  },
                }}
              />
            </ToastProvider>
          </EmergencyProvider>
        </ErrorProvider>
      </body>
    </html>
  )
}
