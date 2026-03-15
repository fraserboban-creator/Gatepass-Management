const VisitorPassService = require('../services/visitorPassService');
const VisitorQRService = require('../services/visitorQRService');
const NotificationModel = require('../models/notificationModel');
const UserModel = require('../models/userModel');
const { getPaginationMeta } = require('../utils/helpers');

class VisitorPassController {
  /**
   * Create visitor pass (student)
   */
  static createStudentPass(req, res, next) {
    try {
      const pass = VisitorPassService.createStudentPass(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Visitor pass created successfully',
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create visitor pass (security)
   */
  static createSecurityPass(req, res, next) {
    try {
      const pass = VisitorPassService.createSecurityPass(req.user.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Visitor pass created successfully',
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get visitor passes for student
   */
  static getStudentPasses(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = VisitorPassService.getStudentPasses(req.user.id, limit, (page - 1) * limit);

      res.json({
        success: true,
        data: {
          passes: result.passes,
          pagination: getPaginationMeta(page, limit, result.total)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending passes (for approval)
   */
  static getPendingPasses(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = VisitorPassService.getPendingPasses(limit, (page - 1) * limit);

      res.json({
        success: true,
        data: {
          passes: result.passes,
          pagination: getPaginationMeta(page, limit, result.total)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active visitors
   */
  static getActiveVisitors(req, res, next) {
    try {
      const visitors = VisitorPassService.getActiveVisitors();

      res.json({
        success: true,
        data: {
          visitors,
          count: visitors.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all visitor passes
   */
  static getAllPasses(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const status = req.query.status || null;
      const dateFrom = req.query.dateFrom || null;
      const dateTo = req.query.dateTo || null;

      const result = VisitorPassService.getAllPasses(
        limit,
        (page - 1) * limit,
        status,
        dateFrom,
        dateTo
      );

      res.json({
        success: true,
        data: {
          passes: result.passes,
          pagination: getPaginationMeta(page, limit, result.total)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get visitor pass details
   */
  static getPassDetails(req, res, next) {
    try {
      const passId = parseInt(req.params.id);
      const pass = VisitorPassService.getPassDetails(passId);

      if (!pass) {
        return res.status(404).json({
          success: false,
          message: 'Visitor pass not found'
        });
      }

      res.json({
        success: true,
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve visitor pass
   */
  static approvePass(req, res, next) {
    try {
      const passId = parseInt(req.params.id);
      const pass = VisitorPassService.approvePass(passId);

      res.json({
        success: true,
        message: 'Visitor pass approved',
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject visitor pass
   */
  static rejectPass(req, res, next) {
    try {
      const passId = parseInt(req.params.id);
      const pass = VisitorPassService.rejectPass(passId);

      res.json({
        success: true,
        message: 'Visitor pass rejected',
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record visitor entry
   */
  static recordEntry(req, res, next) {
    try {
      const passId = req.body.pass_id;
      const pass = VisitorPassService.recordEntry(passId);

      res.json({
        success: true,
        message: 'Visitor entry recorded',
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record visitor exit
   */
  static recordExit(req, res, next) {
    try {
      const passId = req.body.pass_id;
      const pass = VisitorPassService.recordExit(passId);

      res.json({
        success: true,
        message: 'Visitor exit recorded',
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics
   */
  static getStats(req, res, next) {
    try {
      const dateFrom = req.query.dateFrom || null;
      const dateTo = req.query.dateTo || null;

      const stats = VisitorPassService.getStats(dateFrom, dateTo);

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get today's statistics
   */
  static getTodayStats(req, res, next) {
    try {
      const stats = VisitorPassService.getTodayStats();

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search visitor passes
   */
  static search(req, res, next) {
    try {
      const query = req.query.q || '';
      const status = req.query.status || null;
      const dateFrom = req.query.dateFrom || null;
      const dateTo = req.query.dateTo || null;
      const limit = parseInt(req.query.limit) || 20;

      const passes = VisitorPassService.search({
        query,
        status,
        dateFrom,
        dateTo,
        limit
      });

      res.json({
        success: true,
        data: { passes }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate QR code for visitor pass
   */
  static async generateQR(req, res, next) {
    try {
      const passId = parseInt(req.params.id);
      
      // Generate QR code
      const qrData = await VisitorQRService.generate(passId);
      
      // Get pass details for notification
      const pass = VisitorPassService.getPassDetails(passId);
      
      // Notify security personnel
      const securityUsers = UserModel.findByRole('security');
      const notificationMessage = `Visitor pass viewed: ${pass.visitor_name} visiting ${pass.student_name} (Room ${pass.room_number})`;
      
      for (const user of securityUsers) {
        NotificationModel.create({
          user_id: user.id,
          title: 'Visitor Pass Viewed',
          message: notificationMessage,
          type: 'info'
        });
      }
      
      res.json({
        success: true,
        data: qrData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify visitor pass QR code
   */
  static verifyQR(req, res, next) {
    try {
      const { qrData } = req.body;
      const pass = VisitorQRService.verify(qrData, req.user.id);
      
      res.json({
        success: true,
        data: { pass }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VisitorPassController;
