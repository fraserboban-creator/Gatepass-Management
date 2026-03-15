'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import Chart from '@/components/common/Chart';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { FileText, Clock, CheckCircle, XCircle, RefreshCw, TrendingUp, MapPin, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoordinatorAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const [analyticsRes, destRes, reasonsRes] = await Promise.all([
        api.get('/analytics/global'),
        api.get('/analytics/destinations'),
        api.get('/analytics/reasons'),
      ]);

      setAnalytics(analyticsRes.data.data);
      setDestinations(destRes.data.data || []);
      setReasons(reasonsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Unable to load analytics data.');
      toast.error('Failed to load analytics');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchAll();
    toast.success('Analytics refreshed');
  };

  if (loading) return <LoadingState fullScreen text="Loading analytics..." />;

  if (error && !analytics) {
    return (
      <PageTransition>
        <div className="card bg-red-50 border border-red-200 p-8 text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn btn-primary">Try Again</button>
        </div>
      </PageTransition>
    );
  }

  // Normalize field names — backend returns `approved`, `pending`, etc.
  const norm = analytics ? {
    total:       analytics.totalGatepasses   || 0,
    approved:    analytics.approved          || analytics.approvedGatepasses          || analytics.coordinatorApprovedGatepasses || 0,
    pending:     analytics.pending           || analytics.pendingApprovals            || 0,
    rejected:    analytics.rejected          || analytics.rejectedGatepasses          || 0,
    completed:   analytics.completed         || analytics.completedGatepasses         || 0,
    active:      analytics.activeGatepasses  || 0,
    overdue:     analytics.overdueGatepasses || 0,
    students:    analytics.studentCount      || 0,
    coordApproved: analytics.coordinatorApproved || analytics.coordinatorApprovedGatepasses || 0,
  } : null;

  const statusChartData = norm ? [
    { label: 'Approved',   value: norm.approved },
    { label: 'Pending',    value: norm.pending },
    { label: 'Rejected',   value: norm.rejected },
    { label: 'Completed',  value: norm.completed },
  ] : [];

  const approvalRate = norm
    ? Math.round((norm.approved / Math.max(norm.total, 1)) * 100)
    : 0;

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Overview of gatepass activity</p>
        </motion.div>
        <motion.button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {norm && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Gatepasses"
              value={norm.total}
              icon={FileText}
              color="blue"
              delay={0}
            />
            <DashboardCard
              title="Pending Approval"
              value={norm.pending}
              icon={Clock}
              color="yellow"
              delay={0.1}
            />
            <DashboardCard
              title="Approved"
              value={norm.approved}
              icon={CheckCircle}
              color="green"
              delay={0.2}
            />
            <DashboardCard
              title="Rejected"
              value={norm.rejected}
              icon={XCircle}
              color="red"
              delay={0.3}
            />
          </div>

          {/* Approval Rate Banner */}
          <motion.div
            className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Approval Rate</p>
                  <p className="text-3xl font-bold text-blue-900">{approvalRate}%</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex-1 mx-8">
                <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${approvalRate}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Active Now</p>
                <p className="text-2xl font-bold text-blue-900">{norm.active}</p>
              </div>
            </div>
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Chart data={statusChartData} type="bar" title="Gatepass Status Distribution" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Chart data={statusChartData} type="pie" title="Status Breakdown" />
            </motion.div>
          </div>

          {/* Top Destinations & Common Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Destinations */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Top Destinations</h2>
              </div>
              <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                {destinations.length > 0 ? (
                  destinations.slice(0, 8).map((dest, i) => {
                    const max = destinations[0]?.count || 1;
                    const pct = Math.round((dest.count / max) * 100);
                    return (
                      <motion.div key={i} variants={listItemVariants} className="group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[var(--text-primary)] font-medium">{dest.destination}</span>
                          <span className="badge badge-primary text-xs">{dest.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i }}
                          />
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-[var(--text-tertiary)] text-sm">No data available</p>
                )}
              </motion.div>
            </motion.div>

            {/* Common Reasons */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={20} className="text-purple-600" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Common Reasons</h2>
              </div>
              <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
                {reasons.length > 0 ? (
                  reasons.slice(0, 8).map((r, i) => {
                    const max = reasons[0]?.count || 1;
                    const pct = Math.round((r.count / max) * 100);
                    return (
                      <motion.div key={i} variants={listItemVariants}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-[var(--text-primary)] font-medium truncate max-w-[75%]">{r.reason}</span>
                          <span className="badge badge-primary text-xs">{r.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-purple-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * i }}
                          />
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-[var(--text-tertiary)] text-sm">No data available</p>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Summary Stats */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: norm.students, color: 'blue' },
                { label: 'Active Gatepasses', value: norm.active, color: 'green' },
                { label: 'Completed', value: norm.completed, color: 'purple' },
                { label: 'Overdue', value: norm.overdue, color: 'red' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className={`text-center p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-200`}
                  whileHover={{ scale: 1.04, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <p className={`text-3xl font-bold text-${item.color}-600`}>{item.value}</p>
                  <p className={`text-sm text-${item.color}-700 font-medium mt-1`}>{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </PageTransition>
  );
}
