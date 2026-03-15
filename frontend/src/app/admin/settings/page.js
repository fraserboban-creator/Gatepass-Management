'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import { Settings as SettingsIcon, User, Bell, Shield, BookOpen, Users, AlertTriangle, Download, Database } from 'lucide-react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import HostelRulesSettings from '@/components/settings/HostelRulesSettings';
import UserManagementSettings from '@/components/settings/UserManagementSettings';
import EmergencySettings from '@/components/settings/EmergencySettings';
import ReportsSettings from '@/components/settings/ReportsSettings';
import SystemSettings from '@/components/settings/SystemSettings';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'hostel-rules', label: 'Hostel Rules', icon: BookOpen },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { id: 'reports', label: 'Reports & Export', icon: Download },
    { id: 'system', label: 'System', icon: Database },
  ];

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
        <p className="text-[var(--text-secondary)]">Manage system settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-2 space-y-1">
            {tabs.map((tab) => {
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
