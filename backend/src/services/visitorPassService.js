const VisitorPassModel = require('../models/visitorPassModel');
const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const { generateUniqueId } = require('../utils/helpers');

class VisitorPassService {
  /**
   * Create visitor pass (student)
   */
  static createStudentPass(studentId, passData) {
    const student = UserModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const passId = generateUniqueId('VP');

    const visitorData = {
      visitor_name: passData.visitor_name,
      visitor_phone: passData.visitor_phone,
      visitor_id_type: passData.visitor_id_type,
      visitor_id_number: passData.visitor_id_number,
      relationship: passData.relationship,
      purpose: passData.purpose,
      student_id: studentId,
      student_name: student.full_name,
      room_number: student.room_number,
      expected_exit_time: passData.expected_exit_time,
      created_by: 'student',
      status: 'pending',
      pass_id: passId,
      visitor_photo_url: passData.visitor_photo_url || null
    };

    const passIdDb = VisitorPassModel.create(visitorData);

    // Notify security and coordinators
    const securityUsers = UserModel.findByRole('security');
    const coordinators = UserModel.findByRole('coordinator');

    const notificationMessage = `New visitor pass created: ${passData.visitor_name} visiting ${student.full_name} (Room ${student.room_number})`;

    for (const user of [...securityUsers, ...coordinators]) {
      NotificationModel.create({
        user_id: user.id,
        title: 'New Visitor Pass',
        message: notificationMessage,
        type: 'info'
      });
    }

    return VisitorPassModel.findById(passIdDb);
  }

  /**
   * Create visitor pass (security - walk-in)
   */
  static createSecurityPass(securityId, passData) {
    const student = UserModel.findById(passData.student_id);
    if (!student) {
      throw new Error('Student not found');
    }

    const passId = generateUniqueId('VP');

    const visitorData = {
      visitor_name: passData.visitor_name,
      visitor_phone: passData.visitor_phone,
      visitor_id_type: passData.visitor_id_type,
      visitor_id_number: passData.visitor_id_number,
      relationship: passData.relationship || 'Unknown',
      purpose: passData.purpose,
      student_id: passData.student_id,
      student_name: student.full_name,
      room_number: student.room_number,
      expected_exit_time: passData.expected_exit_time,
      created_by: 'security',
      status: 'approved',
      pass_id: passId,
      visitor_photo_url: passData.visitor_photo_url || null
    };

    const passIdDb = VisitorPassModel.create(visitorData);

    // Notify student
    NotificationModel.create({
      user_id: passData.student_id,
      title: 'Visitor Arrival',
      message: `${passData.visitor_name} has arrived to visit you. Pass ID: ${passId}`,
      type: 'info'
    });

    return VisitorPassModel.findById(passIdDb);
  }

  /**
   * Get visitor passes for student
   */
  static getStudentPasses(studentId, limit = 20, offset = 0) {
    const passes = VisitorPassModel.findByStudentId(studentId, limit, offset);
    const total = VisitorPassModel.count();

    return { passes, total };
  }

  /**
   * Get pending passes (for approval)
   */
  static getPendingPasses(limit = 50, offset = 0) {
    const passes = VisitorPassModel.findPending(limit, offset);
    const total = VisitorPassModel.count('pending');

    return { passes, total };
  }

  /**
   * Get active visitors
   */
  static getActiveVisitors() {
    return VisitorPassModel.findActive();
  }

  /**
   * Get all visitor passes
   */
  static getAllPasses(limit = 50, offset = 0, status = null, dateFrom = null, dateTo = null) {
    const passes = VisitorPassModel.findAll(limit, offset, status, dateFrom, dateTo);
    const total = VisitorPassModel.count(status);

    return { passes, total };
  }

  /**
   * Get visitor pass details
   */
  static getPassDetails(passId) {
    return VisitorPassModel.findById(passId);
  }

  /**
   * Approve visitor pass
   */
  static approvePass(passId) {
    const pass = VisitorPassModel.findById(passId);
    if (!pass) {
      throw new Error('Visitor pass not found');
    }

    VisitorPassModel.approve(passId);

    // Notify student
    const student = UserModel.findById(pass.student_id);
    NotificationModel.create({
      user_id: pass.student_id,
      title: 'Visitor Pass Approved',
      message: `Visitor pass for ${pass.visitor_name} has been approved. Pass ID: ${pass.pass_id}`,
      type: 'success'
    });

    return VisitorPassModel.findById(passId);
  }

