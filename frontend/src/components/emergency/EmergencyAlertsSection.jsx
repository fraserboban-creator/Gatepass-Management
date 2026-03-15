'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/utils';

const statusColors = {
  active: 'bg-red-100 text-red-800 border-red-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
};

const statusIcons = {
  active: <AlertTriangle size={16} />,
  resolved: <CheckCircle size={16} />,
};

export default function EmergencyAlertsSection() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/emergency/active');
      setAlerts(response.data.data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch emergency alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    const toastId = toast.loading('Resolving alert...');
    try {
      await api.patch(`/emergency/${alertId}/resolve`);
      toast.success('Alert resolved successfully!', { id: toastId });
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert', { id: toastId });
    }
  };

  if (loading) {
    return (
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-center py-8 text-[var(--text-tertiary)]">Loading emergency alerts...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card border-l-4 border-red-600"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Emergency Alerts</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={refreshing}
          className="btn btn-sm btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-[var(--text-tertiary)] text-center py-8">No emergency alerts</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              className={`p-4 rounded-lg border-2 ${statusColors[alert.status] || statusColors.active}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {statusIcons[alert.status]}
                    <h3 className="font-semibold">{alert.student_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[alert.status]}`}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Student ID:</span>
                      <p className="font-medium">{alert.student_id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Room:</span>
                      <p className="font-medium">{alert.room_number}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Time:</span>
                      <p className="font-medium">{formatDateTime(alert.created_at)}</p>
                    </div>
                    {alert.location && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Location:</span>
                        <p className="font-medium text-xs">{alert.location}</p>
                      </div>
                    )}
                  </div>

                  {alert.status === 'active' && (
                    <motion.button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Mark as Resolved
                    </motion.button>
                  )}
                </div>

                {alert.status === 'active' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-red-600"
                  >
                    <AlertTriangle size={24} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
