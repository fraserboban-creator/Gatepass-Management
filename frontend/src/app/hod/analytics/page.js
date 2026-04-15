'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import Chart from '@/components/common/Chart';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { FileText, Clock, CheckCircle, XCircle, RefreshCw, TrendingUp, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock department data for HOD-specific view — AI & ML only
const DEPT_DATA = [
  { dept: 'AI & Machine Learning', total: 24, approved: 18, pending: 4, rejected: 2, overdue: 1 },
];

export default function HODAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get('/analytics/global');
      setAnalytics(res.data.data);
    } catch {
      // Fall back to mock totals derived from dept data
      const totals = DEPT_DATA.reduce((acc, d) => ({
        total: acc.total + d.total,
        approved: acc.approved + d.approved,
        pending: acc.pending + d.pending,
        rejected: acc.rejected + d.rejected,
        overdue: acc.overdue + d.overdue,
      }), { total: 0, approved: 0, pending: 0, rejected: 0, overdue: 0 });
      setAnalytics(totals);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const handleRefresh = () => { setLoading(true); fetchAll(); toast.success('Analytics refreshed'); };

  if (loading) return <LoadingState fullScreen text="Loading analytics..." />;

  const norm = {
    total:    analytics?.totalGatepasses || analytics?.total    || 76,
    approved: analytics?.approved        || analytics?.approved || 57,
    pending:  analytics?.pendingApprovals || analytics?.pending || 11,
    rejected: analytics?.rejectedGatepasses || analytics?.rejected || 8,
    overdue:  analytics?.overdueGatepasses  || analytics?.overdue  || 3,
  };

  const approvalRate = Math.round((norm.approved / Math.max(norm.total, 1)) * 100);

  const statusChartData = [
    { label: 'Approved', value: norm.approved },
    { label: 'Pending',  value: norm.pending },
    { label: 'Rejected', value: norm.rejected },
    { label: 'Overdue',  value: norm.overdue },
  ];

  const deptChartData = DEPT_DATA.map(d => ({ label: d.dept, value: d.total }));

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">HOD Analytics</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">AI & Machine Learning — gatepass overview</p>
        </motion.div>
        <motion.button onClick={handleRefresh} disabled={isRefreshing}
          className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total Requests" value={norm.total}    icon={FileText}     color="blue"   delay={0}   />
        <DashboardCard title="Approved"        value={norm.approved} icon={CheckCircle}  color="green"  delay={0.1} />
        <DashboardCard title="Pending"         value={norm.pending}  icon={Clock}        color="yellow" delay={0.2} />
        <DashboardCard title="Rejected"        value={norm.rejected} icon={XCircle}      color="red"    delay={0.3} />
      </div>

      {/* Approval Rate Banner */}
      <motion.div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
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
          <div className="flex-1 mx-8">
            <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${approvalRate}%` }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }} />
            </div>
            <div className="flex justify-between text-xs text-blue-500 mt-1"><span>0%</span><span>100%</span></div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{norm.overdue}</p>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Chart data={statusChartData} type="bar" title="Gatepass Status Distribution" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Chart data={deptChartData} type="pie" title="Requests by Department" />
        </motion.div>
      </div>

      {/* Department Breakdown Table */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Department Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Total</th>
                <th>Approved</th>
                <th>Pending</th>
                <th>Rejected</th>
                <th>Overdue</th>
                <th>Approval %</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
              {DEPT_DATA.map((d) => (
                <motion.tr key={d.dept} variants={listItemVariants}>
                  <td className="font-medium">{d.dept}</td>
                  <td>{d.total}</td>
                  <td><span className="badge badge-success">{d.approved}</span></td>
                  <td><span className="badge badge-warning">{d.pending}</span></td>
                  <td><span className="badge badge-danger">{d.rejected}</span></td>
                  <td><span className={d.overdue > 0 ? 'badge badge-danger' : 'badge badge-success'}>{d.overdue}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.round((d.approved / d.total) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)] w-8">
                        {Math.round((d.approved / d.total) * 100)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </PageTransition>
  );
}
