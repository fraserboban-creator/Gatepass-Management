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
import OverdueStudentsSection from '@/components/overdue/OverdueStudentsSection';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import RejectModal from '@/components/common/RejectModal';

export default function WardenDashboard() {
  const router = useRouter();
  const [pendingGatepasses, setPendingGatepasses] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, studentName: '' });

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/gatepass/pending');
      const gatepasses = response.data.data.gatepasses || [];
      const coordinatorApproved = gatepasses.filter(g => g.status === 'coordinator_approved');
      
      setPendingGatepasses(coordinatorApproved);
      setStats({
        pending: coordinatorApproved.length,
        approved: gatepasses.filter(g => g.status === 'approved').length,
        rejected: gatepasses.filter(g => g.status === 'rejected').length,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const toastId = toast.loading('Approving gatepass...');
    try {
      await api.post(`/gatepass/${id}/approve`, {
        action: 'approve',
        comments: 'Final approval granted by warden',
      });
      toast.success('Gatepass approved successfully!', { id: toastId });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve gatepass', { id: toastId });
    }
  };

  const handleReject = async (id, comments) => {
    const toastId = toast.loading('Rejecting gatepass...');
    try {
      await api.post(`/gatepass/${id}/approve`, { action: 'reject', comments });
      toast.success('Gatepass rejected', { id: toastId });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject gatepass', { id: toastId });
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
        Warden Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard 
          title="Awaiting Final Approval" 
          value={stats.pending} 
          icon={Clock}
          color="yellow"
          delay={0}
        />
        <DashboardCard 
          title="Approved" 
          value={stats.approved} 
          icon={CheckCircle}
          color="green"
          delay={0.1}
        />
        <DashboardCard 
          title="Rejected" 
          value={stats.rejected} 
          icon={XCircle}
          color="red"
          delay={0.2}
        />
      </div>

      {/* Overdue Gatepasses Section */}
      <OverdueStudentsSection userRole="warden" />

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Gatepasses Awaiting Final Approval</h2>
        </div>

        {pendingGatepasses.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No gatepasses awaiting approval</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Enrollment No</th>
                  <th>Destination</th>
                  <th>Reason</th>
                  <th>Leave Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <motion.tbody
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {pendingGatepasses.map((gatepass) => (
                  <motion.tr 
                    key={gatepass.id}
                    variants={listItemVariants}
                  >
                    <td>#{gatepass.id}</td>
                    <td>
                      <div>
                        <p className="font-medium">{gatepass.student_name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{gatepass.student_roll}</p>
                      </div>
                    </td>
                    <td>{gatepass.enrollment_number || 'N/A'}</td>
                    <td>{gatepass.destination}</td>
                    <td>{gatepass.reason}</td>
                    <td>{formatDateTime(gatepass.leave_time)}</td>
                    <td>
                      <div className="flex gap-2 items-center justify-start">
                        <button
                          onClick={() => handleApprove(gatepass.id)}
                          className="btn btn-sm btn-primary"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, id: gatepass.id, studentName: gatepass.student_name })}
                          className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </motion.div>
      <RejectModal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, id: null, studentName: '' })}
        onConfirm={handleReject}
        gatepassId={rejectModal.id}
        studentName={rejectModal.studentName}
      />
    </PageTransition>
  );
}
