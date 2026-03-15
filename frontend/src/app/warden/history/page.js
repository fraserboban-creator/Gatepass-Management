'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import LoadingState from '@/components/common/LoadingState';
import PageTransition from '@/components/common/PageTransition';
import { containerVariants, listItemVariants } from '@/lib/animations';

export default function WardenHistory() {
  const [gatepasses, setGatepasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchGatepasses();
  }, [filter]);

  const fetchGatepasses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gatepass/all?limit=100');
      let allGatepasses = response.data.data.gatepasses || [];

      if (filter !== 'all') {
        allGatepasses = allGatepasses.filter(g => g.status === filter);
      }

      setGatepasses(allGatepasses);
    } catch (error) {
      console.error('Failed to fetch gatepasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Coordinator Approved', value: 'coordinator_approved' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Completed', value: 'completed' },
  ];

  if (loading) {
    return <LoadingState fullScreen text="Loading history..." />;
  }

  return (
    <PageTransition>
      <motion.h1
        className="text-3xl font-bold mb-6 text-[var(--text-primary)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Gatepass History
      </motion.h1>

      {/* Filters */}
      <motion.div
        className="card mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <motion.button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`btn ${filter === f.value ? 'btn-primary' : 'btn-secondary'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {f.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {gatepasses.length === 0 ? (
          <p className="text-[var(--text-tertiary)] text-center py-8">No gatepasses found</p>
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
                  <th>Status</th>
                  <th>Created</th>
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
                    <td className="text-sm">{gatepass.reason}</td>
                    <td>{formatDateTime(gatepass.leave_time)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(gatepass.status)}`}>
                        {getStatusLabel(gatepass.status)}
                      </span>
                    </td>
                    <td className="text-sm text-[var(--text-secondary)]">
                      {formatDateTime(gatepass.created_at)}
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
