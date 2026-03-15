'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { authService } from '@/lib/auth';
import {
  LayoutDashboard,
  FileText,
  History,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  QrCode,
  UserPlus,
  Shield,
  Lock
} from 'lucide-react';

const navigationItems = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Create Gatepass', href: '/student/create', icon: FileText },
    { label: 'History', href: '/student/history', icon: History },
    { label: 'Visitor Pass', href: '/student/visitor-pass', icon: Users },
    { label: 'Analytics', href: '/student/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/student/settings', icon: Settings }
  ],
  coordinator: [
    { label: 'Dashboard', href: '/coordinator/dashboard', icon: LayoutDashboard },
    { label: 'Pending', href: '/coordinator/pending', icon: FileText },
    { label: 'History', href: '/coordinator/history', icon: History },
    { label: 'Analytics', href: '/coordinator/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/coordinator/settings', icon: Settings }
  ],
  warden: [
    { label: 'Dashboard', href: '/warden/dashboard', icon: LayoutDashboard },
    { label: 'Pending', href: '/warden/pending', icon: FileText },
    { label: 'History', href: '/warden/history', icon: History },
    { label: 'Analytics', href: '/warden/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/warden/settings', icon: Settings }
  ],
  security: [
    { label: 'Dashboard', href: '/security/dashboard', icon: LayoutDashboard },
    { label: 'Scanner', href: '/security/scanner', icon: QrCode },
    { label: 'Walk-in Visitors', href: '/security/walk-in-visitors', icon: UserPlus },
    { label: 'Logs', href: '/security/logs', icon: History },
    { label: 'Settings', href: '/security/settings', icon: Settings }
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Visitor Logs', href: '/admin/visitor-logs', icon: History },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ]
};

export default function FixedSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  if (!user) return null;

  const items = navigationItems[user.role] || [];
  const isActive = (href) => pathname === href;

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 bg-blue-600 text-white rounded-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-xl z-30 flex flex-col transition-transform md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-300" size={32} />
            <div>
              <h1 className="font-bold text-lg">Gatepass</h1>
              <p className="text-xs text-blue-300">Management System</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-blue-700">
          <p className="text-sm text-blue-200">Logged in as</p>
          <p className="font-semibold text-white truncate">{user.full_name}</p>
          <p className="text-xs text-blue-300 capitalize">{user.role}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <motion.button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    layoutId="activeIndicator"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-600 hover:text-white transition-all"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </>
  );
}
