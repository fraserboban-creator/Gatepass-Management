const emailService = require('./emailService');
const UserModel = require('../models/userModel');

class ParentNotificationService {
  /**
   * Check if parent notifications are enabled for a student
   */
  static isEnabled(studentData) {
    return !!(studentData && studentData.parent_email && studentData.parent_notification_enabled);
  }

  /**
   * Notify parent when gatepass is CREATED by student
   */
  static async notifyParentOnCreation(gatepass, studentId) {
    try {
      const studentData = UserModel.findById(studentId);
      if (!this.isEnabled(studentData)) return { success: false, message: 'Parent notifications disabled or not configured' };

      const parentName = studentData.parent_name || 'Parent';
      const studentName = studentData.full_name;
      const leaveTime = new Date(gatepass.leave_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      const returnTime = new Date(gatepass.expected_return_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

      const subject = `Gatepass Request Created – ${studentName}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#3B82F6;">📋 Gatepass Request Created</h2>
          <p>Dear ${parentName},</p>
          <p>Your ward <strong>${studentName}</strong> has submitted a gatepass request. Please stay informed.</p>
          <div style="background:#EFF6FF;padding:20px;border-radius:8px;border-left:4px solid #3B82F6;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;"><strong>Student:</strong></td><td>${studentName}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Destination:</strong></td><td>${gatepass.destination}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Reason:</strong></td><td>${gatepass.reason}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Planned Leave:</strong></td><td>${leaveTime}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Expected Return:</strong></td><td style="color:#F59E0B;font-weight:bold;">${returnTime}</td></tr>
            </table>
          </div>
          <p style="color:#6B7280;font-size:13px;">The request is currently pending approval. You will receive further updates.</p>
          <p style="color:#6B7280;font-size:13px;">Hostel Gatepass Management System</p>
        </div>`;

      return await emailService.sendEmail(studentData.parent_email, subject, html);
    } catch (error) {
      console.error('Error notifying parent on creation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify parent when gatepass is approved
   */
  static async notifyParentOnApproval(gatepass, studentId) {
    try {
      const studentData = UserModel.findById(studentId);
      if (!this.isEnabled(studentData)) return { success: false, message: 'Parent notifications disabled or not configured' };

      const parentName = studentData.parent_name || 'Parent';
      const studentName = studentData.full_name;
      const leaveTime = new Date(gatepass.leave_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      const returnTime = new Date(gatepass.expected_return_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

      const subject = `Gatepass Approved – ${studentName}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#10B981;">✅ Gatepass Approved</h2>
          <p>Dear ${parentName},</p>
          <p>Your ward's gatepass request has been approved.</p>
          <div style="background:#F0FDF4;padding:20px;border-radius:8px;border-left:4px solid #10B981;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;"><strong>Student:</strong></td><td>${studentName}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Destination:</strong></td><td>${gatepass.destination}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Reason:</strong></td><td>${gatepass.reason}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Leave Time:</strong></td><td>${leaveTime}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Expected Return:</strong></td><td style="color:#F59E0B;font-weight:bold;">${returnTime}</td></tr>
            </table>
          </div>
          <p style="color:#6B7280;font-size:13px;">Hostel Gatepass Management System</p>
        </div>`;

      return await emailService.sendEmail(studentData.parent_email, subject, html);
    } catch (error) {
      console.error('Error notifying parent on approval:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify parent when student exits hostel
   */
  static async notifyParentOnExit(gatepass, student) {
    try {
      // Get student with parent details
      const studentData = UserModel.findById(student.id);
      
      if (!this.isEnabled(studentData)) {
        console.log('Parent notifications disabled or not configured for student:', student.id);
        return { success: false, message: 'Parent notifications disabled or not configured' };
      }

      const parentName = studentData.parent_name || 'Parent';
      const studentName = studentData.full_name;
      const exitTime = new Date(gatepass.actual_exit_time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      const expectedReturn = new Date(gatepass.expected_return_time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const subject = `Student Exit Alert - ${studentName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">🚪 Student Exit Notification</h2>
          <p>Dear ${parentName},</p>
          <p>This is to inform you that your ward has exited the hostel premises.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">Exit Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Student Name:</strong></td>
                <td style="padding: 8px 0;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Exit Time:</strong></td>
                <td style="padding: 8px 0;">${exitTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Destination:</strong></td>
                <td style="padding: 8px 0;">${gatepass.destination}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Reason:</strong></td>
                <td style="padding: 8px 0;">${gatepass.reason}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Expected Return:</strong></td>
                <td style="padding: 8px 0; color: #F59E0B; font-weight: bold;">${expectedReturn}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Contact Number:</strong></td>
                <td style="padding: 8px 0;">${gatepass.contact_number}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6B7280; font-size: 14px;">
            This is an automated notification from the Hostel Gatepass Management System. 
            You will receive another notification when your ward returns to the hostel.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              Hostel Gatepass Management System<br>
              For any concerns, please contact the hostel administration.
            </p>
          </div>
        </div>
      `;

      const result = await emailService.sendEmail(studentData.parent_email, subject, html);
      
      // Also send SMS if parent phone is available
      if (studentData.parent_phone) {
        await this.sendParentSMS(
          studentData.parent_phone,
          `Your ward ${studentName} exited hostel at ${exitTime}. Expected return: ${expectedReturn}. Destination: ${gatepass.destination}`
        );
      }

      return result;
    } catch (error) {
      console.error('Error notifying parent on exit:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify parent when student returns to hostel
   */
  static async notifyParentOnReturn(gatepass, student) {
    try {
      const studentData = UserModel.findById(student.id);
      
      if (!this.isEnabled(studentData)) {
        console.log('Parent notifications disabled or not configured for student:', student.id);
        return { success: false, message: 'Parent notifications disabled or not configured' };
      }

      const parentName = studentData.parent_name || 'Parent';
      const studentName = studentData.full_name;
      const returnTime = new Date(gatepass.actual_return_time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      const exitTime = new Date(gatepass.actual_exit_time).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      const subject = `Student Return Alert - ${studentName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">✅ Student Return Notification</h2>
          <p>Dear ${parentName},</p>
          <p>This is to inform you that your ward has safely returned to the hostel premises.</p>
          
          <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <h3 style="margin-top: 0; color: #1F2937;">Return Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Student Name:</strong></td>
                <td style="padding: 8px 0;">${studentName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Return Time:</strong></td>
                <td style="padding: 8px 0; color: #10B981; font-weight: bold;">${returnTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Exit Time:</strong></td>
                <td style="padding: 8px 0;">${exitTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Destination:</strong></td>
                <td style="padding: 8px 0;">${gatepass.destination}</td>
              </tr>
            </table>
          </div>

          <p style="color: #059669; font-weight: 500;">
            ✓ Your ward has returned safely to the hostel.
          </p>

          <p style="color: #6B7280; font-size: 14px;">
            This is an automated notification from the Hostel Gatepass Management System.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
              Hostel Gatepass Management System<br>
              For any concerns, please contact the hostel administration.
            </p>
          </div>
        </div>
      `;

      const result = await emailService.sendEmail(studentData.parent_email, subject, html);
      
      // Also send SMS if parent phone is available
      if (studentData.parent_phone) {
        await this.sendParentSMS(
          studentData.parent_phone,
          `Your ward ${studentName} returned to hostel at ${returnTime}. Status: Safe.`
        );
      }

      return result;
    } catch (error) {
      console.error('Error notifying parent on return:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify parent when student is overdue
   */
  static async notifyParentOnOverdue(gatepass, studentId) {
    try {
      const studentData = UserModel.findById(studentId);
      if (!this.isEnabled(studentData)) return { success: false, message: 'Parent notifications disabled or not configured' };

      const parentName = studentData.parent_name || 'Parent';
      const studentName = studentData.full_name;
      const expectedReturn = new Date(gatepass.expected_return_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

      const subject = `⚠️ Overdue Alert – ${studentName}`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#EF4444;">⚠️ Overdue Return Alert</h2>
          <p>Dear ${parentName},</p>
          <p>Your ward <strong>${studentName}</strong> has not returned to the hostel by the expected time.</p>
          <div style="background:#FEF2F2;padding:20px;border-radius:8px;border-left:4px solid #EF4444;margin:20px 0;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:6px 0;"><strong>Student:</strong></td><td>${studentName}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Destination:</strong></td><td>${gatepass.destination}</td></tr>
              <tr><td style="padding:6px 0;"><strong>Expected Return:</strong></td><td style="color:#EF4444;font-weight:bold;">${expectedReturn}</td></tr>
            </table>
          </div>
          <p>Please contact your ward or the hostel administration immediately.</p>
          <p style="color:#6B7280;font-size:13px;">Hostel Gatepass Management System</p>
        </div>`;

      return await emailService.sendEmail(studentData.parent_email, subject, html);
    } catch (error) {
      console.error('Error notifying parent on overdue:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS to parent (placeholder - integrate with SMS gateway)
   */
  static async sendParentSMS(phoneNumber, message) {
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return { success: true, message: 'SMS logged (integration pending)' };
  }
}

module.exports = ParentNotificationService;
