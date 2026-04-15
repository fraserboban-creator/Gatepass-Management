'use client';

import { motion } from 'framer-motion';
import { AlertCircle, X, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';

export default function ErrorPopup({ isOpen, onClose, title = '404 Error', message = 'Something went wrong.' }) {
  const router = useRouter();

  const handleReturnToDashboard = () => {
    onClose();
    router.push('/');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showClose={false} maxWidth="max-w-md">
      <div className="p-8 text-center">
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-5"
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-red-500" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl font-bold text-[var(--text-primary)] mb-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {title}
        </motion.h2>

        {/* Message */}
        <motion.p
          className="text-[var(--text-secondary)] mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[var(--border-primary)] text-[var(--text-secondary)] font-medium hover:bg-[var(--surface-hover)] transition-all"
          >
            Close
          </button>
          <button
            onClick={handleReturnToDashboard}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Dashboard
          </button>
        </motion.div>
      </div>
    </Modal>
  );
}
