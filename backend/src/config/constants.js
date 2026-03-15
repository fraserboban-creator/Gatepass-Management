module.exports = {
  ROLES: {
    STUDENT: 'student',
    COORDINATOR: 'coordinator',
    WARDEN: 'warden',
    SECURITY: 'security',
    ADMIN: 'admin'
  },
  
  GATEPASS_STATUS: {
    PENDING: 'pending',
    COORDINATOR_APPROVED: 'coordinator_approved',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
    COMPLETED: 'completed'
  },
  
  LOG_TYPES: {
    EXIT: 'exit',
    ENTRY: 'entry'
  },
  
  NOTIFICATION_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  }
};
