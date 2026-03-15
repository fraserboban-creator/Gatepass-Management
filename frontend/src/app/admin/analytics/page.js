'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import Chart from '@/components/common/Chart';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { Users, FileText, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const response = await api.get('/admin/analytics');
      
      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError('Unable to load analytics data.');
      }
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
    fetchAnalytics();
    toast.success('Analytics refreshed');
  };

  if (loading && !analytics) {
    return <LoadingState fullScreen text="Loading analytics..." />;
  }

  if (error && !analytics) {
    return (
      <PageTransition>
        <div className="card bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </PageTransition>
    );
  }

  const statusChartData = analytics ? [
    { label: 'Approved', value: analytics.approvedGatepasses || 0 },
    { label: 'Pending', value: analytics.pendingApprovals || 0 },
    { label: 'Rejected', value: analytics.rejectedGatepasses || 0 },
    { label: 'Completed', value: analytics.completedGatepasses || 0 },
  ] : [];

  const userChartData = analytics ? [
    { label: 'Students', value: analytics.studentCount || 0 },
    { label: 'Coordinators', value: analytics.coordinatorCount || 0 },
    { label: 'Wardens', value: analytics.wardenCount || 0 },
    { label: 'Security', value: analytics.securityCount || 0 },
    { label: 'Admins', value: analytics.adminCount || 0 },
  ] : [];

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          className="text-3xl font-bold text-blue-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          System Analytics
        </motion.h1>
        <motion.button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Search and Filters - removed unclosed div */}

      {/* Error Message */}
      {error && (        <motion.div
          className="card bg-red-50 border border-red-200 mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Statistics Cards */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard 
              title="Total Users" 
              value={analytics.totalUsers || 0} 
              icon={Users}
              color="blue"
              delay={0}
            />
            <DashboardCard 
              title="Total Gatepasses" 
              value={analytics.totalGatepasses || 0} 
              icon={FileText}
              color="purple"
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
              title="Active" 
              value={analytics.activeGatepasses || 0} 
              icon={CheckCircle}
              color="green"
              delay={0.3}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Chart
                data={statusChartData}
                type="bar"
                title="Gatepass Status Distribution"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Chart
                data={statusChartData}
                type="pie"
                title="Status Breakdown"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Chart
                data={userChartData}
                type="bar"
                title="User Distribution by Role"
              />
            </motion.div>

            <motion.div 
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-blue-900">Top Destinations</h2>
              <motion.div 
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {analytics.topDestinations && analytics.topDestinations.length > 0 ? (
                  analytics.topDestinations.map((dest, index) => (
                    <motion.div 
                      key={index} 
                      className="flex justify-between items-center py-2 border-b border-blue-200 hover:bg-blue-50 px-2 rounded transition-colors"
                      variants={listItemVariants}
                    >
                      <span className="text-blue-900">{dest.destination}</span>
                      <span className="badge badge-primary">{dest.count}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-blue-400">No data available</p>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Detailed Statistics */}
          <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-900">Detailed Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <motion.div 
                className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-3xl font-bold text-blue-600">{analytics.studentCount || 0}</p>
                <p className="text-sm text-blue-700 font-medium">Students</p>
              </motion.div>
              <motion.div 
                className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-3xl font-bold text-emerald-600">{analytics.coordinatorCount || 0}</p>
                <p className="text-sm text-emerald-700 font-medium">Coordinators</p>
              </motion.div>
              <motion.div 
                className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-3xl font-bold text-amber-600">{analytics.wardenCount || 0}</p>
                <p className="text-sm text-amber-700 font-medium">Wardens</p>
              </motion.div>
              <motion.div 
                className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-3xl font-bold text-purple-600">{analytics.securityCount || 0}</p>
                <p className="text-sm text-purple-700 font-medium">Security</p>
              </motion.div>
              <motion.div 
                className="text-center p-4 bg-red-50 rounded-lg border border-red-200"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-3xl font-bold text-red-600">{analytics.adminCount || 0}</p>
                <p className="text-sm text-red-700 font-medium">Admins</p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </PageTransition>
  );
}
