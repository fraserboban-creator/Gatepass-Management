'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { authService } from '@/lib/auth';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';
import AIAssistantCard from '@/components/admin/AIAssistantCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGatepasses: 0,
    pendingApprovals: 0,
    activeGatepasses: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const analyticsResponse = await api.get('/admin/analytics');
      const analytics = analyticsResponse.data.data;
      
      setStats({
        totalUsers: analytics.totalUsers || 0,
        totalGatepasses: analytics.totalGatepasses || 0,
        pendingApprovals: analytics.pendingApprovals || 0,
        activeGatepasses: analytics.activeGatepasses || 0,
      });

      const activityResponse = await api.get('/admin/logs?limit=10');
      setRecentActivity(activityResponse.data.data.logs || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState fullScreen text="Loading dashboard..." />;
  }

  return (
    <PageTransition>
      <motion.h1 
        className="text-3xl font-bold mb-6 text-[var(--text-primary)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Admin Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon={Users}
          color="blue"
          delay={0}
        />
        <DashboardCard 
          title="Total Gatepasses" 
          value={stats.totalGatepasses} 
          icon={FileText}
          color="purple"
          delay={0.1}
        />
        <DashboardCard 
          title="Pending Approvals" 
          value={stats.pendingApprovals} 
          icon={Clock}
          color="yellow"
          delay={0.2}
        />
        <DashboardCard 
          title="Active Gatepasses" 
          value={stats.activeGatepasses} 
          icon={CheckCircle}
          color="green"
          delay={0.3}
        />
      </div>

      <motion.div
        className="col-span-full mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <AIAssistantCard adminId={user?.id} onCommandExecuted={fetchData} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Recent Activity</h2>
          
          {recentActivity.length === 0 ? (
            <p className="text-[var(--text-tertiary)] text-center py-8">No recent activity</p>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {recentActivity.map((log, index) => (
                <motion.div 
                  key={index} 
                  className="border-l-4 border-blue-600 pl-4 py-2 hover:bg-[var(--surface-hover)] rounded transition-colors"
                  variants={listItemVariants}
                >
                  <p className="font-medium text-[var(--text-primary)]">{log.log_type} - {log.destination || 'Activity'}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{log.student_name} ({log.user_email})</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{new Date(log.timestamp).toLocaleString()}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = '/admin/users'}
              className="btn btn-primary w-full justify-start"
            >
              👥 Manage Users
            </button>
            <button 
              onClick={() => window.location.href = '/admin/analytics'}
              className="btn btn-secondary w-full justify-start"
            >
              📈 View Analytics
            </button>
            <button 
              onClick={fetchData}
              className="btn btn-secondary w-full justify-start"
            >
              🔄 Refresh Dashboard
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="card mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-lg">
            <span className="text-[var(--text-primary)]">Database</span>
            <span className="badge badge-success">Online</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-lg">
            <span className="text-[var(--text-primary)]">API Server</span>
            <span className="badge badge-success">Running</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-lg">
            <span className="text-[var(--text-primary)]">QR Service</span>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
