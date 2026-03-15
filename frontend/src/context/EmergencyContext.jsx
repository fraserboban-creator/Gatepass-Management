'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const [emergencyAlert, setEmergencyAlert] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const triggerEmergency = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const confirmEmergency = useCallback((alertData) => {
    setEmergencyAlert(alertData);
    setShowConfirmation(false);
  }, []);

  const cancelEmergency = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  const clearEmergency = useCallback(() => {
    setEmergencyAlert(null);
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        emergencyAlert,
        showConfirmation,
        triggerEmergency,
        confirmEmergency,
        cancelEmergency,
        clearEmergency,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within EmergencyProvider');
  }
  return context;
}
