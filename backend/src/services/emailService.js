const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || process.env.SMTP_USER,
          pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
        }
      });
    } catch (error) {
      console.log('Email service not configured:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, html) {
    try {
      if (!this.transporter) {
        console.log('Email not configured. Would send:', { to, subject });
        return { success: false, message: 'Email service not configured' };
      }

      if (!process.env.EMAIL_USER && !process.env.SMTP_USER) {
        console.log('Email not configured. Would send:', { to, subject });
        return { success: false, message: 'Email service not configured' };
      }

      const fromUser = process.env.EMAIL_USER || process.env.SMTP_USER;

      const info = await this.transporter.sendMail({
        from: `"Hostel Gatepass System" <${fromUser}>`,
        to,
        subject,
        html
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send gatepass created notification
   */
  async sendGatepassCreated(userEmail, userName, gatepassId, destination) {
    const subject = 'Gatepass Request Submitted';
    const html = `
      <h2>Gatepass Request Submitted</h2>
      <p>Dear ${userName},</p>
      <p>Your gatepass request has been successfully submitted.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Gatepass ID: #${gatepassId}</li>
        <li>Destination: ${destination}</li>
        <li>Status: Pending Approval</li>
      </ul>
      <p>You will be notified once your request is reviewed.</p>
      <p>Best regards,<br>Hostel Gatepass Management System</p>
    `;
    return this.sendEmail(userEmail, subject, html);
  }

  /**
   * Send gatepass approved notification
   */
  async sendGatepassApproved(userEmail, userName, gatepassId, destination, approverRole) {
    const subject = 'Gatepass Approved';
    const html = `
      <h2>Gatepass Approved</h2>
      <p>Dear ${userName},</p>
      <p>Your gatepass request has been approved by the ${approverRole}.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Gatepass ID: #${gatepassId}</li>
        <li>Destination: ${destination}</li>
        <li>Status: Approved</li>
      </ul>
      <p>Please show your QR code at the gate when leaving.</p>
      <p>Best regards,<br>Hostel Gatepass Management System</p>
    `;
    return this.sendEmail(userEmail, subject, html);
  }

  /**
   * Send gatepass rejected notification
   */
  async sendGatepassRejected(userEmail, userName, gatepassId, destination, reason) {
    const subject = 'Gatepass Rejected';
    const html = `
      <h2>Gatepass Rejected</h2>
      <p>Dear ${userName},</p>
      <p>Unfortunately, your gatepass request has been rejected.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Gatepass ID: #${gatepassId}</li>
        <li>Destination: ${destination}</li>
        <li>Reason: ${reason}</li>
      </ul>
      <p>Please contact your coordinator for more information.</p>
      <p>Best regards,<br>Hostel Gatepass Management System</p>
    `;
    return this.sendEmail(userEmail, subject, html);
  }

  /**
   * Send pending approval notification to approvers
   */
  async sendPendingApproval(approverEmail, approverName, studentName, gatepassId, destination) {
    const subject = 'New Gatepass Pending Approval';
    const html = `
      <h2>New Gatepass Pending Approval</h2>
      <p>Dear ${approverName},</p>
      <p>A new gatepass request requires your approval.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Student: ${studentName}</li>
        <li>Gatepass ID: #${gatepassId}</li>
        <li>Destination: ${destination}</li>
      </ul>
      <p>Please log in to the system to review and approve/reject this request.</p>
      <p>Best regards,<br>Hostel Gatepass Management System</p>
    `;
    return this.sendEmail(approverEmail, subject, html);
  }
}

module.exports = new EmailService();
