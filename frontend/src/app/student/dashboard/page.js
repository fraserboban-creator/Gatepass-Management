'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { authService } from '@/lib/auth';
import StatCard from '@/components/common/StatCard';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { FileText, Clock, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  const [recentGatepasses, setRecentGatepasses] = useState([]);
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
      const response = await api.get('/gatepass/history?limit=5');
      const gatepasses = response.data.data.gatepasses;
      
      setRecentGatepasses(gatepasses);
      
      // Calculate stats
      setStats({
        total: gatepasses.length,
        pending: gatepasses.filter(g => g.status === 'pending').length,
        approved: gatepasses.filter(g => g.status === 'approved').length,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, destination) => {
    if (!confirm(`Are you sure you want to delete the gatepass to ${destination}?`)) {
      return;
    }

    const toastId = toast.loading('Deleting gatepass...');
    try {
      await api.delete(`/gatepass/${id}`);
      toast.success('Gatepass deleted successfully!', { id: toastId });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete gatepass', { id: toastId });
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
        Welcome, {user?.full_name}!
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard 
          title="Total Gatepasses" 
          value={stats.total} 
          icon={FileText}
          color="blue"
          delay={0}
        />
        <DashboardCard 
          title="Pending" 
          value={stats.pending} 
          icon={Clock}
          color="yellow"
          trend="up"
          trendValue={stats.pending > 0 ? `${stats.pending} pending` : 'None'}
          delay={0.1}
        />
        <DashboardCard 
          title="Approved" 
          value={stats.approved} 
          icon={CheckCircle}
          color="green"
          delay={0.2}
        />
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Recent Gatepasses</h2>
          <button
            onClick={() => router.push('/student/create')}
            className="btn btn-primary"
          >
            + Create New
          </button>
        </div>

        {recentGatepasses.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No gatepasses yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Destination</th>
                  <th>Leave Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {recentGatepasses.map((gatepass) => (
                  <motion.tr 
                    key={gatepass.id}
                    variants={listItemVariants}
                  >
                    <td>{gatepass.enrollment_number || 'N/A'}</td>
                    <td>{gatepass.destination}</td>
                    <td>{formatDateTime(gatepass.leave_time)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(gatepass.status)}`}>
                        {getStatusLabel(gatepass.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-3 items-center justify-start">
                        <button
                          onClick={() => router.push(`/student/history`)}
                          className="btn btn-sm btn-secondary"
                        >
                          View
                        </button>
                        {gatepass.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(gatepass.id, gatepass.destination)}
                            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white ml-2"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.div>
    </PageTransition>
  );
}
