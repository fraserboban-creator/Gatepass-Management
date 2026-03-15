const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);

/**
 * Encrypt data for QR code
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt QR code data
 */
function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate hash for verification
 */
function generateHash(data) {
  return crypto.createHmac('sha256', SECRET_KEY)
    .update(data)
    .digest('hex');
}

/**
 * Verify hash
 */
function verifyHash(data, hash) {
  const expectedHash = generateHash(data);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
}

module.exports = {
  encrypt,
  decrypt,
  generateHash,
  verifyHash
};
