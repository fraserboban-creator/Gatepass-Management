'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useEmergency } from '@/context/EmergencyContext';
import { authService } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import SOSConfirmationModal from './SOSConfirmationModal';

export default function SOSButton() {
  const { triggerEmergency } = useEmergency();
  const [user, setUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  // Only show SOS button for students
  if (!user || user.role !== 'student') {
    return null;
  }

  const handleSOSClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    triggerEmergency();
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      {/* SOS Button */}
      <motion.button
        onClick={handleSOSClick}
        className="fixed bottom-24 right-8 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl hover:shadow-red-600/50 flex items-center justify-center gap-2 font-bold text-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <AlertTriangle size={24} />
        </motion.div>
      </motion.button>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <SOSConfirmationModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