  /**
   * Reject visitor pass
   */
  static rejectPass(passId) {
    const pass = VisitorPassModel.findById(passId);
    if (!pass) {
      throw new Error('Visitor pass not found');
    }

    VisitorPassModel.reject(passId);

    // Notify student
    NotificationModel.create({
      user_id: pass.student_id,
      title: 'Visitor Pass Rejected',
      message: `Visitor pass for ${pass.visitor_name} has been rejected.`,
      type: 'error'
    });

    return VisitorPassModel.findById(passId);
  }

  /**
   * Record visitor entry
   */
  static recordEntry(passId) {
    const pass = VisitorPassModel.findByPassId(passId);
    if (!pass) {
      throw new Error('Visitor pass not found');
    }

    if (pass.status !== 'approved') {
      throw new Error('Pass must be approved before entry');
    }

    VisitorPassModel.recordEntry(pass.id);

    // Notify student and security
    const student = UserModel.findById(pass.student_id);
    const securityUsers = UserModel.findByRole('security');

    NotificationModel.create({
      user_id: pass.student_id,
      title: 'Visitor Entered',
      message: `${pass.visitor_name} has entered the hostel.`,
      type: 'info'
    });

    for (const user of securityUsers) {
      NotificationModel.create({
        user_id: user.id,
        title: 'Visitor Entry Recorded',
        message: `${pass.visitor_name} entered to visit ${student.full_name} (Room ${pass.room_number})`,
        type: 'info'
      });
    }

    return VisitorPassModel.findById(pass.id);
  }

  /**
   * Record visitor exit
   */
  static recordExit(passId) {
    const pass = VisitorPassModel.findByPassId(passId);
    if (!pass) {
      throw new Error('Visitor pass not found');
    }

    if (pass.status !== 'active') {
      throw new Error('Visitor is not currently active');
    }

    VisitorPassModel.recordExit(pass.id);

    // Notify student and security
    const student = UserModel.findById(pass.student_id);
    const securityUsers = UserModel.findByRole('security');

    NotificationModel.create({
      user_id: pass.student_id,
      title: 'Visitor Exited',
      message: `${pass.visitor_name} has left the hostel.`,
      type: 'info'
    });

    for (const user of securityUsers) {
      NotificationModel.create({
        user_id: user.id,
        title: 'Visitor Exit Recorded',
        message: `${pass.visitor_name} exited from visiting ${student.full_name}`,
        type: 'info'
      });
    }

    return VisitorPassModel.findById(pass.id);
  }

  /**
   * Check and mark overdue visitors
   */
  static checkAndMarkOverdue() {
    const overdueVisitors = VisitorPassModel.findOverdue();
    let markedCount = 0;

    for (const visitor of overdueVisitors) {
      VisitorPassModel.markOverdue(visitor.id);
      markedCount++;

      // Notify student, security, and coordinator
      const student = UserModel.findById(visitor.student_id);
      const securityUsers = UserModel.findByRole('security');
      const coordinators = UserModel.findByRole('coordinator');

      const message = `Visitor ${visitor.visitor_name} has exceeded expected exit time in room ${visitor.room_number}`;

      NotificationModel.create({
        user_id: visitor.student_id,
        title: 'Visitor Overdue Alert',
        message: message,
        type: 'warning'
      });

      for (const user of [...securityUsers, ...coordinators]) {
        NotificationModel.create({
          user_id: user.id,
          title: 'Overdue Visitor Alert',
          message: message,
          type: 'warning'
        });
      }
    }

    return { marked: markedCount };
  }

  /**
   * Get statistics
   */
  static getStats(dateFrom = null, dateTo = null) {
    return VisitorPassModel.getStats(dateFrom, dateTo);
  }

  /**
   * Get today's statistics
   */
  static getTodayStats() {
    return VisitorPassModel.getTodayStats();
  }

  /**
   * Search visitor passes
   */
  static search(searchParams) {
    return VisitorPassModel.search(searchParams);
  }
}

module.exports = VisitorPassService;
