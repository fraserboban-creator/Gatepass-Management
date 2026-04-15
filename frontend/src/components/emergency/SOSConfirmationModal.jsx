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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all disabled:opacity-50"
          >
            <X size={18} />
          </button>

          {/* Alert Icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 20 }}
          >
            <div className="p-4 bg-red-100 rounded-full">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <AlertTriangle size={48} className="text-red-600" />
              </motion.div>
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">Emergency Alert</h2>
          <p className="text-center text-[var(--text-secondary)] mb-1 leading-relaxed">Are you in an emergency situation?</p>
          <p className="text-center text-sm text-[var(--text-tertiary)] mb-6">
            This will immediately alert security, warden, and coordinator.
          </p>

          {/* Alert Details */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 space-y-2">
            {[
              ['Name', user?.full_name],
              ['Room', user?.room_number || 'N/A'],
              ['Time', new Date().toLocaleTimeString()],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-red-700">{label}:</span>
                <span className="font-medium text-red-900">{val}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-primary)] text-[var(--text-primary)] font-medium hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSendAlert}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : 'Send Alert'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
