'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import RejectModal from '@/components/common/RejectModal';
import { containerVariants, listItemVariants } from '@/lib/animations';

export default function WardenPending() {
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, studentName: '' });

  useEffect(() => {
    fetchGatepasses();
  }, []);

  const fetchGatepasses = async () => {
    try {
      const response = await api.get('/gatepass/pending');
      const allGatepasses = response.data.data.gatepasses || [];
      const coordinatorApproved = allGatepasses.filter(g => g.status === 'coordinator_approved');
      setGatepasses(coordinatorApproved);
    } catch (error) {
      console.error('Failed to fetch gatepasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const toastId = toast.loading('Approving gatepass...');
    try {
      await api.post(`/gatepass/${id}/approve`, {
        action: 'approve',
        comments: 'Final approval by warden',
      });
      toast.success('Gatepass approved!', { id: toastId });
      fetchGatepasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve', { id: toastId });
    }
  };

  const handleReject = async (id, comments) => {
    const toastId = toast.loading('Rejecting gatepass...');
    try {
      await api.post(`/gatepass/${id}/approve`, {
        action: 'reject',
        comments,
      });
      toast.success('Gatepass rejected', { id: toastId });
      fetchGatepasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject', { id: toastId });
    }
  };

  if (loading) {
    return <LoadingState fullScreen text="Loading pending approvals..." />;
  }

  return (
    <PageTransition>
      <motion.h1 
        className="text-3xl font-bold mb-6 text-[var(--text-primary)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Pending Approvals
      </motion.h1>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {gatepasses.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No pending approvals</p>
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
                {gatepasses.map((gatepass) => (
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
