const GatepassService = require('../services/gatepassService');
const { getPaginationMeta } = require('../utils/helpers');

class GatepassController {
  /**
   * Create new gatepass request
   */
  static create(req, res, next) {
    try {
      console.log('Creating gatepass with data:', req.body);
      console.log('User ID:', req.user.id);
      
      const gatepass = GatepassService.create(req.user.id, req.body);
      
      console.log('Gatepass created:', gatepass);
      
      res.status(201).json({
        success: true,
        message: 'Gatepass request created successfully',
        data: { gatepass }
      });
    } catch (error) {
      console.error('Error creating gatepass:', error);
      next(error);
    }
  }

  /**
   * Get gatepass history for student
   */
  static getHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status || null;
      
      const { gatepasses, total } = GatepassService.getHistory(req.user.id, page, limit, status);
      
      res.json({
        success: true,
        data: {
          gatepasses,
          pagination: getPaginationMeta(page, limit, total)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending requests (for coordinator/warden)
   */
  static getPending(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      
      console.log('Getting pending for role:', req.user.role);
      
      let result;
      if (req.user.role === 'coordinator') {
        result = GatepassService.getPendingForCoordinator(page, limit);
      } else if (req.user.role === 'warden') {
        result = GatepassService.getPendingForWarden(page, limit);
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      console.log('Found gatepasses:', result.gatepasses.length);
      
      res.json({
        success: true,
        data: {
          gatepasses: result.gatepasses,
          pagination: getPaginationMeta(page, limit, result.total)
        }
      });
    } catch (error) {
      console.error('Error getting pending:', error);
      next(error);
    }
  }

  /**
   * Get all gatepasses (for coordinator/warden history)
   */
  static getAllGatepasses(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const status = req.query.status || null;
      
      const result = GatepassService.getAllGatepasses(page, limit, status);
      
      res.json({
        success: true,
        data: {
          gatepasses: result.gatepasses,
          pagination: getPaginationMeta(page, limit, result.total)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get gatepass details
   */
  static getDetails(req, res, next) {
    try {
      const gatepassId = parseInt(req.params.id);
      const result = GatepassService.getDetails(gatepassId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve gatepass
   */
  static approve(req, res, next) {
    try {
      const gatepassId = parseInt(req.params.id);
      const { action, comments } = req.body;
      
      let gatepass;
      if (action === 'reject') {
        if (!comments) {
          return res.status(400).json({
            success: false,
            message: 'Comments are required for rejection'
          });
        }
        gatepass = GatepassService.reject(gatepassId, req.user.id, req.user.role, comments);
      } else {
        gatepass = GatepassService.approve(gatepassId, req.user.id, req.user.role, comments);
      }
      
      res.json({
        success: true,
        message: action === 'reject' ? 'Gatepass rejected' : 'Gatepass approved successfully',
        data: { gatepass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark exit
   */
  static async markExit(req, res, next) {
    try {
      const gatepassId = parseInt(req.params.id);
      const gatepass = await GatepassService.markExit(gatepassId, req.user.id);

      res.json({
        success: true,
        message: 'Exit marked successfully. Parent notified.',
        data: { gatepass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark return
   */
  static async markReturn(req, res, next) {
    try {
      const gatepassId = parseInt(req.params.id);
      const gatepass = await GatepassService.markReturn(gatepassId, req.user.id);

      res.json({
        success: true,
        message: 'Return marked successfully. Parent notified.',
        data: { gatepass }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete gatepass (student only, pending status only)
   */
  static deleteGatepass(req, res, next) {
    try {
      const gatepassId = parseInt(req.params.id);
      const gatepass = GatepassService.deleteGatepass(gatepassId, req.user.id);

      res.json({
        success: true,
        message: 'Gatepass deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = GatepassController;
