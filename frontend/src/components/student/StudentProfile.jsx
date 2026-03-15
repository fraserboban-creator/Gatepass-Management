'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import LoadingState from '@/components/common/LoadingState';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { formatDateTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';
import { containerVariants, listItemVariants } from '@/lib/animations';
import { Mail, Phone, MapPin, Calendar, User } from 'lucide-react';

export default function StudentProfile({ studentId, userRole }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/student/${studentId}/profile`);
      setProfile(response.data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState fullScreen text="Loading student profile..." />;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-tertiary)]">Student profile not found</p>
      </div>
    );
  }

  const { user, analytics, recentGatepasses } = profile;

  return (
    <div className="space-y-8">
      {/* Student Information Card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {user.full_name}
              </h2>
              <p className="text-[var(--text-secondary)]">Student ID: {user.student_id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            className="flex items-center gap-3 p-3 bg-[var(--surface-hover)] rounded-lg"
            variants={listItemVariants}
          >
            <Mail size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Email</p>
              <p className="text-[var(--text-primary)]">{user.email}</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 p-3 bg-[var(--surface-hover)] rounded-lg"
            variants={listItemVariants}
          >
            <Phone size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Phone</p>
              <p className="text-[var(--text-primary)]">{user.phone || 'N/A'}</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 p-3 bg-[var(--surface-hover)] rounded-lg"
            variants={listItemVariants}
          >
            <MapPin size={20} className="text-red-600" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Hostel</p>
              <p className="text-[var(--text-primary)]">
                {user.hostel_block} - Room {user.room_number}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 p-3 bg-[var(--surface-hover)] rounded-lg"
            variants={listItemVariants}
          >
            <Calendar size={20} className="text-purple-600" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Member Since</p>
              <p className="text-[var(--text-primary)]">
                {formatDateTime(user.created_at).split(' ')[0]}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 p-3 bg-[var(--surface-hover)] rounded-lg"
            variants={listItemVariants}
          >
            <User size={20} className="text-yellow-600" />
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Status</p>
              <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="flex gap-2 border-b border-[var(--border-primary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'info'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Gatepass History
        </button>
      </motion.div>

      {/* Analytics Tab */}
      {activeTab === 'info' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnalyticsDashboard role={userRole} studentId={studentId} />
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Gatepass History
          </h3>

          {recentGatepasses && recentGatepasses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Destination</th>
                    <th>Reason</th>
                    <th>Leave Time</th>
                    <th>Return Time</th>
                    <th>Status</th>
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
                      <td>#{gatepass.id}</td>
                      <td>{gatepass.destination}</td>
                      <td>{gatepass.reason}</td>
                      <td>{formatDateTime(gatepass.leave_time)}</td>
                      <td>
                        {gatepass.actual_return_time
                          ? formatDateTime(gatepass.actual_return_time)
                          : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(gatepass.status)}`}>
                          {getStatusLabel(gatepass.status)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          ) : (
            <p className="text-[var(--text-tertiary)] text-center py-8">
              No gatepass history available
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
