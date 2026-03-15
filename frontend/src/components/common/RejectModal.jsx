'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, AlertTriangle, X } from 'lucide-react';

const QUICK_REASONS = [
  'Incomplete information provided',
  'Outside allowed hours',
  'Destination not permitted',
  'Duplicate request',
  'Emergency situation - campus lockdown',
];

export default function RejectModal({ isOpen, onClose, onConfirm, gatepassId, studentName }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    await onConfirm(gatepassId, reason.trim());
    setSubmitting(false);
    onClose();
  };

  const handleQuickReason = (r) => setReason(r);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.85, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ rotate: -20, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                  >
                    <XCircle size={28} className="text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Reject Gatepass</h2>
                    {studentName && (
                      <p className="text-red-100 text-sm">Student: {studentName}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-red-100 hover:text-white transition-colors rounded-full p-1 hover:bg-red-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Warning */}
                <motion.div
                  className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700">
                    The student will be notified of this rejection with your reason.
                  </p>
                </motion.div>

                {/* Quick reasons */}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Quick reasons:</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_REASONS.map((r, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuickReason(r)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          reason === r
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
                        }`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {r}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Rejection reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a clear reason for rejection..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{reason.length} characters</p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 flex gap-3">
                <motion.button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConfirm}
                  disabled={!reason.trim() || submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: reason.trim() ? 1.02 : 1 }}
                  whileTap={{ scale: reason.trim() ? 0.98 : 1 }}
                >
                  {submitting ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Confirm Rejection
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
