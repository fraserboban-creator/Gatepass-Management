const QRService = require('../services/qrService');

class QRController {
  /**
   * Generate QR code for gatepass
   */
  static async generate(req, res, next) {
    try {
      const gatepassId = parseInt(req.params.gatepass_id);
      const qrData = await QRService.generate(gatepassId);
      
      res.json({
        success: true,
        data: qrData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify QR code
   */
  static verify(req, res, next) {
    try {
      const { qrData } = req.body;
      
      const result = QRService.verify(qrData, req.user.id);
      
      res.json({
        success: true,
        message: 'QR code verified successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = QRController;
