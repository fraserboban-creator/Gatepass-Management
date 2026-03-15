'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { RefreshCw, AlertCircle } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  active: 'bg-blue-100 text-blue-800 border-blue-300',
  exited: 'bg-gray-100 text-gray-800 border-gray-300',
  overdue: 'bg-red-100 text-red-800 border-red-300'
};

export default function VisitorLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await api.get('/visitor-pass/all');
      setLogs(response.data.data.passes || []);
    } catch (error) {
      console.error('Failed to fetch visitor logs:', error);
      setError('Failed to load visitor logs. Please try again.');
      toast.error('Failed to load visitor logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-center py-8 text-[var(--text-tertiary)]">Loading visitor logs...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="card border-l-4 border-red-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <h3 className="font-semibold text-red-600 mb-1">Error Loading Visitor Logs</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchLogs}
            disabled={refreshing}
            className="btn btn-sm btn-secondary"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Visitor Logs</h2>
        <button
          onClick={fetchLogs}
          disabled={refreshing}
          className="btn btn-sm btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="text-[var(--text-tertiary)] text-center py-8">No visitor logs found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50 border-b border-blue-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Visitor Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Student Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Room</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Entry Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Exit Time</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-blue-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  className={`border-b border-blue-100 ${
                    index % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-blue-100 transition-colors duration-200`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                    {log.visitor_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {log.student_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {log.room_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {log.purpose.substring(0, 25)}{log.purpose.length > 25 ? '...' : ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {log.entry_time ? formatDateTime(log.entry_time) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {log.actual_exit_time ? formatDateTime(log.actual_exit_time) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[log.status] || statusColors.pending}`}>
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
