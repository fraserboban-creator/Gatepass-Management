const GatepassModel = require('../models/gatepassModel');
const ApprovalModel = require('../models/approvalModel');
const NotificationService = require('./notificationService');
const ParentNotificationService = require('./parentNotificationService');
const { GATEPASS_STATUS } = require('../config/constants');
const { isFuture, isPast } = require('../utils/helpers');

class GatepassService {
  /**
   * Create a new gatepass request
   */
  static create(studentId, gatepassData) {
    // Validate dates
    if (isPast(gatepassData.leave_time)) {
      throw new Error('Leave time cannot be in the past');
    }

    if (new Date(gatepassData.expected_return_time) <= new Date(gatepassData.leave_time)) {
      throw new Error('Return time must be after leave time');
    }

    // Create gatepass
    const gatepassId = GatepassModel.create({
      student_id: studentId,
      ...gatepassData,
      status: GATEPASS_STATUS.PENDING
    });

    // Notify coordinators
    NotificationService.notifyCoordinators(gatepassId, 'New gatepass request pending approval');

    return GatepassModel.findById(gatepassId);
  }

  /**
   * Approve gatepass (coordinator or warden)
   */
  static approve(gatepassId, approverId, approverRole, comments = null) {
    const gatepass = GatepassModel.findById(gatepassId);
    
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    let newStatus;
    
    if (approverRole === 'coordinator') {
      if (gatepass.status !== GATEPASS_STATUS.PENDING) {
        throw new Error('Gatepass is not in pending state');
      }
      newStatus = GATEPASS_STATUS.COORDINATOR_APPROVED;
      
      // Notify warden
      NotificationService.notifyWardens(gatepassId, 'Gatepass approved by coordinator, awaiting final approval');
    } else if (approverRole === 'warden') {
      if (gatepass.status !== GATEPASS_STATUS.COORDINATOR_APPROVED) {
        throw new Error('Gatepass must be approved by coordinator first');
      }
      newStatus = GATEPASS_STATUS.APPROVED;
      
      // Notify student
      NotificationService.notifyUser(gatepass.student_id, gatepassId, 'Your gatepass has been approved', 'success');

      // Notify parent on final approval (fire-and-forget, don't break workflow)
      const updatedForParent = GatepassModel.findById(gatepassId);
      ParentNotificationService.notifyParentOnApproval(updatedForParent, gatepass.student_id).catch(err =>
        console.error('Parent approval notification failed:', err)
      );
    } else {
      throw new Error('Invalid approver role');
    }

    // Update gatepass status
    GatepassModel.updateStatus(gatepassId, newStatus, approverId, approverRole);

    // Create approval record
    ApprovalModel.create({
      gatepass_id: gatepassId,
      approver_id: approverId,
      approver_role: approverRole,
      action: 'approved',
      comments
    });

    return GatepassModel.findById(gatepassId);
  }

  /**
   * Reject gatepass
   */
  static reject(gatepassId, approverId, approverRole, comments) {
    const gatepass = GatepassModel.findById(gatepassId);
    
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    if (gatepass.status === GATEPASS_STATUS.REJECTED || gatepass.status === GATEPASS_STATUS.APPROVED) {
      throw new Error('Gatepass already processed');
    }

    // Update status
    GatepassModel.updateStatus(gatepassId, GATEPASS_STATUS.REJECTED);

    // Create approval record
    ApprovalModel.create({
      gatepass_id: gatepassId,
      approver_id: approverId,
      approver_role: approverRole,
      action: 'rejected',
      comments
    });

    // Notify student
    NotificationService.notifyUser(gatepass.student_id, gatepassId, 'Your gatepass has been rejected', 'error');

    return GatepassModel.findById(gatepassId);
  }

  /**
   * Get gatepass history for student
   */
  static getHistory(studentId, page = 1, limit = 20, status = null) {
    const offset = (page - 1) * limit;
    const gatepasses = GatepassModel.findByStudentId(studentId, limit, offset, status);
    const total = GatepassModel.count(studentId, status);
    
    return { gatepasses, total };
  }

