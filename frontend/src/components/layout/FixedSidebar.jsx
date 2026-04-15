'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '@/lib/auth';
import ThemeToggle from '@/components/common/ThemeToggle';
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
  ],
  hod: [
    { label: 'Dashboard', href: '/hod/dashboard', icon: LayoutDashboard },
    { label: 'Analytics', href: '/hod/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/hod/settings', icon: Settings }
  ],
  os: [
    { label: 'Dashboard', href: '/os/dashboard', icon: LayoutDashboard },
    { label: 'Movement Logs', href: '/os/logs', icon: History },
    { label: 'Settings', href: '/os/settings', icon: Settings }
  ]
};

const ROLE_LABELS = {
  hod: 'Head of Department',
  os: 'Office Superintendent',
};

export default function FixedSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!user) return null;

  const items = navigationItems[user.role] || [];
  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(to bottom, var(--sidebar-from), var(--sidebar-to))' }}>
      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center shadow">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white leading-tight">Gatepass</h1>
            <p className="text-xs" style={{ color: 'var(--sidebar-text)' }}>Management System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user.full_name}</p>
            <p className="text-xs capitalize truncate" style={{ color: 'var(--sidebar-text)' }}>
              {ROLE_LABELS[user.role] || user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                active ? 'text-white shadow-sm' : ''
              }`}
              style={{
                background: active ? 'var(--sidebar-active)' : 'transparent',
                color: active ? '#fff' : 'var(--sidebar-text)',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 bg-blue-300 rounded-full" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--sidebar-border)' }}>
        <ThemeToggle />
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium"
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sidebar-text)'; }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-blue-600 text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-64 z-30 flex-col shadow-xl">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 h-screen w-64 z-50 md:hidden shadow-2xl"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
