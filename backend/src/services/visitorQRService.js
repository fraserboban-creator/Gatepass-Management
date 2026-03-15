const QRCode = require('qrcode');
const VisitorPassModel = require('../models/visitorPassModel');
const VisitorQRModel = require('../models/visitorQRModel');
const { encrypt, decrypt, generateHash } = require('../utils/encryption');

class VisitorQRService {
  /**
   * Generate QR code for visitor pass
   */
  static async generate(passId) {
    const pass = VisitorPassModel.findById(passId);
    
    if (!pass) {
      throw new Error('Visitor pass not found');
    }

    // Check if pass is approved or active
    const allowedStatuses = ['approved', 'active', 'exited'];
    if (!allowedStatuses.includes(pass.status)) {
      throw new Error('Visitor pass must be approved before generating QR code');
    }

    // Check if QR already exists and is valid
    let qrRecord = VisitorQRModel.findByPassId(passId);
    
    if (qrRecord) {
      // Return existing QR if still valid
      if (new Date(qrRecord.expires_at) > new Date()) {
        const qrImage = await QRCode.toDataURL(qrRecord.qr_data);
        return {
          qrCode: qrImage,
          qr_data: qrRecord.qr_data,
          expires_at: qrRecord.expires_at
        };
      } else {
        // Delete expired QR
        VisitorQRModel.deleteByPassId(passId);
      }
    }

    // Create QR data payload
    const payload = {
      pass_id: pass.pass_id,
      visitor_name: pass.visitor_name,
      student_id: pass.student_id,
      timestamp: new Date().toISOString()
    };

    // Encrypt payload
    const encryptedData = encrypt(JSON.stringify(payload));
    
    // Generate hash for verification
    const hash = generateHash(encryptedData);

    // Store in database
    VisitorQRModel.create({
      visitor_pass_id: passId,
      qr_data: encryptedData,
      qr_hash: hash,
      expires_at: pass.expected_exit_time
    });

    // Generate QR code image
    const qrImage = await QRCode.toDataURL(encryptedData);

    return {
      qrCode: qrImage,
      qr_data: encryptedData,
      expires_at: pass.expected_exit_time
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
      const qrRecord = VisitorQRModel.findByHash(hash);

      if (!qrRecord) {
        throw new Error('Invalid QR code');
      }

      // Check expiry
      if (new Date(qrRecord.expires_at) < new Date()) {
        throw new Error('QR code has expired');
      }

      // Get visitor pass details by pass_id
      const pass = VisitorPassModel.findByPassId(payload.pass_id);

      if (!pass) {
        throw new Error('Visitor pass not found');
      }

      // Check pass status
      const allowedStatuses = ['approved', 'active', 'exited'];
      if (!allowedStatuses.includes(pass.status)) {
        throw new Error('Visitor pass is not approved');
      }

      return pass;

    } catch (error) {
      throw new Error(`QR verification failed: ${error.message}`);
    }
  }
}

module.exports = VisitorQRService;
