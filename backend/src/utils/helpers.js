/**
 * Format date to ISO string
 */
function formatDate(date) {
  return new Date(date).toISOString();
}

/**
 * Check if date is in the past
 */
function isPast(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 */
function isFuture(date) {
  return new Date(date) > new Date();
}

/**
 * Calculate hours between two dates
 */
function hoursBetween(date1, date2) {
  const diff = Math.abs(new Date(date2) - new Date(date1));
  return Math.floor(diff / (1000 * 60 * 60));
}

/**
 * Sanitize user object (remove sensitive data)
 */
function sanitizeUser(user) {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

/**
 * Generate pagination metadata
 */
function getPaginationMeta(page, limit, total) {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
}

/**
 * Generate unique ID for visitor passes
 * Format: VIS-YYYYMMDD-XXXX
 * Example: VIS-20260313-1023
 */
function generateUniqueId(prefix = 'VIS') {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}-${year}${month}${day}-${randomNum}`;
}

module.exports = {
  formatDate,
  isPast,
  isFuture,
  hoursBetween,
  sanitizeUser,
  getPaginationMeta,
  generateUniqueId
};
