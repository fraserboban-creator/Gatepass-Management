'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import { Settings as SettingsIcon, User, Bell, Shield, BookOpen, Users, Palette, AlertTriangle, Download, Database } from 'lucide-react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import HostelRulesSettings from '@/components/settings/HostelRulesSettings';
import UserManagementSettings from '@/components/settings/UserManagementSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import EmergencySettings from '@/components/settings/EmergencySettings';
import ReportsSettings from '@/components/settings/ReportsSettings';
import SystemSettings from '@/components/settings/SystemSettings';
import { authService } from '@/lib/auth';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, roles: ['student', 'security', 'coordinator', 'warden', 'admin'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['student', 'security', 'coordinator', 'warden', 'admin'] },
    { id: 'security', label: 'Security', icon: Shield, roles: ['student', 'security', 'coordinator', 'warden', 'admin'] },
    { id: 'hostel-rules', label: 'Hostel Rules', icon: BookOpen, roles: ['admin'] },
    { id: 'user-management', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, roles: ['student', 'security', 'coordinator', 'warden', 'admin'] },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle, roles: ['admin', 'warden'] },
    { id: 'reports', label: 'Reports & Export', icon: Download, roles: ['admin', 'warden'] },
    { id: 'system', label: 'System', icon: Database, roles: ['admin'] },
  ];

  const visibleTabs = tabs.filter(tab => 
    user && tab.roles.includes(user.role)
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'hostel-rules':
        return <HostelRulesSettings />;
      case 'user-management':
        return <UserManagementSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'emergency':
        return <EmergencySettings />;
      case 'reports':
        return <ReportsSettings />;
      case 'system':
        return <SystemSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Settings</h1>
        </div>
        <p className="text-[var(--text-secondary)]">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="card p-2 space-y-1">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
