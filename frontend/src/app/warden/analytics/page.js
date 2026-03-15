'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function WardenAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState fullScreen text="Loading analytics..." />;
  }

  return (
    <PageTransition>
      <motion.h1 
        className="text-3xl font-bold mb-6 text-[var(--text-primary)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Analytics
      </motion.h1>

      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Total Gatepasses" 
              value={analytics.totalGatepasses || 0} 
              icon={FileText}
              color="blue"
              delay={0}
            />
            <DashboardCard 
              title="Approved" 
              value={analytics.approvedGatepasses || 0} 
              icon={CheckCircle}
              color="green"
              delay={0.1}
            />
            <DashboardCard 
              title="Pending" 
              value={analytics.pendingApprovals || 0} 
              icon={Clock}
              color="yellow"
              delay={0.2}
            />
            <DashboardCard 
              title="Rejected" 
              value={analytics.rejectedGatepasses || 0} 
              icon={XCircle}
              color="red"
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Top Destinations</h2>
              <motion.div 
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {analytics.topDestinations?.map((dest, index) => (
                  <motion.div 
                    key={index} 
                    className="flex justify-between items-center py-2 border-b border-[var(--border-primary)] hover:bg-[var(--surface-hover)] px-2 rounded transition-colors"
                    variants={listItemVariants}
                  >
                    <span className="text-[var(--text-primary)]">{dest.destination}</span>
                    <span className="badge badge-primary">{dest.count}</span>
                  </motion.div>
                )) || <p className="text-[var(--text-tertiary)]">No data available</p>}
              </motion.div>
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">Recent Activity</h2>
              <motion.div 
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div 
                  className="flex justify-between py-2 border-b border-[var(--border-primary)] hover:bg-[var(--surface-hover)] px-2 rounded transition-colors"
                  variants={listItemVariants}
                >
                  <span className="text-[var(--text-primary)]">Today's Exits</span>
                  <span className="font-semibold text-[var(--text-primary)]">{analytics.todayExits || 0}</span>
                </motion.div>
                <motion.div 
                  className="flex justify-between py-2 border-b border-[var(--border-primary)] hover:bg-[var(--surface-hover)] px-2 rounded transition-colors"
                  variants={listItemVariants}
                >
                  <span className="text-[var(--text-primary)]">Today's Returns</span>
                  <span className="font-semibold text-[var(--text-primary)]">{analytics.todayReturns || 0}</span>
                </motion.div>
                <motion.div 
                  className="flex justify-between py-2 hover:bg-[var(--surface-hover)] px-2 rounded transition-colors"
                  variants={listItemVariants}
                >
                  <span className="text-[var(--text-primary)]">Active Gatepasses</span>
                  <span className="font-semibold text-[var(--text-primary)]">{analytics.activeGatepasses || 0}</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </PageTransition>
  );
}
