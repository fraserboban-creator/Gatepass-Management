'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import { containerVariants, listItemVariants } from '@/lib/animations';

export default function GatepassHistory() {
  const router = useRouter();
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGatepasses();
  }, []);

  const fetchGatepasses = async () => {
    try {
      const response = await api.get('/gatepass/history');
      setGatepasses(response.data.data.gatepasses);
    } catch (error) {
      console.error('Failed to fetch gatepasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    router.push(`/student/gatepass/${id}`);
  };

  const handleDelete = async (id, destination) => {
    if (!confirm(`Are you sure you want to delete the gatepass to ${destination}? This action cannot be undone.`)) {
      return;
    }

    const toastId = toast.loading('Deleting gatepass...');
    try {
      await api.delete(`/gatepass/${id}`);
      toast.success('Gatepass deleted successfully!', { id: toastId });
      fetchGatepasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete gatepass', { id: toastId });
    }
  };

  if (loading) {
    return <LoadingState text="Loading gatepass history..." />;
  }

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <motion.h1 
          className="text-3xl font-bold text-[var(--text-primary)]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          Gatepass History
        </motion.h1>
        <motion.button
          onClick={() => router.push('/student/create')}
          className="btn btn-primary"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Create New
        </motion.button>
      </div>

      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {gatepasses.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No gatepasses found</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Enrollment No</th>
                  <th>Destination</th>
                  <th>Reason</th>
                  <th>Leave Time</th>
                  <th>Return Time</th>
                  <th>Status</th>
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
                    <td>{gatepass.enrollment_number || 'N/A'}</td>
                    <td>{gatepass.destination}</td>
                    <td>{gatepass.reason}</td>
                    <td>{formatDateTime(gatepass.leave_time)}</td>
                    <td>{formatDateTime(gatepass.expected_return_time)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(gatepass.status)}`}>
                        {getStatusLabel(gatepass.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleViewDetails(gatepass.id)}
                          className="btn btn-sm btn-secondary"
                        >
                          View Details
                        </button>
                        {gatepass.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(gatepass.id, gatepass.destination)}
                            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
                            title="Delete"
                          >
                            🗑️ Delete
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
