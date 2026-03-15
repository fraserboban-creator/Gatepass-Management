'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import DashboardCard from '@/components/common/DashboardCard';
import Chart from '@/components/common/Chart';
import LoadingState from '@/components/common/LoadingState';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function AnalyticsDashboard({ role, studentId = null }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [studentId, role]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/analytics/dashboard';
      
      if (studentId && role !== 'student') {
        url = `/analytics/student/${studentId}/filtered`;
      } else if (role === 'student' && studentId) {
        url = `/analytics/student/${studentId}`;
      } else if (role !== 'security' && !studentId) {
        url = '/analytics/global';
      }

      console.log('Fetching analytics from:', url);
      
      const response = await api.get(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch analytics');
      }

      setAnalytics(response.data.data || {});
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError(error.message || 'Failed to load analytics. Please try again.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState fullScreen text="Loading analytics..." />;
  }

  if (error) {
    return (
      <motion.div
        className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="text-red-600 dark:text-red-400 text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-700 dark:text-red-300">Error Loading Analytics</h3>
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="ml-auto btn btn-sm btn-primary"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  if (!analytics || Object.keys(analytics).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-tertiary)]">No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data
  const statusChartData = [
    { label: 'Approved', value: analytics.approved || 0 },
    { label: 'Pending', value: analytics.pending || 0 },
    { label: 'Rejected', value: analytics.rejected || 0 },
    { label: 'Completed', value: analytics.completed || 0 },
  ];

  const destinationChartData = (analytics.topDestinations || []).map(d => ({
    label: d.destination,
    value: d.count
  }));

  const reasonChartData = (analytics.commonReasons || []).map(r => ({
    label: r.reason,
    value: r.count
  }));

  const dailyChartData = (analytics.dailyActivity || analytics.dailyStats || []).map(d => ({
    label: d.date,
    value: d.count
  }));

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <DashboardCard
            title="Total Gatepasses"
            value={analytics.totalGatepasses || 0}
            icon={FileText}
            color="blue"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <DashboardCard
            title="Approved"
            value={analytics.approved || 0}
            icon={CheckCircle}
            color="green"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <DashboardCard
            title="Pending"
            value={analytics.pending || 0}
            icon={Clock}
            color="yellow"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <DashboardCard
            title="Rejected"
            value={analytics.rejected || 0}
            icon={XCircle}
            color="red"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <DashboardCard
            title="Approval Rate"
            value={`${analytics.approvalRate || 0}%`}
            icon={TrendingUp}
            color="purple"
          />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Chart
            data={dailyChartData}
            type="line"
            title="Gatepass Activity"
            height={300}
          />
        </motion.div>

        {/* Status Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Chart
            data={statusChartData}
            type="pie"
            title="Status Distribution"
            height={300}
          />
        </motion.div>

        {/* Top Destinations Chart */}
        {destinationChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Chart
              data={destinationChartData}
              type="bar"
              title="Popular Destinations"
              height={300}
            />
          </motion.div>
        )}

        {/* Common Reasons Chart */}
        {reasonChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Chart
              data={reasonChartData}
              type="doughnut"
              title="Reasons Distribution"
              height={300}
            />
          </motion.div>
        )}
      </div>

      {/* Top Destinations List */}
      {analytics.topDestinations && analytics.topDestinations.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Top Destinations
          </h3>
          <motion.div
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {analytics.topDestinations.map((dest, index) => (
              <motion.div
                key={index}
                className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-lg"
                variants={listItemVariants}
              >
                <span className="text-[var(--text-primary)]">{dest.destination}</span>
                <span className="badge badge-primary">{dest.count}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Common Reasons List */}
      {analytics.commonReasons && analytics.commonReasons.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Common Reasons
          </h3>
          <motion.div
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {analytics.commonReasons.map((reason, index) => (
              <motion.div
                key={index}
                className="flex justify-between items-center p-3 bg-[var(--surface-hover)] rounded-lg"
                variants={listItemVariants}
              >
                <span className="text-[var(--text-primary)]">{reason.reason}</span>
                <span className="badge badge-secondary">{reason.count}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