  /**
   * Get pending requests for coordinator
   */
  static getPendingForCoordinator(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const gatepasses = GatepassModel.findPendingForCoordinator(limit, offset);
    const total = GatepassModel.count(null, GATEPASS_STATUS.PENDING);
    
    return { gatepasses, total };
  }

  /**
   * Get pending requests for warden
   */
  static getPendingForWarden(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const gatepasses = GatepassModel.findPendingForWarden(limit, offset);
    const total = GatepassModel.count(null, GATEPASS_STATUS.COORDINATOR_APPROVED);
    
    return { gatepasses, total };
  }

  /**
   * Get all gatepasses with details
   */
  static getAllGatepasses(page = 1, limit = 50, status = null) {
    const offset = (page - 1) * limit;
    const gatepasses = GatepassModel.findAllWithDetails(limit, offset, status);
    const total = GatepassModel.count(null, status);
    
    return { gatepasses, total };
  }

  /**
   * Get gatepass details with approvals
   */
  static getDetails(gatepassId) {
    const gatepass = GatepassModel.findById(gatepassId);
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    const approvals = ApprovalModel.findByGatepassId(gatepassId);
    
    return { ...gatepass, approvals };
  }

  /**
   * Mark exit time
   */
  static async markExit(gatepassId, securityId) {
    const gatepass = GatepassModel.findById(gatepassId);
    
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    if (gatepass.status !== GATEPASS_STATUS.APPROVED && gatepass.status !== GATEPASS_STATUS.COORDINATOR_APPROVED) {
      throw new Error('Gatepass must be approved before exit');
    }

    if (gatepass.actual_exit_time) {
      throw new Error('Exit already marked');
    }

    GatepassModel.markExit(gatepassId);
    
    // Create log entry
    const LogModel = require('../models/logModel');
    LogModel.create({
      gatepass_id: gatepassId,
      student_id: gatepass.student_id,
      security_id: securityId,
      log_type: 'exit',
      notes: `Student exited for ${gatepass.destination}`
    });
    
    // Get updated gatepass
    const updatedGatepass = GatepassModel.findById(gatepassId);
    
    // Notify parent about exit
    await ParentNotificationService.notifyParentOnExit(updatedGatepass, { id: gatepass.student_id });
    
    return updatedGatepass;
  }

  /**
   * Mark return time
   */
  static async markReturn(gatepassId, securityId) {
    const gatepass = GatepassModel.findById(gatepassId);
    
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    if (!gatepass.actual_exit_time) {
      throw new Error('Exit must be marked before return');
    }

    if (gatepass.actual_return_time) {
      throw new Error('Return already marked');
    }

    GatepassModel.markReturn(gatepassId);
    
    // Update status to completed
    GatepassModel.updateStatus(gatepassId, GATEPASS_STATUS.COMPLETED);
    
    // Create log entry
    const LogModel = require('../models/logModel');
    LogModel.create({
      gatepass_id: gatepassId,
      student_id: gatepass.student_id,
      security_id: securityId,
      log_type: 'entry',
      notes: `Student returned from ${gatepass.destination}`
    });
    
    // Get updated gatepass
    const updatedGatepass = GatepassModel.findById(gatepassId);
    
    // Notify parent about return
    await ParentNotificationService.notifyParentOnReturn(updatedGatepass, { id: gatepass.student_id });
    
    return updatedGatepass;
  }

  /**
   * Delete gatepass (only pending requests)
   */
  static deleteGatepass(gatepassId, studentId) {
    const gatepass = GatepassModel.findById(gatepassId);
    
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    // Verify ownership
    if (gatepass.student_id !== studentId) {
      throw new Error('You can only delete your own gatepasses');
    }

    // Only allow deletion of pending requests
    if (gatepass.status !== GATEPASS_STATUS.PENDING) {
      throw new Error('Only pending gatepasses can be deleted');
    }

    // Delete the gatepass
    GatepassModel.delete(gatepassId);
    
    return true;
  }
}

module.exports = GatepassService;
