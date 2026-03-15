'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StudentProfile from './StudentProfile';
import { X } from 'lucide-react';

export default function StudentProfileModal({ studentId, userRole, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[var(--bg-secondary)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-primary)] shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Student Profile</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <StudentProfile studentId={studentId} userRole={userRole} />
        </div>
      </motion.div>
    </motion.div>
  );
}
