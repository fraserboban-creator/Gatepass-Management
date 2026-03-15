const QRCode = require('qrcode');
const GatepassModel = require('../models/gatepassModel');
const QRModel = require('../models/qrModel');
const LogModel = require('../models/logModel');
const { encrypt, decrypt, generateHash, verifyHash } = require('../utils/encryption');
const { GATEPASS_STATUS } = require('../config/constants');

class QRService {
  /**
   * Generate QR code for approved gatepass
   */
  static async generate(gatepassId) {
    const gatepass = GatepassModel.findById(gatepassId);
    
    if (!gatepass) {
      throw new Error('Gatepass not found');
    }

    // Allow QR generation for coordinator_approved, approved, and completed statuses
    const allowedStatuses = [GATEPASS_STATUS.COORDINATOR_APPROVED, GATEPASS_STATUS.APPROVED, GATEPASS_STATUS.COMPLETED];
    if (!allowedStatuses.includes(gatepass.status)) {
      throw new Error('Gatepass must be approved before generating QR code');
    }

    // Check if QR already exists
    let qrRecord = QRModel.findByGatepassId(gatepassId);
    
    if (qrRecord) {
      // Return existing QR if still valid
      if (new Date(qrRecord.expires_at) > new Date()) {
        const qrImage = await QRCode.toDataURL(qrRecord.qr_data);
        return {
          qrCode: qrImage,
          qr_data: qrRecord.qr_data,
          expires_at: qrRecord.expires_at
        };
      }
    }

    // Create QR data payload
    const payload = {
      gatepass_id: gatepassId,
      student_id: gatepass.student_id,
      timestamp: new Date().toISOString()
    };

    // Encrypt payload
    const encryptedData = encrypt(JSON.stringify(payload));
    
    // Generate hash for verification
    const hash = generateHash(encryptedData);

    // Store in database
    QRModel.create({
      gatepass_id: gatepassId,
      qr_data: encryptedData,
      qr_hash: hash,
      expires_at: gatepass.expected_return_time
    });

    // Generate QR code image
    const qrImage = await QRCode.toDataURL(encryptedData);

    return {
      qrCode: qrImage,
      qr_data: encryptedData,
      expires_at: gatepass.expected_return_time
    };
  }

  /**
   * Verify QR code
   */
  static verify(qrData, securityId) {
    try {
      // Decrypt QR data
      const decryptedData = decrypt(qrData);
      const payload = JSON.parse(decryptedData);

      // Verify hash
      const hash = generateHash(qrData);
      const qrRecord = QRModel.findByHash(hash);

      if (!qrRecord) {
        throw new Error('Invalid QR code');
      }

      // Check expiry
      if (new Date(qrRecord.expires_at) < new Date()) {
        throw new Error('QR code has expired');
      }

      // Get gatepass details
      const gatepass = GatepassModel.findById(payload.gatepass_id);

      if (!gatepass) {
        throw new Error('Gatepass not found');
      }

      // Allow verification for coordinator_approved, approved, and completed statuses
      const allowedStatuses = [GATEPASS_STATUS.COORDINATOR_APPROVED, GATEPASS_STATUS.APPROVED, GATEPASS_STATUS.COMPLETED];
      if (!allowedStatuses.includes(gatepass.status)) {
        throw new Error('Gatepass is not approved');
      }

      return gatepass;

    } catch (error) {
      throw new Error(`QR verification failed: ${error.message}`);
    }
  }
}

module.exports = QRService;
