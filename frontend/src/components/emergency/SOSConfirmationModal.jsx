'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEmergency } from '@/context/EmergencyContext';
import { authService } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SOSConfirmationModal({ onConfirm, onCancel }) {
  const { confirmEmergency } = useEmergency();
  const [loading, setLoading] = useState(false);
  const user = authService.getUser();
  const pathname = usePathname();

  const handleSendAlert = async () => {
    setLoading(true);
    try {
      const alertData = {
        student_id: user.id,
        student_name: user.full_name,
        room_number: user.room_number || 'N/A',
        location: pathname,
        timestamp: new Date().toISOString(),
        status: 'active',
      };

      // Send emergency alert to backend
      await api.post('/emergency/alert', alertData);

      // Update context
      confirmEmergency(alertData);

      toast.success('Emergency alert sent to security and authorities!');
      onConfirm();
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      toast.error('Failed to send emergency alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-60 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          exit={{ y: 20 }}
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>

          {/* Alert Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          >
            <div className="p-4 bg-red-100 rounded-full">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle size={48} className="text-red-600" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
            Emergency Alert
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 mb-2 leading-relaxed">
            Are you in an emergency situation?
          </p>
          <p className="text-center text-sm text-gray-500 mb-8">
            This will immediately alert security, warden, and coordinator.
          </p>

          {/* Alert Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{user?.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Room:</span>
              <span className="font-medium text-gray-900">{user?.room_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSendAlert}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⏳
                  </motion.div>
                  Sending...
                </>
              ) : (
                'Send Alert'
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
