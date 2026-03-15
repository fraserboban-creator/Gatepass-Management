'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { authService } from '@/lib/auth';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTheme } from '@/lib/theme';

export default function Sidebar({ role, onClose }) {
  const pathname = usePathname();
  const [currentTheme, setCurrentTheme] = useState('blue');

  // Load theme on mount and listen for theme changes
  useEffect(() => {
    const savedTheme = getTheme();
    setCurrentTheme(savedTheme);

    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail.theme);
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const themeGradients = {
    blue: 'from-blue-50 to-blue-100',
    purple: 'from-purple-50 to-purple-100',
    green: 'from-green-50 to-green-100',
    red: 'from-red-50 to-red-100'
  };

  const themeBorders = {
    blue: 'border-blue-200',
    purple: 'border-purple-200',
    green: 'border-green-200',
    red: 'border-red-200'
  };

  const themeTextColors = {
    blue: { primary: 'text-blue-600', secondary: 'text-blue-500', nav: 'text-blue-700', navHover: 'hover:bg-blue-200', navActive: 'bg-blue-500' },
    purple: { primary: 'text-purple-600', secondary: 'text-purple-500', nav: 'text-purple-700', navHover: 'hover:bg-purple-200', navActive: 'bg-purple-500' },
    green: { primary: 'text-green-600', secondary: 'text-green-500', nav: 'text-green-700', navHover: 'hover:bg-green-200', navActive: 'bg-green-500' },
    red: { primary: 'text-red-600', secondary: 'text-red-500', nav: 'text-red-700', navHover: 'hover:bg-red-200', navActive: 'bg-red-500' }
  };

  const themeButtonColors = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    green: 'bg-green-500 hover:bg-green-600',
    red: 'bg-red-500 hover:bg-red-600'
  };

  const getGradientColors = (theme) => {
    const colors = {
      blue: { from: '#eff6ff', to: '#dbeafe' },
      purple: { from: '#faf5ff', to: '#f3e8ff' },
      green: { from: '#f0fdf4', to: '#dcfce7' },
      red: { from: '#fef2f2', to: '#fee2e2' }
    };
    return colors[theme] || colors.blue;
  };

  const getBorderColor = (theme) => {
    const colors = {
      blue: '#bfdbfe',
      purple: '#e9d5ff',
      green: '#bbf7d0',
      red: '#fecaca'
    };
    return colors[theme] || colors.blue;
  };

  const getTextColor = (theme) => {
    const colors = {
      blue: { primary: '#2563eb', secondary: '#3b82f6' },
      purple: { primary: '#9333ea', secondary: '#a855f7' },
      green: { primary: '#059669', secondary: '#10b981' },
      red: { primary: '#dc2626', secondary: '#ef4444' }
    };
    return colors[theme] || colors.blue;
  };

  const getButtonColor = (theme) => {
    const colors = {
      blue: { bg: '#3b82f6', hover: '#2563eb' },
      purple: { bg: '#a855f7', hover: '#9333ea' },
      green: { bg: '#10b981', hover: '#059669' },
      red: { bg: '#ef4444', hover: '#dc2626' }
    };
    return colors[theme] || colors.blue;
  };

  const getNavHoverColor = (theme) => {
    const colors = {
      blue: '#dbeafe',
      purple: '#f3e8ff',
      green: '#dcfce7',
      red: '#fee2e2'
    };
    return colors[theme] || colors.blue;
  };

  const menuItems = {
    student: [
      { href: '/student/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/student/create', label: 'Create Gatepass', icon: '➕' },
      { href: '/student/history', label: 'History', icon: '📜' },
      { href: '/student/analytics', label: 'Analytics', icon: '📈' },
      { href: '/student/visitor-pass', label: 'Visitor Pass', icon: '👥' },
      { href: '/student/settings', label: 'Settings', icon: '⚙️' },
    ],
    coordinator: [
      { href: '/coordinator/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/coordinator/pending', label: 'Pending Requests', icon: '⏳' },
      { href: '/coordinator/history', label: 'Recent History', icon: '📜' },
      { href: '/coordinator/analytics', label: 'Analytics', icon: '📈' },
      { href: '/coordinator/settings', label: 'Settings', icon: '⚙️' },
    ],
    warden: [
      { href: '/warden/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/warden/pending', label: 'Pending Approvals', icon: '⏳' },
      { href: '/warden/history', label: 'History', icon: '📜' },
      { href: '/warden/analytics', label: 'Analytics', icon: '📈' },
      { href: '/warden/settings', label: 'Settings', icon: '⚙️' },
    ],
    security: [
      { href: '/security/scanner', label: 'QR Scanner', icon: '📷' },
      { href: '/security/logs', label: 'Recent Logs', icon: '📋' },
      { href: '/security/walk-in-visitors', label: 'Walk-in Visitors', icon: '🚶' },
      { href: '/security/settings', label: 'Settings', icon: '⚙️' },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/admin/users', label: 'User Management', icon: '👥' },
      { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
      { href: '/admin/visitor-logs', label: 'Visitor Logs', icon: '📋' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ],
  };

  const items = menuItems[role] || [];

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div 
      className="w-64 h-screen shadow-sm flex flex-col border-r transition-colors duration-200"
      style={{
        background: `linear-gradient(to bottom, ${getGradientColors(currentTheme).from}, ${getGradientColors(currentTheme).to})`,
        borderColor: getBorderColor(currentTheme)
      }}
    >
      <motion.div 
        className="p-6 border-b flex justify-between items-start"
        style={{ borderColor: getBorderColor(currentTheme) }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-xl font-bold" style={{ color: getTextColor(currentTheme).primary }}>Hostel Gatepass</h1>
          <p className="text-sm capitalize" style={{ color: getTextColor(currentTheme).secondary }}>{role} Portal</p>
        </div>
        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden transition-colors"
            style={{ color: getTextColor(currentTheme).secondary }}
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        )}
      </motion.div>

      <motion.nav 
        className="flex-1 p-4 space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.href}
            variants={listItemVariants}
          >
            <Link
              href={item.href}
              onClick={onClose}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:translate-x-1"
              style={{
                backgroundColor: pathname === item.href ? getButtonColor(currentTheme).bg : 'transparent',
                color: pathname === item.href ? '#ffffff' : getTextColor(currentTheme).primary,
                boxShadow: pathname === item.href ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.backgroundColor = getNavHoverColor(currentTheme);
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <motion.span
                className="text-xl"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.span>
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.nav>

      <motion.div 
        className="p-4 border-t"
        style={{ borderColor: getBorderColor(currentTheme) }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          style={{ backgroundColor: getButtonColor(currentTheme).bg }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = getButtonColor(currentTheme).hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = getButtonColor(currentTheme).bg;
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
