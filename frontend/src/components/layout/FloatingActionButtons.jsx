'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { useEmergency } from '@/context/EmergencyContext';
import { authService } from '@/lib/auth';
import SOSConfirmationModal from '@/components/emergency/SOSConfirmationModal';
import HelpPanel from '@/components/help/HelpPanel';

export default function FloatingActionButtons() {
  const { triggerEmergency } = useEmergency();
  const [user, setUser] = useState(null);
  const [showSOSConfirmation, setShowSOSConfirmation] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const handleSOSClick = () => {
    setShowSOSConfirmation(true);
  };

  const handleSOSConfirm = () => {
    triggerEmergency();
    setShowSOSConfirmation(false);
  };

  const handleSOSCancel = () => {
    setShowSOSConfirmation(false);
  };

  return (
    <>
      {/* Floating Action Buttons Container */}
      <motion.div
        className="fixed bottom-8 right-8 z-40 flex gap-3 items-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* SOS Button - Only for students */}
        {user?.role === 'student' && (
          <motion.button
            onClick={handleSOSClick}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg hover:shadow-red-600/50 flex items-center justify-center font-bold text-sm transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Emergency SOS"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <AlertTriangle size={24} />
            </motion.div>
          </motion.button>
        )}

        {/* Help Button - For all users */}
        <motion.button
          onClick={() => setShowHelpPanel(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-blue-600/50 flex items-center justify-center transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Help & Troubleshooting"
        >
          <HelpCircle size={24} />
        </motion.button>
      </motion.div>

      {/* SOS Confirmation Modal */}
      {showSOSConfirmation && (
        <SOSConfirmationModal
          onConfirm={handleSOSConfirm}
          onCancel={handleSOSCancel}
        />
      )}

      {/* Help Panel */}
      <HelpPanel isOpen={showHelpPanel} onClose={() => setShowHelpPanel(false)} />
    </>
  );
}
