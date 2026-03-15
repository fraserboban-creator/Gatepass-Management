'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { authService } from '@/lib/auth';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import DashboardCard from '@/components/common/DashboardCard';
import StudentProfileModal from '@/components/student/StudentProfileModal';
import OverdueStudentsSection from '@/components/overdue/OverdueStudentsSection';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import RejectModal from '@/components/common/RejectModal';

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [pendingGatepasses, setPendingGatepasses] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { selectedStudent, openProfile, closeProfile } = useStudentProfile();
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, studentName: '' });

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pendingResponse = await api.get('/gatepass/pending');
      const pending = pendingResponse.data.data.gatepasses || [];
      setPendingGatepasses(pending);

      try {
        const analyticsResponse = await api.get('/admin/analytics');
        const analytics = analyticsResponse.data.data;
        
        setStats({
          total: analytics.totalGatepasses || 0,
          pending: analytics.pendingApprovals || 0,
          approved: analytics.coordinatorApprovedGatepasses || 0,
          rejected: analytics.rejectedGatepasses || 0,
        });
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setStats({
          total: pending.length,
          pending: pending.filter(g => g.status === 'pending').length,
          approved: pending.filter(g => g.status === 'coordinator_approved').length,
          rejected: pending.filter(g => g.status === 'rejected').length,
        });
      }
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
        comments: 'Approved by coordinator',
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
        Coordinator Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Total Gatepasses" 
          value={stats.total} 
          icon={FileText}
          color="blue"
          delay={0}
        />
        <DashboardCard 
          title="Pending Approval" 
          value={stats.pending} 
          icon={Clock}
          color="yellow"
          delay={0.1}
        />
        <DashboardCard 
          title="Approved" 
          value={stats.approved} 
          icon={CheckCircle}
          color="green"
          delay={0.2}
        />
        <DashboardCard 
          title="Rejected" 
          value={stats.rejected} 
          icon={XCircle}
          color="red"
          delay={0.3}
        />
      </div>

      {/* Overdue Students Section */}
      <OverdueStudentsSection userRole="coordinator" />

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Pending Gatepasses</h2>
        </div>

        {pendingGatepasses.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No pending gatepasses</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
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
                    <td>{gatepass.enrollment_number || '-'}</td>
                    <td>{gatepass.destination}</td>
                    <td>{formatDateTime(gatepass.leave_time)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(gatepass.status)}`}>
                        {getStatusLabel(gatepass.status)}
                      </span>
                    </td>
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
                        </button>                        <button
                          onClick={() => openProfile(gatepass.student_id)}
                          className="btn btn-sm btn-secondary"
                          title="View Profile"
                        >
                          <Eye size={16} />
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          studentId={selectedStudent}
          userRole="coordinator"
          onClose={closeProfile}
        />
      )}

      {/* Reject Modal */}
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
